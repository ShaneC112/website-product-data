import {
  deriveSecondaryColourNameFromHex,
  isSanitySuitableRoom,
  mapTradeToSanityProductType,
  type RegistryFieldValue,
} from '../registry/index.js'
import type {
  ComposedProductDetailBlob,
  CrawlProductDetailTable,
  ExtractedReviewModel,
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

type SanityMeasurement = {
  _type: 'measurement'
  value: number
  unit: string
}

type SanityPackInfo = {
  _type: 'packInfo'
  coverage?: SanityMeasurement
  piecesPerPack?: number
  length?: SanityMeasurement
  width?: SanityMeasurement
  height?: SanityMeasurement
}

type PackInfoHint = {
  coverage?: {value: number; unit: string}
  piecesPerPack?: number
  length?: {value: number; unit: string}
  width?: {value: number; unit: string}
  height?: {value: number; unit: string}
}

type SanitySpec = {
  _key: string
  _type: 'specification'
  key: string
  label: string
  value: string
  source: 'vendor' | 'ai_discovered'
  confidence?: number
}

type SanityProductFeature = {
  _key: string
  _type: 'productFeature'
  key: string
  label: string
  source: 'vendor' | 'ai_discovered'
  confidence?: number
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
  features: SanityProductFeature[]
  specs: SanitySpec[]
  suitableRooms: string[]
  price?: SanityPrice
  priceOnRequest: boolean
  widths: SanityMeasurement[]
  variants: Array<{
    _key: string
    _type: 'productVariant'
    variantId: string
    vendorSku?: string
    colourName: string
    hex?: string
    colourFamily?: string
    sourceUrl?: string
    suitableRooms: string[]
    price?: SanityPrice
    packPrice?: SanityPrice
    packInfo?: SanityPackInfo
    widths: SanityMeasurement[]
    primaryImage?: SanityImage
    swatchImage?: SanityImage
    images?: SanityImage[]
    // schema-only today (never populated by ingestion) - editor-entered variant-level specs, still
    // tracked as a source-managed field so a later ingestion source for it doesn't get blocked.
    specs?: SanitySpec[]
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
    contentLocked: boolean
    // a single qualitative hint for a content editor, computed from the internal accuracyScore
    // formula (average AI field confidence) - never the raw score, formula, or pipeline terminology.
    importAiConfidence: 'high' | 'medium' | 'low'
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
  // Azure-internal only - never written to the Sanity document (see importAiConfidence, the one
  // deliberate exception). Combines composeProductDetail's own readiness signals with any
  // caller-supplied pre-check (e.g. deriveSanityVendorIdentity's missing_vendor_identity) - fed
  // into publishProductDraft's `held` decision alongside evaluateBridgeEligibility's own reasons.
  blockingReasons: string[]
}

export type BuildIngestionOptions = {
  vendorId: string
  pricingUnit?: SanityPrice['unit']
  now?: string
  blockingReasons?: string[]
  // resolved per-colour pricing from the variant-matching chain (which matched m2crm source row
  // belongs to which crawled colour) - keyed by variantId. When absent for a given variantId, that
  // variant falls back to the single row-level price/packPrice (today's product-wide default).
  // rawWidthHint is that same matched source row's own roll width(s) (m2crm's native `width`
  // field) - unioned with any page-extracted variant.widths to resolve that colour's own width set.
  variantOverrides?: Record<string, {rawPriceMinor?: number; rawBoxPriceMinor?: number; rawWidthHint?: {value: number; unit: string}[]; packInfoHint?: PackInfoHint}>
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
  const packPrice = row.rawBoxPriceMinor == null ? undefined : buildPrice(row.rawBoxPriceMinor, 'pack')
  const packInfo = readPackInfo(fieldMap.get('packInfo')?.value)
  const rangeWidths = dedupeMeasurements((vendorPage?.widths ?? []).map(readWidthSlot).filter(isDefined))
  const variantOwnWidths = (vendorPage?.variants ?? []).map((variant, index) =>
    resolveVariantOwnWidths(variant, index, options.variantOverrides),
  )
  // no range-level width claim to default to - fall back to the union of what each colour's own
  // matched source product(s)/page extraction resolved, so a still-populated product.widths is
  // available for the parent/child comparison below.
  const productWidths = rangeWidths.length > 0 ? rangeWidths : dedupeMeasurements(variantOwnWidths.flat())
  const accuracyScore = fields.length === 0 ? 0 : fields.reduce((sum, field) => sum + field.confidence, 0) / fields.length
  const importAiConfidence: 'high' | 'medium' | 'low' = accuracyScore >= 0.85 ? 'high' : accuracyScore >= 0.6 ? 'medium' : 'low'
  const variants = (vendorPage?.variants ?? []).map((variant, index) =>
    buildVariant(variant, index, price, suitableRooms, row.vendorSku, packPrice, packInfo, productWidths, variantOwnWidths[index], options.variantOverrides, options.pricingUnit ?? 'm2'),
  )
  const blockingReasons = [...new Set([
    ...blob.composition.readinessReasons.filter((reason) => reason !== 'extraction_warnings_informational'),
    ...(options.blockingReasons ?? []),
  ])]
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
      features: buildFeatures(blob.review, fieldMap),
      specs: buildSpecs(blob.review, fieldMap),
      suitableRooms,
      price,
      priceOnRequest: price == null,
      widths: productWidths,
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
        contentLocked: false,
        importAiConfidence,
        promptVersion: blob.extracted.promptVersion,
        contentHash: blob.summary.contentHash,
        importedAt: options.now ?? new Date().toISOString(),
      },
    },
    assets,
    blockingReasons,
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
  vendorSku: string | undefined,
  packPrice: SanityPrice | undefined,
  packInfo: SanityPackInfo | undefined,
  productWidths: SanityMeasurement[],
  ownWidths: SanityMeasurement[],
  variantOverrides: Record<string, {rawPriceMinor?: number; rawBoxPriceMinor?: number; rawWidthHint?: {value: number; unit: string}[]; packInfoHint?: PackInfoHint}> | undefined,
  pricingUnit: SanityPrice['unit'],
): SanityProductDraft['variants'][number] {
  const variantId = variant.variantId ?? variant.label ?? `variant-${index + 1}`
  const override = variantOverrides?.[variantId]
  const resolvedPrice = override?.rawPriceMinor != null ? buildPrice(override.rawPriceMinor, pricingUnit) : price
  const resolvedPackPrice = override?.rawBoxPriceMinor != null ? buildPrice(override.rawBoxPriceMinor, 'pack') : packPrice
  const resolvedPackInfo = override?.packInfoHint ? readPackInfo(override.packInfoHint) : packInfo
  const widths = ownWidths.length > 0 && !areMeasurementSetsEquivalent(ownWidths, productWidths) ? ownWidths : []
  return {
    _key: stableKey(variantId), _type: 'productVariant', variantId, vendorSku,
    colourName: variant.colourName ?? variant.label ?? variantId,
    hex: variant.swatchHex,
    colourFamily: deriveSecondaryColourNameFromHex(variant.swatchHex) ?? undefined,
    sourceUrl: variant.url,
    suitableRooms: variant.suitability?.filter(isSanitySuitableRoom) ?? productRooms,
    price: resolvedPrice, packPrice: resolvedPackPrice, packInfo: resolvedPackInfo, widths,
  }
}

// this colour's resolved width set = page-extracted variant.widths unioned with its matched
// m2crm source product's own rawWidthHint (task 4/5) - either alone can be present/absent
// independently (a page pass may see width-parsing noise, a match may not exist yet).
function resolveVariantOwnWidths(
  variant: ExtractedVendorVariant,
  index: number,
  variantOverrides: Record<string, {rawPriceMinor?: number; rawBoxPriceMinor?: number; rawWidthHint?: {value: number; unit: string}[]; packInfoHint?: PackInfoHint}> | undefined,
): SanityMeasurement[] {
  const variantId = variant.variantId ?? variant.label ?? `variant-${index + 1}`
  const override = variantOverrides?.[variantId]
  const pageWidths = (variant.widths ?? []).map(readWidthSlot).filter(isDefined)
  const hintWidths = (override?.rawWidthHint ?? []).map(readMeasurement).filter(isDefined)
  return dedupeMeasurements([...pageWidths, ...hintWidths])
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined
}

// `ExtractedWidthSlot` (`{widthLabel: string}`) is a display-only string built from a structured
// {value, unit} measurement upstream (see azure's buildWidthSlots) - parse it back for physical
// comparison. Format is always `${value} ${unit}` (see buildWidthSlots), so this is a strict,
// deliberately narrow parse, not a general free-text width parser.
function readWidthSlot(slot: {widthLabel: string}): SanityMeasurement | undefined {
  const match = /^(-?\d+(?:\.\d+)?)\s*(.+)$/.exec(slot.widthLabel.trim())
  if (!match) return undefined
  const value = Number.parseFloat(match[1])
  const unit = match[2].trim()
  if (!Number.isFinite(value) || !unit) return undefined
  return {_type: 'measurement', value, unit}
}

function dedupeMeasurements(measurements: SanityMeasurement[]): SanityMeasurement[] {
  const seen = new Set<string>()
  const result: SanityMeasurement[] = []
  for (const measurement of measurements) {
    const key = `${measurement.value}:${measurement.unit.toLowerCase()}`
    if (seen.has(key)) continue
    seen.add(key)
    result.push(measurement)
  }
  return result
}

const LENGTH_UNIT_TO_MM: Record<string, number> = {
  mm: 1,
  cm: 10,
  m: 1000,
}

function normalizeMeasurementToMm(measurement: SanityMeasurement): number | undefined {
  const factor = LENGTH_UNIT_TO_MM[measurement.unit.trim().toLowerCase()]
  return factor == null ? undefined : measurement.value * factor
}

// Reusable, unit-normalized physical-size comparison for the product-default/child-overrides-only-
// if-different model (see FieldRegistryEntry.allowVariantOverride) - currently used for width, and
// intended to be reused as-is for packInfo/pattern fields once they adopt the same model.
export function areMeasurementSetsEquivalent(a: SanityMeasurement[], b: SanityMeasurement[]): boolean {
  if (a.length !== b.length) return false
  const normalize = (set: SanityMeasurement[]) =>
    set.map(normalizeMeasurementToMm).filter(isDefined).sort((x, y) => x - y)
  const normalizedA = normalize(a)
  const normalizedB = normalize(b)
  if (normalizedA.length !== a.length || normalizedB.length !== b.length) return false
  return normalizedA.every((value, index) => Math.abs(value - normalizedB[index]) < 0.01)
}

function readMeasurement(value: unknown): SanityMeasurement | undefined {
  if (!value || typeof value !== 'object') return undefined
  const raw = value as Record<string, unknown>
  if (typeof raw.value !== 'number' || typeof raw.unit !== 'string') return undefined
  return {_type: 'measurement', value: raw.value, unit: raw.unit}
}

function readPackInfo(value: unknown): SanityPackInfo | undefined {
  if (!value || typeof value !== 'object') return undefined
  const raw = value as Record<string, unknown>
  const coverage = readMeasurement(raw.coverage)
  const length = readMeasurement(raw.length)
  const width = readMeasurement(raw.width)
  const height = readMeasurement(raw.height)
  const piecesPerPack = typeof raw.piecesPerPack === 'number' ? raw.piecesPerPack : undefined
  if (!coverage && !length && !width && !height && piecesPerPack == null) return undefined
  return {_type: 'packInfo', coverage, piecesPerPack, length, width, height}
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

// Consumes composeProductDetail's four-array review model (each entry's `included` flag,
// decided upstream by the pipeline) instead of rebuilding specs from a raw dump of every
// registry field. Named (`knownSpecifications`) entries keep the registry field name as a stable,
// filterable `key`; catch-all (`additionalSpecifications`) entries have no canonical registry
// field, so their key is slugified from the AI's own description and marked `source: 'ai_discovered'`
// (vs. `'vendor'` for named fields) so editors/devs can tell curated fields apart from AI extras.
function buildSpecs(review: ExtractedReviewModel, fieldMap: Map<string, RegistryFieldValue>): SanitySpec[] {
  const known = review.knownSpecifications.filter((attribute) => attribute.included).flatMap((attribute) => {
    const value = formatValue(attribute.value)
    if (!value) return []
    return [{
      _key: stableKey(attribute.key), _type: 'specification' as const, key: attribute.key,
      label: titleFromKey(attribute.key), value, source: 'vendor' as const,
      confidence: fieldMap.get(attribute.key)?.confidence,
    }]
  })
  const additional = review.additionalSpecifications.filter((attribute) => attribute.included).map((attribute, index) => {
    const key = slugify(attribute.description) || `extra-specification-${index + 1}`
    return {
      _key: stableKey(`extra-${index}-${key}`), _type: 'specification' as const, key,
      label: attribute.description, value: attribute.value, source: 'ai_discovered' as const,
      confidence: fieldMap.get('additionalSpecifications')?.confidence,
    }
  })
  return [...known, ...additional]
}

// Mirrors buildSpecs above. productFeature has no `value` field (see schemaTypes/objects/productFeature.ts) -
// a known feature's presence already means "true"; a catch-all feature's own description/value pair
// (which does carry a value string, unlike a named boolean feature) is folded into `label`.
function buildFeatures(review: ExtractedReviewModel, fieldMap: Map<string, RegistryFieldValue>): SanityProductFeature[] {
  const known = review.knownFeatures.filter((attribute) => attribute.included && attribute.value === true).map((attribute) => ({
    _key: stableKey(attribute.key), _type: 'productFeature' as const, key: attribute.key,
    label: titleFromKey(attribute.key), source: 'vendor' as const,
    confidence: fieldMap.get(attribute.key)?.confidence,
  }))
  const additional = review.additionalFeatures.filter((attribute) => attribute.included).map((attribute, index) => {
    const key = slugify(attribute.description) || `extra-feature-${index + 1}`
    return {
      _key: stableKey(`extra-${index}-${key}`), _type: 'productFeature' as const, key,
      label: attribute.value ? `${attribute.description} \u2014 ${attribute.value}` : attribute.description,
      source: 'ai_discovered' as const,
      confidence: fieldMap.get('additionalFeatures')?.confidence,
    }
  })
  return [...known, ...additional]
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