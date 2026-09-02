import {z} from 'zod'
import {SANITY_CATEGORY_KEYS, SANITY_CONTENT_REQUIREMENTS, SANITY_PRODUCT_TYPES, type SanityCategoryKey, type SanityProductType} from '../registry/product-taxonomy.js'

// This schema covers exactly the fields Azure guarantees to produce for a transform plan to cross
// the bridge into Sanity - it deliberately does NOT restrict what the real Studio schema can have.
// Studio is free to add unrelated editorial fields; this schema only exists so Phase 08's
// drift-guard test can catch a breaking change (a bridge-relied-on field deleted/renamed in Studio).

const sanityBridgeMeasurementSchema = z.object({
  value: z.number(),
  unit: z.string().trim().min(1),
})

const sanityBridgePriceSchema = z.object({
  currency: z.string().trim().min(1),
  unit: z.string().trim().min(1),
  retailExVat: z.number(),
  vatRate: z.number(),
  retailIncVat: z.number(),
})

const sanityBridgePackInfoSchema = z.object({
  coverage: sanityBridgeMeasurementSchema.optional(),
  piecesPerPack: z.number().optional(),
  length: sanityBridgeMeasurementSchema.optional(),
  width: sanityBridgeMeasurementSchema.optional(),
  height: sanityBridgeMeasurementSchema.optional(),
})

const sanityBridgeVariantOverridesSchema = z.object({
  price: z.boolean(),
  packPrice: z.boolean(),
  packInfo: z.boolean(),
  widths: z.boolean(),
  suitableRooms: z.boolean(),
  pattern: z.boolean(),
  specs: z.boolean(),
})

const sanityBridgeVariantSchema = z.object({
  variantId: z.string().trim().min(1),
  colourName: z.string().trim().min(1),
  colourFamily: z.string().trim().min(1),
  hex: z.string().trim().min(1),
  // a swatch source marker - NOT required on every variant (only "at least one variant" is
  // enforced, by evaluateBridgeEligibility). Left loose (z.unknown) rather than the full uploaded
  // SanityImage shape, since the built transform plan may only carry a pending-upload marker at
  // the point this schema is evaluated, not yet the final asset reference.
  swatchImage: z.unknown().optional(),
  widths: z.array(sanityBridgeMeasurementSchema).optional(),
  overrides: sanityBridgeVariantOverridesSchema,
  price: sanityBridgePriceSchema.optional(),
  packPrice: sanityBridgePriceSchema.optional(),
  packInfo: sanityBridgePackInfoSchema.optional(),
  patternRepeatCm: z.number().positive().optional(),
  repeatsInSwatch: z.number().int().positive().optional(),
  suitableRooms: z.array(z.string()).optional(),
  specs: z.array(z.unknown()).optional(),
})

export const sanityBridgeProductSchema = z.object({
  name: z.string().trim().min(1),
  slug: z.object({current: z.string().trim().min(1)}),
  productType: z.enum(SANITY_PRODUCT_TYPES),
  // Must be one of the developer-defined outputs derived from a supported product type, rather
  // than an independently extracted category choice that could conflict with that product type.
  categoryKey: z.custom<SanityCategoryKey>((value) => typeof value === 'string' && SANITY_CATEGORY_KEYS.includes(value as SanityCategoryKey), {
    message: 'Category key must be mapped from a supported product type',
  }),
  brand: z.string().trim().min(1).optional(),
  shortDescription: z.string().trim().min(1).optional(),
  features: z.array(z.unknown()).optional(),
  specs: z.array(z.unknown()).optional(),
  suitableRooms: z.array(z.string()).optional(),
  price: sanityBridgePriceSchema.optional(),
  priceOnRequest: z.boolean().optional(),
  packPrice: sanityBridgePriceSchema.optional(),
  packInfo: sanityBridgePackInfoSchema.optional(),
  patternRepeatCm: z.number().positive().optional(),
  repeatsInSwatch: z.number().int().positive().optional(),
  widths: z.array(sanityBridgeMeasurementSchema).optional(),
  variants: z.array(sanityBridgeVariantSchema).min(1),
  importMeta: z.object({
    externalId: z.string().trim().min(1),
    vendorId: z.string().trim().min(1),
    sourceUrl: z.string().trim().min(1),
    importedAt: z.string().trim().min(1),
  }),
})

export type SanityBridgeProduct = z.infer<typeof sanityBridgeProductSchema>

export type BridgeEligibilityResult =
  | {eligible: true; reasons: []}
  | {eligible: false; reasons: string[]}

// Azure-internal only: these reasons are never written to Sanity (see Phase 04's `held` outcome).
// Never merge this with evaluatePublicationGate/the Studio publish gate - the bridge gate decides
// whether crawled data is good enough to reach Sanity at all; the Studio gate is editor-facing and
// only checks fields a human can see and fix.
export function evaluateBridgeEligibility(draft: unknown): BridgeEligibilityResult {
  const parsed = sanityBridgeProductSchema.safeParse(draft)
  if (!parsed.success) {
    const reasons = [...new Set(parsed.error.issues.map((issue) => describeSchemaIssue(issue)))]
    return {eligible: false, reasons}
  }

  const product = parsed.data
  const reasons: string[] = []

  if (!product.variants.some((variant) => Boolean(variant.swatchImage))) {
    reasons.push('missing_swatch_image')
  }

  const requirements = SANITY_CONTENT_REQUIREMENTS[product.productType as SanityProductType]
  if (requirements.requiresWidth && (product.widths ?? []).length === 0) {
    reasons.push('missing_required_width')
  }

  if (requirements.requiresPackInfo && !product.packInfo && !product.packPrice
    && !product.variants.some((variant) => variant.packInfo || variant.packPrice)) {
    reasons.push('missing_required_pack_info')
  }

  return reasons.length === 0 ? {eligible: true, reasons: []} : {eligible: false, reasons}
}

function describeSchemaIssue(issue: z.ZodIssue): string {
  const path = issue.path.join('.')
  if (path === 'productType') return 'trade_unmapped'
  if (path === 'variants' && issue.code === 'too_small') return 'missing_variants'
  return path ? `invalid_${path.replace(/\./g, '_')}` : 'invalid_bridge_product'
}
