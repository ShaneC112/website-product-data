import {randomUUID} from 'node:crypto'
import type {AssetUpload, SanityImage, SanityIngestionPlan, SanityProductDraft} from './ingestion.js'
import {buildInitialSourceFields, mergeProductUpdate} from './mergeProductUpdate.js'
import {evaluatePublicationGate} from './publicationGate.js'

export type PublishDraftResult =
  | {outcome: 'draft'; draftId: string; assetIds: string[]; conflictCount: number}
  | {outcome: 'candidate'; candidateId: string; blockingReasons: string[]}

export type SanityPublisherClient = {
  fetch<T>(query: string, params?: Record<string, unknown>, options?: {perspective?: string}): Promise<T>
  create(document: {_type: string; [key: string]: unknown}): Promise<{_id: string}>
  createOrReplace(document: {_id: string; _type: string; [key: string]: unknown}): Promise<unknown>
  assets: {
    upload(type: 'image', body: Blob, options?: {filename?: string}): Promise<{_id: string}>
  }
}

type ExistingProduct = SanityProductDraft & {
  _id: string
  _rev?: string
  _createdAt?: string
  _updatedAt?: string
  [key: string]: unknown
}

type ExistingProductVersions = {
  drafts: ExistingProduct[]
  published: ExistingProduct[]
  aliasTargetIds?: string[]
}

export async function publishProductDraft(
  client: SanityPublisherClient,
  plan: SanityIngestionPlan,
  fetchImage: typeof fetch = fetch,
): Promise<PublishDraftResult> {
  const lookup = plan.styleCodeNormalized
    ? await client.fetch<ExistingProductVersions>(plan.existingProductQuery, {
        vendorId: plan.vendorId,
        styleCodeNormalized: plan.styleCodeNormalized,
      }, {perspective: 'raw'})
    : {drafts: [], published: [], aliasTargetIds: []}
  const resolution = await resolveExistingProduct(client, plan, lookup)
  const versions = resolution.versions
  const existing = versions.drafts[0] ?? versions.published[0]
  const blockingReasons = evaluateIngestionPlan(plan)
  if (resolution.duplicateIdentity) blockingReasons.push('duplicate_identity')
  if (existing?.importMeta.contentLocked) blockingReasons.push('content_locked')

  if (blockingReasons.length > 0) {
    const candidate = await client.create({
      _type: 'productImportCandidate',
      identityKey: plan.identityKey ?? `${plan.vendorId}:unidentified:${plan.externalId}`,
      vendorId: plan.vendorId,
      styleCode: plan.document.importMeta.styleCode,
      styleCodeNormalized: plan.styleCodeNormalized,
      externalId: plan.externalId,
      targetProduct: versions.published[0]
        ? {_type: 'reference', _ref: versions.published[0]._id}
        : undefined,
      receivedAt: plan.document.importMeta.importedAt,
      status: 'pending',
      detailScore: plan.document.importMeta.detailScore,
      accuracyScore: plan.document.importMeta.accuracyScore,
      blockingReasons: [...new Set(blockingReasons)],
      proposedPayloadJson: JSON.stringify(plan.document),
      assetSources: plan.assets.map((asset, index) => ({
        _key: `asset-${index + 1}`,
        sourceUrl: asset.sourceUrl,
        role: asset.role,
        alt: asset.alt,
      })),
    })
    return {outcome: 'candidate', candidateId: candidate._id, blockingReasons: [...new Set(blockingReasons)]}
  }

  const draftId = toDraftId(existing?._id ?? randomUUID())
  const document = structuredClone(plan.document)
  const assetIds: string[] = []
  for (const upload of plan.assets) {
    const response = await fetchImage(upload.sourceUrl)
    if (!response.ok) throw new Error(`Image download failed (${response.status}): ${upload.sourceUrl}`)
    const asset = await client.assets.upload('image', await response.blob(), {filename: filenameFromUrl(upload.sourceUrl)})
    assetIds.push(asset._id)
    applyImage(document, upload, {
      _type: 'productImage',
      asset: {_type: 'reference', _ref: asset._id},
      alt: upload.alt,
      role: upload.role,
      sourceUrl: upload.sourceUrl,
    })
  }

  const importedAt = document.importMeta.importedAt
  const merged = existing
    ? mergeProductUpdate(existing, document, importedAt)
    : {
        document: {
          ...document,
          importMeta: {
            ...document.importMeta,
            sourceFields: buildInitialSourceFields(document, importedAt),
            conflicts: [],
          },
        },
        conflicts: [],
      }
  await client.createOrReplace({...stripSystemFields(merged.document), _id: draftId})
  return {outcome: 'draft', draftId, assetIds, conflictCount: merged.conflicts.length}
}

async function resolveExistingProduct(
  client: SanityPublisherClient,
  plan: SanityIngestionPlan,
  lookup: ExistingProductVersions,
): Promise<{versions: ExistingProductVersions; duplicateIdentity: boolean}> {
  const directIds = new Set([
    ...lookup.drafts.map((document) => publishedId(document._id)),
    ...lookup.published.map((document) => publishedId(document._id)),
  ])
  const aliasIds = new Set((lookup.aliasTargetIds ?? []).map(publishedId))
  const resolvedIds = new Set([...directIds, ...aliasIds])
  if (resolvedIds.size > 1 || directIds.size > 1 || aliasIds.size > 1) {
    return {versions: lookup, duplicateIdentity: true}
  }
  if (directIds.size === 1 || aliasIds.size === 0) return {versions: lookup, duplicateIdentity: false}

  const targetId = [...aliasIds][0]
  const versions = await client.fetch<ExistingProductVersions>(plan.productByIdQuery, {
    publishedId: targetId,
    draftId: toDraftId(targetId),
  }, {perspective: 'raw'})
  return {
    versions: {...versions, aliasTargetIds: [targetId]},
    duplicateIdentity: versions.drafts.length + versions.published.length === 0,
  }
}

function evaluateIngestionPlan(plan: SanityIngestionPlan): string[] {
  const product = structuredClone(plan.document)
  const imageTarget = plan.assets.find((asset) =>
    asset.target.scope === 'variant' && ['primaryImage', 'swatchImage'].includes(asset.target.field),
  )
  if (imageTarget?.target.scope === 'variant') {
    const target = imageTarget.target
    const variant = product.variants.find((item) => item._key === target.variantKey)
    if (variant) variant.primaryImage = {pendingAsset: true} as never
  }
  return [...new Set([...product.importMeta.blockingReasons, ...evaluatePublicationGate(product)])]
}

function stripSystemFields(document: SanityProductDraft & Record<string, unknown>): {_type: string; [key: string]: unknown} {
  const mutable = {...document}
  delete mutable._id
  delete mutable._rev
  delete mutable._createdAt
  delete mutable._updatedAt
  return mutable
}

function applyImage(document: SanityProductDraft, upload: AssetUpload, image: SanityImage): void {
  if (upload.target.scope === 'product') {
    document.gallery = [...(document.gallery ?? []), image]
    document.lifestyleImage ??= image
    return
  }
  const target = upload.target
  const variant = document.variants.find((candidate) => candidate._key === target.variantKey)
  if (!variant) throw new Error(`Variant target not found: ${target.variantKey}`)
  if (target.field === 'images') variant.images = [...(variant.images ?? []), image]
  else variant[target.field] = image
  if (target.field === 'primaryImage') document.image ??= image
}

function toDraftId(documentId: string): string {
  return documentId.startsWith('drafts.') ? documentId : `drafts.${documentId}`
}
function publishedId(documentId: string): string {
  return documentId.startsWith('drafts.') ? documentId.slice('drafts.'.length) : documentId
}
function filenameFromUrl(url: string): string | undefined {
  try {
    return new URL(url).pathname.split('/').filter(Boolean).at(-1) || undefined
  } catch {
    return undefined
  }
}