import {
  getRegistryEntriesForTrade,
  isSanitySuitableRoom,
  mapTradeToSanityProductType,
  type RegistryFieldValue,
} from '../registry/index.js'
import type {
  ComposedProductDetailBlob,
  CrawlProductDetailTable,
  ExtractedVendorVariant,
} from '../storage/index.js'

type SanityPrice = {
  _type: 'productPrice'
  currency: 'EUR'
  unit: 'm2' | 'linear-metre' | 'pack' | 'each'
  retailExVatMinor: number
  vatRate: 0.23
  retailIncVatMinor: number
}

type SanitySpec = {
  _key: string
  _type: 'specification'
  key: string
  label: string
  value: string
  source: 'vendor'
  confidence: number
}

export type AssetUpload = {
  sourceUrl: string
  role: 'product' | 'swatch' | 'roomshot'
  alt: string
  target:
    | {scope: 'variant'; variantKey: string; field: 'primaryImage' | 'images' | 'swatchImage'}
    | {scope: 'product'; field: 'gallery'}
}

export type SanityProductDraft = {
  _type: 'product'
  name?: string
  slug?: {_type: 'slug'; current: string}
  productType?: string
  brand?: string
  shortDescription?: string
  features: string[]
  specs: SanitySpec[]
  suitableRooms: string[]
  price?: SanityPrice
  priceOnRequest: boolean
  variants: Array<{
    _key: string
    _type: 'productVariant'
    variantId: string
    vendorSku?: string
    colourName: string
    hex?: string
    sourceUrl?: string
    suitableRooms: string[]
    price?: SanityPrice
    primaryImage?: SanityImage
    swatchImage?: SanityImage
    images?: SanityImage[]
  }>
  image?: SanityImage
  lifestyleImage?: SanityImage
  gallery?: SanityImage[]
  status: 'draft'
  importMeta: {
    _type: 'importMeta'
    externalId: string
    identityKey?: string
    styleCode?: string
    styleCodeNormalized?: string
    sourceUrl: string
    vendorId?: string
    gateStatus: 'blocked' | 'review' | 'ready'
    needsReview: boolean
    contentLocked: boolean
    detailScore: number
    accuracyScore: number
    blockingReasons: string[]
    promptVersion?: string
    contentHash?: string
    importedAt: string
    validationNotes?: string[]
    [key: string]: unknown
  }
}

export type SanityImage = {
  _type: 'productImage'
  asset: {_type: 'reference'; _ref: string}
  alt: string
  role: AssetUpload['role']
  sourceUrl: string
}

export type SanityIngestionPlan = {
  externalId: string
  identityKey?: string
  vendorId: string
  styleCodeNormalized?: string
  existingProductQuery: string
  productByIdQuery: string
  document: SanityProductDraft
  assets: AssetUpload[]
}

export type BuildIngestionOptions = {
  vendorId: string
  pricingUnit?: SanityPrice['unit']
  now?: string
  blockingReasons?: string[]
}

export function calculateRetailIncVatMinor(retailExVatMinor: number): number {
  if (!Number.isSafeInteger(retailExVatMinor) || retailExVatMinor < 0) {
    throw new RangeError('Retail ex VAT price must be a non-negative integer in minor units')
  }
  return Math.round(retailExVatMinor * 1.23)
}

export function buildSanityIngestionPlan(
  row: CrawlProductDetailTable,
  blob: ComposedProductDetailBlob,
  options: BuildIngestionOptions,
): SanityIngestionPlan {
  const fields = blob.extracted.fields ?? []
  const fieldMap = new Map(fields.map((field) => [field.field, field]))
  const vendorPage = blob.extracted.vendorProductPage
  const name = readString(fieldMap.get('title')?.value) ?? vendorPage?.rangeName
  const description = readString(fieldMap.get('description')?.value) ?? vendorPage?.description
  const productType = mapTradeToSanityProductType(blob.extracted.trade, readString(fieldMap.get('productType')?.value))
  const suitableRooms = readSuitableRooms(fieldMap.get('suitableRooms')?.value)
  const vendorId = normalizeIdentityPart(options.vendorId)
  const styleCode = row.styleCode ?? blob.source.styleCode ?? blob.extracted.styleCode
  const styleCodeNormalized = styleCode ? normalizeStyleCode(styleCode) : undefined
  const identityKey = styleCodeNormalized ? `${vendorId}:${styleCodeNormalized}` : undefined
  const price = row.rawPriceMinor == null ? undefined : buildPrice(row.rawPriceMinor, options.pricingUnit ?? 'm2')
  const registry = getRegistryEntriesForTrade(blob.extracted.trade)
  const registryByField = new Map(registry.map((entry) => [entry.field, entry]))
  const publishableFields = registry.filter((entry) =>
    entry.publishable && entry.category !== 'meta' && entry.category !== 'identity' && entry.field !== 'suitableRooms',
  )
  const populatedFields = publishableFields.filter((entry) => fieldMap.has(entry.field))
  const detailScore = publishableFields.length === 0 ? 0 : populatedFields.length / publishableFields.length
  const accuracyScore = fields.length === 0 ? 0 : fields.reduce((sum, field) => sum + field.confidence, 0) / fields.length
  const variants = (vendorPage?.variants ?? []).map((variant, index) =>
    buildVariant(variant, index, price, suitableRooms, row.vendorSku),
  )
  const blockingReasons = [...new Set([
    ...blob.composition.readinessReasons.filter((reason) => reason !== 'extraction_warnings_informational'),
    ...(options.blockingReasons ?? []),
  ])]
  if (!productType) blockingReasons.push('trade_unmapped')
  if (!styleCodeNormalized) blockingReasons.push('missing_style_code')
  if (row.vatRate != null && row.vatRate !== 0.23) blockingReasons.push('unsupported_vat_rate')
  if (!row.sourceGroupKey) blockingReasons.push('missing_source_group_key')
  if (variants.length === 0) blockingReasons.push('missing_variants')
  const gateStatus = blockingReasons.length === 0 && blob.extracted.status === 'ready'
    ? 'ready'
    : blob.extracted.status === 'ready' ? 'review' : 'blocked'
  const externalId = row.sourceGroupKey ?? row.rowKey
  const assets = buildAssetUploads(vendorPage?.variants ?? [], name ?? 'Product')

  return {
    externalId,
    identityKey,
    vendorId,
    styleCodeNormalized,
    existingProductQuery: '{"drafts": *[_type == "product" && _id in path("drafts.**") && importMeta.vendorId == $vendorId && importMeta.styleCodeNormalized == $styleCodeNormalized], "published": *[_type == "product" && !(_id in path("drafts.**")) && importMeta.vendorId == $vendorId && importMeta.styleCodeNormalized == $styleCodeNormalized], "aliasTargetIds": *[_type == "productIdentityAlias" && vendorId == $vendorId && styleCodeNormalized == $styleCodeNormalized && status == "active"].targetProduct._ref}',
    productByIdQuery: '{"drafts": *[_type == "product" && _id == $draftId], "published": *[_type == "product" && _id == $publishedId]}',
    document: {
      _type: 'product',
      name,
      slug: name ? {_type: 'slug', current: slugify(name)} : undefined,
      productType,
      brand: vendorPage?.brandName,
      shortDescription: description,
      features: readFeatureLabels(fields, registryByField),
      specs: buildSpecs(fields, registryByField),
      suitableRooms,
      price,
      priceOnRequest: price == null,
      variants,
      status: 'draft',
      importMeta: {
        _type: 'importMeta',
        externalId,
        identityKey,
        styleCode,
        styleCodeNormalized,
        sourceUrl: blob.summary.url,
        vendorId,
        gateStatus,
        needsReview: gateStatus !== 'ready',
        contentLocked: false,
        detailScore,
        accuracyScore,
        blockingReasons,
        promptVersion: blob.extracted.promptVersion,
        contentHash: blob.summary.contentHash,
        importedAt: options.now ?? new Date().toISOString(),
      },
    },
    assets,
  }
}

export function normalizeStyleCode(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '-')
}

function buildPrice(retailExVatMinor: number, unit: SanityPrice['unit']): SanityPrice {
  return {_type: 'productPrice', currency: 'EUR', unit, retailExVatMinor, vatRate: 0.23, retailIncVatMinor: calculateRetailIncVatMinor(retailExVatMinor)}
}

function buildVariant(
  variant: ExtractedVendorVariant,
  index: number,
  price: SanityPrice | undefined,
  productRooms: string[],
  vendorSku?: string,
): SanityProductDraft['variants'][number] {
  const variantId = variant.variantId ?? variant.label ?? `variant-${index + 1}`
  return {
    _key: stableKey(variantId), _type: 'productVariant', variantId, vendorSku,
    colourName: variant.colourName ?? variant.label ?? variantId,
    hex: variant.swatchHex, sourceUrl: variant.url,
    suitableRooms: variant.suitability?.filter(isSanitySuitableRoom) ?? productRooms,
    price,
  }
}

function buildAssetUploads(variants: ExtractedVendorVariant[], productName: string): AssetUpload[] {
  const uploads = new Map<string, AssetUpload>()
  variants.forEach((variant, variantIndex) => {
    const variantKey = stableKey(variant.variantId ?? variant.label ?? `variant-${variantIndex + 1}`)
    const colourName = variant.colourName ?? variant.label ?? `variant ${variantIndex + 1}`
    const classified = new Map((variant.classifiedImages ?? []).map((image) => [image.url, image.role]))
    const swatches = new Set([variant.swatchImageUrl, ...(variant.swatchImageUrls ?? [])].filter(Boolean) as string[])
    const allUrls = [...new Set([...(variant.imageUrls ?? []), ...swatches])]
    let hasPrimaryImage = false
    allUrls.forEach((sourceUrl) => {
      const classifiedRole = classified.get(sourceUrl)
      const role = swatches.has(sourceUrl) || classifiedRole === 'swatch'
        ? 'swatch' : classifiedRole === 'roomshot' ? 'roomshot' : 'product'
      const target: AssetUpload['target'] = role === 'swatch'
        ? {scope: 'variant', variantKey, field: 'swatchImage'}
        : role === 'product' && !hasPrimaryImage
          ? {scope: 'variant', variantKey, field: 'primaryImage'}
          : role === 'product' ? {scope: 'variant', variantKey, field: 'images'} : {scope: 'product', field: 'gallery'}
      if (role === 'product') hasPrimaryImage = true
      const targetKey = target.scope === 'variant' ? `${target.variantKey}:${target.field}` : target.field
      uploads.set(`${targetKey}:${sourceUrl}`, {
        sourceUrl, role,
        alt: role === 'roomshot' ? `${productName} in a room setting` : `${productName}, ${colourName}`,
        target,
      })
    })
  })
  return [...uploads.values()]
}

function buildSpecs(
  fields: RegistryFieldValue[],
  registryByField: Map<string, ReturnType<typeof getRegistryEntriesForTrade>[number]>,
): SanitySpec[] {
  return fields.flatMap((field) => {
    const registryEntry = registryByField.get(field.field)
    if (!registryEntry?.publishable || registryEntry.category !== 'specifications') return []
    const value = formatValue(field.value)
    if (!value) return []
    return [{_key: stableKey(field.field), _type: 'specification' as const, key: field.field,
      label: titleFromKey(field.field), value, source: 'vendor' as const, confidence: field.confidence}]
  })
}

function readFeatureLabels(
  fields: RegistryFieldValue[],
  registryByField: Map<string, ReturnType<typeof getRegistryEntriesForTrade>[number]>,
): string[] {
  return fields.flatMap((field) => {
    const registryEntry = registryByField.get(field.field)
    return registryEntry?.category === 'features' && field.value === true ? [titleFromKey(field.field)] : []
  })
}

function readSuitableRooms(value: unknown): string[] {
  return Array.isArray(value)
    ? [...new Set(value.filter((room): room is string => typeof room === 'string' && isSanitySuitableRoom(room)))]
    : []
}

function formatValue(value: unknown): string | undefined {
  if (typeof value === 'string') return value.trim() || undefined
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return value.map(formatValue).filter(Boolean).join(', ') || undefined
  if (value && typeof value === 'object') {
    const measurement = value as {value?: unknown; unit?: unknown}
    if (typeof measurement.value === 'number' && typeof measurement.unit === 'string') return `${measurement.value} ${measurement.unit}`
  }
  return undefined
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function titleFromKey(value: string): string {
  return value.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (letter) => letter.toUpperCase())
}

function slugify(value: string): string {
  return value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function stableKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-|-$/g, '').slice(0, 96) || 'item'
}

function normalizeIdentityPart(value: string): string {
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
  if (!normalized) throw new Error('vendorId is required for Sanity product identity')
  return normalized
}