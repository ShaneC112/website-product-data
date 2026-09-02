import {randomUUID} from 'node:crypto'
import type {AssetUpload, SanityImage, SanityIngestionPlan, SanityProductDraft} from './ingestion.js'
import {buildInitialSourceFields, mergeProductUpdate} from './mergeProductUpdate.js'
import {evaluateBridgeEligibility} from './bridgeContract.schema.js'

export type PublishDraftResult =
  | {outcome: 'draft'; draftId: string; assetIds: string[]; conflictCount: number}
  | {outcome: 'held'; reasons: string[]}

export type SanityPublisherClient = {
  fetch<T>(query: string, params?: Record<string, unknown>, options?: {perspective?: string}): Promise<T>
  create(document: {_type: string; [key: string]: unknown}): Promise<{_id: string}>
  createOrReplace(document: {_id: string; _type: string; [key: string]: unknown}): Promise<unknown>
  assets: {
    upload(type: 'image', body: Blob, options?: {filename?: string}): Promise<{_id: string}>
  }
}

export type PublishAssetEvent = {
  action: 'asset_fetch_started' | 'asset_fetch_completed' | 'asset_fetch_failed' | 'asset_upload_completed'
  sourceUrl: string
  role: AssetUpload['role']
  target: AssetUpload['target']
  durationMs?: number
  status?: number
  sizeBytes?: number
  error?: string
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
  onAssetEvent?: (event: PublishAssetEvent) => void,
): Promise<PublishDraftResult> {
  const lookup = await client.fetch<ExistingProductVersions>(plan.existingProductQuery, {
    vendorId: plan.vendorId,
    styleCodeNormalized: plan.styleCodeNormalized,
    externalId: plan.externalId,
  }, {perspective: 'raw'})
  const resolution = await resolveExistingProduct(client, plan, lookup)
  const versions = resolution.versions
  const existing = versions.drafts[0] ?? versions.published[0]

  // Bridge-eligibility must see the swatch image a pending asset upload will produce, not the
  // still-empty field on the just-built document (uploads happen further down, after this gate).
  const eligibility = evaluateBridgeEligibility(withPendingSwatchMarkers(plan))
  const reasons = [...plan.blockingReasons, ...(eligibility.eligible ? [] : eligibility.reasons)]
  if (resolution.duplicateIdentity) reasons.push('duplicate_identity')
  if (existing?.importMeta.contentLocked) reasons.push('content_locked')

  if (reasons.length > 0) {
    // No Sanity document is created or updated - if `existing` is set, it is left untouched.
    return {outcome: 'held', reasons: [...new Set(reasons)]}
  }

  const draftId = toDraftId(existing?._id ?? randomUUID())
  const document = structuredClone(plan.document)
  const assetIds: string[] = []
  for (const upload of plan.assets) {
    const startedAt = Date.now()
    onAssetEvent?.({action: 'asset_fetch_started', sourceUrl: upload.sourceUrl, role: upload.role, target: upload.target})
    try {
      const response = await fetchImage(upload.sourceUrl)
      if (!response.ok) throw new Error(`Image download failed (${response.status}): ${upload.sourceUrl}`)
      const image = await response.blob()
      onAssetEvent?.({action: 'asset_fetch_completed', sourceUrl: upload.sourceUrl, role: upload.role, target: upload.target, status: response.status, sizeBytes: image.size, durationMs: Date.now() - startedAt})
      const asset = await client.assets.upload('image', image, {filename: filenameFromUrl(upload.sourceUrl)})
      onAssetEvent?.({action: 'asset_upload_completed', sourceUrl: upload.sourceUrl, role: upload.role, target: upload.target, durationMs: Date.now() - startedAt})
      assetIds.push(asset._id)
      applyImage(document, upload, {
        _type: 'productImage',
        asset: {_type: 'reference', _ref: asset._id},
        alt: upload.alt,
        role: upload.role,
        sourceUrl: upload.sourceUrl,
      })
    } catch (error) {
      onAssetEvent?.({action: 'asset_fetch_failed', sourceUrl: upload.sourceUrl, role: upload.role, target: upload.target, durationMs: Date.now() - startedAt, error: error instanceof Error ? error.message : String(error)})
      throw error
    }
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

function withPendingSwatchMarkers(plan: SanityIngestionPlan): SanityProductDraft {
  const product = structuredClone(plan.document)
  for (const asset of plan.assets) {
    const target = asset.target
    if (target.scope !== 'variant' || target.field !== 'swatchImage') continue
    const variant = product.variants.find((item) => item._key === target.variantKey)
    if (variant) variant.swatchImage = {pendingAsset: true} as never
  }
  return product
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