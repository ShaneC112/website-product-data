import {
  deriveSecondaryColourNameFromHex,
  getRegistryEntriesForTrade,
  isRegistryFieldMappedToSanity,
  isSanitySuitableRoom,
  mapSanityProductTypeToCategoryKey,
  mapTradeToSanityProductType,
  registryFieldLabel,
  type RegistryFieldValue,
  type SanitySuitableRoom,
} from '../registry/index.js'
import type {
  ComposedProductDetailBlob,
  CrawlProductDetailTable,
  ExtractedReviewModel,
  ExtractedVendorVariant,
} from '../storage/index.js'
import { parseRawWidthHint } from '../storage/product-detail.schema.js'

type SanityPrice = {
  _type: 'productPrice'
  currency: 'EUR'
  unit: 'm2' | 'linear-metre' | 'pack' | 'each'
  retailExVat: number
  vatRate: 0.23
  retailIncVat: number
}

type SanityMeasurement = {
  _type: 'measurement'
  value: number
  unit: string
}

type SanityArrayMeasurement = SanityMeasurement & {
  _key?: string
}

type SanityPackInfo = {
  _type: 'packInfo'
  coverage?: SanityMeasurement
  piecesPerPack?: number
  length?: SanityMeasurement
  width?: SanityMeasurement
  height?: SanityMeasurement
}

type SanityVariantOverrides = {
  _type: 'variantOverrides'
  price: boolean
  packPrice: boolean
  packInfo: boolean
  widths: boolean
  suitableRooms: boolean
  pattern: boolean
  specs: boolean
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
  role: 'product' | 'swatch' | 'roomshot' | 'technical'
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
  categoryKey?: string
  brand?: string
  shortDescription?: string
  features: SanityProductFeature[]
  specs: SanitySpec[]
  suitableRooms: string[]
  price?: SanityPrice
  priceOnRequest: boolean
  packPrice?: SanityPrice
  packInfo?: SanityPackInfo
  patternRepeatCm?: number
  repeatsInSwatch?: number
  widths: SanityArrayMeasurement[]
  variants: Array<{
    _key: string
    _type: 'productVariant'
    variantId: string
    vendorSku?: string
    colourName: string
    hex?: string
    colourFamily?: string
    surfaceAppearance?: ExtractedVendorVariant['surfaceAppearance']
    sourceUrl?: string
    suitableRooms?: string[]
    overrides: SanityVariantOverrides
    price?: SanityPrice
    packPrice?: SanityPrice
    packInfo?: SanityPackInfo
    patternRepeatCm?: number
    repeatsInSwatch?: number
    widths?: SanityArrayMeasurement[]
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
  room?: SanitySuitableRoom | 'not-specified'
  generationPrompt?: string
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
  variantOverrides?: Record<string, {price?: number; boxSalesPrice?: number; rawWidthHint?: {value: number; unit: string}[]; packInfoHint?: PackInfoHint}>
}

export function calculateRetailIncVat(retailExVatMinor: number): number {
  if (!Number.isSafeInteger(retailExVatMinor) || retailExVatMinor < 0) {
    throw new RangeError('Retail ex VAT price must be a non-negative integer number of cents')
  }
  return Math.round(retailExVatMinor * 1.23) / 100
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
  const categoryKey = mapSanityProductTypeToCategoryKey(productType)
  const suitableRooms = readSuitableRooms(fieldMap.get('suitableRooms')?.value)
  const vendorId = normalizeIdentityPart(options.vendorId)
  const styleCode = firstNonBlank(row.styleCode, blob.source.styleCode, blob.extracted.styleCode, row.sourceGroupKey)
  const styleCodeNormalized = styleCode ? normalizeStyleCode(styleCode) : undefined
  const identityKey = styleCodeNormalized ? `${vendorId}:${styleCodeNormalized}` : undefined
  const price = row.price == null ? undefined : buildPrice(row.price, options.pricingUnit ?? 'm2')
  const packPrice = row.boxSalesPrice == null ? undefined : buildPrice(row.boxSalesPrice, 'pack')
  const packInfo = readPackInfo(fieldMap.get('packInfo')?.value)
  const rangeWidths = dedupeMeasurements([
    ...(vendorPage?.widths ?? []).map(readWidthSlot).filter(isDefined),
    ...(row.rawWidthHintJson ? parseRawWidthHint(row.rawWidthHintJson).map(readMeasurement).filter(isDefined) : []),
  ])
  const variantOwnWidths = (vendorPage?.variants ?? []).map((variant, index) =>
    resolveVariantOwnWidths(variant, index, options.variantOverrides),
  )
  // no range-level width claim to default to - fall back to the union of what each colour's own
  // matched source product(s)/page extraction resolved, so a still-populated product.widths is
  // available for the parent/child comparison below.
  const productWidths = withMeasurementKeys(rangeWidths.length > 0 ? rangeWidths : dedupeMeasurements(variantOwnWidths.flat()))
  const accuracyScore = fields.length === 0 ? 0 : fields.reduce((sum, field) => sum + field.confidence, 0) / fields.length
  const importAiConfidence: 'high' | 'medium' | 'low' = accuracyScore >= 0.85 ? 'high' : accuracyScore >= 0.6 ? 'medium' : 'low'
  const variants = (vendorPage?.variants ?? []).map((variant, index) =>
    buildVariant(variant, index, price, suitableRooms, row.vendorSku, packPrice, packInfo, productWidths, variantOwnWidths[index], options.variantOverrides, options.pricingUnit ?? 'm2'),
  )
  const blockingReasons = [...new Set([
    ...blob.composition.readinessReasons.filter(
      (reason) => reason !== 'extraction_warnings_informational' && !reason.startsWith('recommended_'),
    ),
    ...(options.blockingReasons ?? []),
  ])]
  const externalId = row.sourceGroupKey ?? row.rowKey
  const existingProductQuery = styleCodeNormalized
    ? '{"drafts": *[_type == "product" && _id in path("drafts.**") && importMeta.vendorId == $vendorId && (importMeta.styleCodeNormalized == $styleCodeNormalized || importMeta.externalId == $externalId)], "published": *[_type == "product" && !(_id in path("drafts.**")) && importMeta.vendorId == $vendorId && (importMeta.styleCodeNormalized == $styleCodeNormalized || importMeta.externalId == $externalId)], "aliasTargetIds": *[_type == "productIdentityAlias" && vendorId == $vendorId && styleCodeNormalized == $styleCodeNormalized && status == "active"].targetProduct._ref}'
    : '{"drafts": *[_type == "product" && _id in path("drafts.**") && importMeta.vendorId == $vendorId && importMeta.externalId == $externalId], "published": *[_type == "product" && !(_id in path("drafts.**")) && importMeta.vendorId == $vendorId && importMeta.externalId == $externalId], "aliasTargetIds": []}'
  const assets = buildAssetUploads(vendorPage?.variants ?? [], name ?? 'Product')

  return {
    externalId,
    identityKey,
    vendorId,
    styleCodeNormalized,
    existingProductQuery,
    productByIdQuery: '{"drafts": *[_type == "product" && _id == $draftId], "published": *[_type == "product" && _id == $publishedId]}',
    document: {
      _type: 'product',
      name,
      slug: name ? {_type: 'slug', current: slugify(name)} : undefined,
      productType,
      categoryKey,
      brand: readString(fieldMap.get('brandName')?.value) ?? vendorPage?.brandName,
      shortDescription: description,
      features: buildFeatures(blob.review, fieldMap, blob.extracted.trade),
      specs: buildSpecs(blob.review, fieldMap, blob.extracted.trade),
      suitableRooms,
      price,
      priceOnRequest: price == null && variants.every((variant) => variant.price == null),
      packPrice,
      packInfo,
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

function firstNonBlank(...values: Array<string | undefined>): string | undefined {
  return values.find((value) => value?.trim())?.trim()
}

function buildPrice(retailExVatMinor: number, unit: SanityPrice['unit']): SanityPrice {
  return {_type: 'productPrice', currency: 'EUR', unit, retailExVat: retailExVatMinor / 100, vatRate: 0.23, retailIncVat: calculateRetailIncVat(retailExVatMinor)}
}

function buildVariant(
  variant: ExtractedVendorVariant,
  index: number,
  price: SanityPrice | undefined,
  productRooms: string[],
  vendorSku: string | undefined,
  packPrice: SanityPrice | undefined,
  packInfo: SanityPackInfo | undefined,
  productWidths: SanityArrayMeasurement[],
  ownWidths: SanityMeasurement[],
  variantOverrides: Record<string, {price?: number; boxSalesPrice?: number; rawWidthHint?: {value: number; unit: string}[]; packInfoHint?: PackInfoHint}> | undefined,
  pricingUnit: SanityPrice['unit'],
): SanityProductDraft['variants'][number] {
  const variantId = variant.variantId ?? variant.label ?? `variant-${index + 1}`
  const override = variantOverrides?.[variantId]
  const resolvedPrice = override?.price != null ? buildPrice(override.price, pricingUnit) : price
  const resolvedPackPrice = override?.boxSalesPrice != null ? buildPrice(override.boxSalesPrice, 'pack') : packPrice
  const resolvedPackInfo = override?.packInfoHint ? readPackInfo(override.packInfoHint) : packInfo
  const widths = ownWidths.length > 0 && !areMeasurementSetsEquivalent(ownWidths, productWidths) ? ownWidths : []
  const resolvedRooms = variant.suitability?.filter(isSanitySuitableRoom) ?? productRooms
  const overrides = {
    _type: 'variantOverrides' as const,
    price: !arePricesEquivalent(resolvedPrice, price),
    packPrice: !arePricesEquivalent(resolvedPackPrice, packPrice),
    packInfo: !arePackInfosEquivalent(resolvedPackInfo, packInfo),
    widths: widths.length > 0,
    suitableRooms: !areStringSetsEquivalent(resolvedRooms, productRooms),
    pattern: false,
    specs: false,
  }
  return {
    _key: stableKey(variantId), _type: 'productVariant', variantId, vendorSku,
    colourName: variant.label ?? variant.colourName ?? variantId,
    hex: variant.swatchHex,
    colourFamily: deriveSecondaryColourNameFromHex(variant.swatchHex) ?? undefined,
    surfaceAppearance: withSurfaceAppearancePaletteKeys(variant.surfaceAppearance),
    sourceUrl: variant.url,
    overrides,
    suitableRooms: overrides.suitableRooms ? resolvedRooms : undefined,
    price: overrides.price ? resolvedPrice : undefined,
    packPrice: overrides.packPrice ? resolvedPackPrice : undefined,
    packInfo: overrides.packInfo ? resolvedPackInfo : undefined,
    widths: overrides.widths ? withMeasurementKeys(widths) : undefined,
  }
}

function arePricesEquivalent(left: SanityPrice | undefined, right: SanityPrice | undefined): boolean {
  return left?.currency === right?.currency
    && left?.unit === right?.unit
    && left?.retailExVat === right?.retailExVat
    && left?.vatRate === right?.vatRate
    && left?.retailIncVat === right?.retailIncVat
}

function arePackInfosEquivalent(left: SanityPackInfo | undefined, right: SanityPackInfo | undefined): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function areStringSetsEquivalent(left: string[], right: string[]): boolean {
  return left.length === right.length && [...left].sort().every((value, index) => value === [...right].sort()[index])
}

// this colour's resolved width set = page-extracted variant.widths unioned with its matched
// m2crm source product's own rawWidthHint (task 4/5) - either alone can be present/absent
// independently (a page pass may see width-parsing noise, a match may not exist yet).
function resolveVariantOwnWidths(
  variant: ExtractedVendorVariant,
  index: number,
  variantOverrides: Record<string, {price?: number; boxSalesPrice?: number; rawWidthHint?: {value: number; unit: string}[]; packInfoHint?: PackInfoHint}> | undefined,
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
    const normalizedMeasurement = normalizeMeasurementToMetres(measurement)
    const key = `${normalizedMeasurement.value}:${normalizedMeasurement.unit.toLowerCase()}`
    if (seen.has(key)) continue
    seen.add(key)
    result.push(normalizedMeasurement)
  }
  return result
}

function withMeasurementKeys(measurements: SanityMeasurement[]): SanityArrayMeasurement[] {
  return measurements.map((measurement) => ({
    ...measurement,
    _key: stableKey(`measurement:${measurement.value}:${measurement.unit.toLowerCase()}`),
  }))
}

function withSurfaceAppearancePaletteKeys(appearance: ExtractedVendorVariant['surfaceAppearance']) {
  if (!appearance) return undefined
  return {
    ...appearance,
    palette: appearance.palette.map((colour, index) => ({
      ...colour,
      _key: stableKey(`surface-palette:${colour.hex}:${index}`),
    })),
  }
}

const LENGTH_UNIT_TO_MM: Record<string, number> = {
  mm: 1,
  cm: 10,
  m: 1000,
}

function normalizeMeasurementToMetres(measurement: SanityMeasurement): SanityMeasurement {
  const millimetres = normalizeMeasurementToMm(measurement)
  if (millimetres === undefined) return measurement
  return {_type: 'measurement', value: Number((millimetres / 1000).toFixed(4)), unit: 'm'}
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
    const colourName = variant.label ?? variant.colourName ?? `variant ${variantIndex + 1}`
    const classified = new Map((variant.classifiedImages ?? []).map((image) => [image.url, image.role]))
    const primarySwatchUrl = variant.swatchImageUrl ?? variant.swatchImageUrls?.[0]
    const secondarySwatches = new Set((variant.swatchImageUrls ?? []).filter((url) => url !== primarySwatchUrl))
    const allUrls = [...new Set([...(variant.imageUrls ?? []), primarySwatchUrl, ...secondarySwatches].filter(Boolean) as string[])]
    let hasPrimaryImage = false
    allUrls.forEach((sourceUrl) => {
      const classifiedRole = classified.get(sourceUrl)
      const role = sourceUrl === primarySwatchUrl || (classifiedRole === 'swatch' && !secondarySwatches.has(sourceUrl))
        ? 'swatch'
        : classifiedRole === 'roomshot' || classifiedRole === 'technical'
          ? classifiedRole
          : 'product'
      const target: AssetUpload['target'] = role === 'swatch'
        ? {scope: 'variant', variantKey, field: 'swatchImage'}
        : role === 'product' && !hasPrimaryImage
          ? {scope: 'variant', variantKey, field: 'primaryImage'}
          : role === 'product' ? {scope: 'variant', variantKey, field: 'images'} : {scope: 'product', field: 'gallery'}
      if (role === 'product') hasPrimaryImage = true
      const targetKey = target.scope === 'variant' ? `${target.variantKey}:${target.field}` : target.field
      uploads.set(`${targetKey}:${sourceUrl}`, {
        sourceUrl, role,
        alt: role === 'roomshot'
          ? `${productName} in a room setting`
          : role === 'technical'
            ? `${productName} technical detail`
            : `${productName}, ${colourName}`,
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
function buildSpecs(review: ExtractedReviewModel, fieldMap: Map<string, RegistryFieldValue>, trade: string | undefined): SanitySpec[] {
  const known = review.knownSpecifications.filter((attribute) => attribute.included && !isRegistryFieldMappedToSanity(attribute.key)).flatMap((attribute) => {
    const value = formatValue(attribute.value)
    if (!value) return []
    return [{
      _key: stableKey(attribute.key), _type: 'specification' as const, key: attribute.key,
      label: knownRegistryLabel(trade, attribute.key, 'specifications'), value, source: 'vendor' as const,
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
function buildFeatures(review: ExtractedReviewModel, fieldMap: Map<string, RegistryFieldValue>, trade: string | undefined): SanityProductFeature[] {
  const known = review.knownFeatures.filter((attribute) => attribute.included && attribute.value === true && !isRegistryFieldMappedToSanity(attribute.key)).map((attribute) => ({
    _key: stableKey(attribute.key), _type: 'productFeature' as const, key: attribute.key,
    label: knownRegistryLabel(trade, attribute.key, 'features'), source: 'vendor' as const,
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

function knownRegistryLabel(trade: string | undefined, key: string, category: 'features' | 'specifications'): string {
  const entry = getRegistryEntriesForTrade(trade).find((candidate) => candidate.field === key && candidate.category === category)
  return entry?.label ?? registryFieldLabel(key)
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