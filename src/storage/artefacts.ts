import { z } from 'zod'

export const extractedScalarMeasurementSchema = z.object({
  value: z.number(),
  unit: z.string().trim().min(1)
})

export const extractedMeasurementSchema = z.object({
  label: z.string().trim().min(1),
  value: z.number(),
  unit: z.string().trim().min(1)
})

export const extractedPackInfoSchema = z.object({
  length: extractedScalarMeasurementSchema.optional(),
  width: extractedScalarMeasurementSchema.optional(),
  height: extractedScalarMeasurementSchema.optional(),
  coverage: extractedScalarMeasurementSchema.optional(),
  piecesPerPack: z.number().int().positive().optional()
})

export const extractedDimensionSchema = z.object({
  length: extractedScalarMeasurementSchema.optional(),
  width: extractedScalarMeasurementSchema.optional()
})

export const extractedAdditionalAttributeSchema = z.object({
  description: z.string().trim().min(1),
  value: z.string().trim().min(1)
})

export const extractedDynamicFieldValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  extractedScalarMeasurementSchema
])

export const extractedDynamicFieldSchema = z.object({
  fieldName: z.string().trim().min(1),
  value: extractedDynamicFieldValueSchema
})

export const extractedWidthSlotSchema = z.object({
  widthLabel: z.string().trim().min(1)
})

export const extractedVendorVariantSchema = z.object({
  variantId: z.string().trim().min(1).optional(),
  label: z.string().trim().min(1).optional(),
  url: z.string().trim().min(1).optional(),
  colourName: z.string().trim().min(1).optional(),
  swatchImageUrl: z.string().trim().min(1).optional(),
  swatchHex: z.string().trim().min(1).optional(),
  widths: z.array(extractedWidthSlotSchema).optional(),
  dynamicFields: z.array(extractedDynamicFieldSchema).optional(),
  features: z.array(z.string().trim().min(1)).optional(),
  specifications: z.array(extractedAdditionalAttributeSchema).optional(),
  suitability: z.array(z.string().trim().min(1)).optional()
})

export const extractedVendorProductPageSchema = z.object({
  url: z.string().trim().min(1),
  pageRole: z.enum(['range', 'variant', 'single']),
  rangeName: z.string().trim().min(1).optional(),
  productType: z.string().trim().min(1).optional(),
  brandName: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  features: z.array(z.string().trim().min(1)),
  specifications: z.array(extractedAdditionalAttributeSchema),
  widths: z.array(extractedWidthSlotSchema),
  dynamicFields: z.array(extractedDynamicFieldSchema),
  variants: z.array(extractedVendorVariantSchema)
})

export const extractedReviewKnownAttributeSchema = z.object({
  key: z.string().trim().min(1),
  value: z.unknown(),
  required: z.boolean(),
  included: z.boolean()
})

export const extractedReviewAdditionalAttributeSchema = z.object({
  description: z.string().trim().min(1),
  value: z.string().trim().min(1),
  included: z.boolean()
})

export const extractedReviewModelSchema = z.object({
  knownSpecifications: z.array(extractedReviewKnownAttributeSchema),
  knownFeatures: z.array(extractedReviewKnownAttributeSchema),
  additionalSpecifications: z.array(extractedReviewAdditionalAttributeSchema),
  additionalFeatures: z.array(extractedReviewAdditionalAttributeSchema)
})

export const extractedPatternEvidenceSchema = z.object({
  horizontalRepeat: z.string().trim().min(1).optional(),
  horizontalDrop: z.string().trim().min(1).optional(),
  verticalRepeat: z.string().trim().min(1).optional(),
  verticalDrop: z.string().trim().min(1).optional()
})

export const extractedDetailBlobSchema = z.object({
  styleCode: z.string().trim().min(1).optional(),
  trade: z.string().trim().min(1).optional(),
  promptVersion: z.string().trim().min(1).optional(),
  url: z.string().trim().min(1).optional(),
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  productType: z.string().trim().min(1).optional(),
  construction: z.string().trim().min(1).optional(),
  pileFibreComposition: z.string().trim().min(1).optional(),
  pileHeight: extractedScalarMeasurementSchema.optional(),
  thickness: extractedScalarMeasurementSchema.optional(),
  pileWeight: z.string().trim().min(1).optional(),
  totalWeight: z.string().trim().min(1).optional(),
  backing: z.string().trim().min(1).optional(),
  gauge: z.string().trim().min(1).optional(),
  stitchCount: z.string().trim().min(1).optional(),
  width: z.string().trim().min(1).optional(),
  totalHeight: extractedScalarMeasurementSchema.optional(),
  fireRating: z.string().trim().min(1).optional(),
  mothResistant: z.boolean().optional(),
  stainResistant: z.boolean().optional(),
  antiStatic: z.boolean().optional(),
  suitabilityUfH: z.boolean().optional(),
  features: z.array(z.string().trim().min(1)).optional(),
  patternEvidence: extractedPatternEvidenceSchema.optional(),
  waterResistant: z.boolean().optional(),
  packInfo: extractedPackInfoSchema.optional(),
  dimensions: z.array(extractedDimensionSchema).optional(),
  look: z.string().trim().min(1).optional(),
  additionalSpecifications: z.array(extractedAdditionalAttributeSchema).optional(),
  additionalFeatures: z.array(extractedAdditionalAttributeSchema).optional(),
  measurements: z.array(extractedMeasurementSchema).optional(),
  warnings: z.array(z.string().trim().min(1)).optional(),
  status: z.enum(['draft', 'ready']).optional(),
  hasDiscoveredVariants: z.boolean().optional(),
  discoveredVariantCount: z.number().int().nonnegative().optional(),
  variantUrls: z.array(z.string().trim().min(1)).optional(),
  hasVariantCoverage: z.boolean().optional(),
  variantCoverageSource: z.string().trim().min(1).optional(),
  contentHash: z.string().trim().min(1).optional(),
  visibleTextLength: z.number().int().nonnegative().optional(),
  review: extractedReviewModelSchema.optional(),
  vendorProductPage: extractedVendorProductPageSchema.optional(),
  extractedDetailBlobPath: z.string().trim().min(1).optional(),
  vendorProductPageBlobPath: z.string().trim().min(1).optional()
})

export const pageDetailSummarySchema = z.object({
  summaryType: z.literal('page-detail-summary'),
  trade: z.string().trim().min(1).optional(),
  promptVersion: z.string().trim().min(1).optional(),
  styleCode: z.string().trim().min(1).optional(),
  url: z.string().trim().min(1),
  title: z.string().trim().min(1).optional(),
  description: z.string().optional(),
  productType: z.string().trim().min(1).optional(),
  warnings: z.array(z.string().trim().min(1)).optional(),
  warningCount: z.number().int().nonnegative(),
  contentHash: z.string().trim().min(1).optional(),
  visibleTextLength: z.number().int().nonnegative().optional(),
  pageRole: z.enum(['range', 'variant', 'single']),
  status: z.enum(['draft', 'ready']),
  hasVariantCoverage: z.boolean(),
  variantCoverageSource: z.string().trim().min(1)
})

export const rangeDetailSummarySchema = z.object({
  summaryType: z.literal('range-detail-summary'),
  styleCode: z.string().trim().min(1).optional(),
  url: z.string().trim().min(1),
  contentHash: z.string().trim().min(1).optional(),
  discoveredVariantCount: z.number().int().nonnegative(),
  hasDiscoveredVariants: z.boolean()
})

export const variantDetailSummarySchema = z.object({
  summaryType: z.literal('variant-detail-summary'),
  variantId: z.string().trim().min(1).optional(),
  label: z.string().trim().min(1).optional(),
  url: z.string().trim().min(1).optional(),
  colourName: z.string().trim().min(1).optional(),
  swatchImageUrl: z.string().trim().min(1).optional(),
  swatchHex: z.string().trim().min(1).optional()
})

export const composedProductSummarySchema = z.object({
  url: z.string().trim().min(1),
  pageRole: z.enum(['range', 'variant', 'single']),
  contentHash: z.string().trim().min(1).optional(),
  visibleTextLength: z.number().int().nonnegative(),
  renderedAt: z.string().trim().min(1)
})

export const composedProductSourceSchema = z.object({
  styleCode: z.string().trim().min(1).optional()
})

export const compactVendorProductPageSchema = z.object({
  url: z.string().trim().min(1),
  pageRole: z.enum(['range', 'variant', 'single']),
  rangeName: z.string().trim().min(1).optional(),
  productType: z.string().trim().min(1).optional(),
  brandName: z.string().trim().min(1).optional(),
  widths: z.array(extractedWidthSlotSchema),
  variantCount: z.number().int().nonnegative()
})

export const productDetailSummarySchema = z.object({
  summaryType: z.literal('product-detail-summary'),
  summary: composedProductSummarySchema,
  source: composedProductSourceSchema,
  extracted: z.object({
    styleCode: z.string().trim().min(1).optional(),
    trade: z.string().trim().min(1).optional(),
    promptVersion: z.string().trim().min(1).optional(),
    url: z.string().trim().min(1).optional(),
    title: z.string().trim().min(1).optional(),
    description: z.string().optional(),
    productType: z.string().trim().min(1).optional(),
    warnings: z.array(z.string().trim().min(1)).optional(),
    status: z.enum(['draft', 'ready']).optional(),
    hasDiscoveredVariants: z.boolean().optional(),
    discoveredVariantCount: z.number().int().nonnegative().optional(),
    hasVariantCoverage: z.boolean().optional(),
    variantCoverageSource: z.string().trim().min(1).optional(),
    contentHash: z.string().trim().min(1).optional(),
    visibleTextLength: z.number().int().nonnegative().optional(),
    warningCount: z.number().int().nonnegative(),
    extractedDetailBlobPath: z.string().trim().min(1).optional(),
    vendorProductPageBlobPath: z.string().trim().min(1).optional(),
    vendorProductPage: compactVendorProductPageSchema.optional()
  }),
  review: z.object({
    knownSpecificationKeys: z.array(z.string().trim().min(1)),
    knownFeatureKeys: z.array(z.string().trim().min(1)),
    additionalSpecificationCount: z.number().int().nonnegative(),
    additionalFeatureCount: z.number().int().nonnegative()
  }),
  composition: z.object({
    readinessReasons: z.array(z.string().trim().min(1)),
    hasExtractedDetail: z.boolean()
  })
})

export const composedProductDetailBlobSchema = z.object({
  summary: composedProductSummarySchema,
  source: composedProductSourceSchema,
  extracted: extractedDetailBlobSchema,
  review: extractedReviewModelSchema,
  composition: z.object({
    readinessReasons: z.array(z.string().trim().min(1)),
    hasExtractedDetail: z.boolean()
  })
})

export type ExtractedScalarMeasurement = z.infer<typeof extractedScalarMeasurementSchema>
export type ExtractedMeasurement = z.infer<typeof extractedMeasurementSchema>
export type ExtractedPackInfo = z.infer<typeof extractedPackInfoSchema>
export type ExtractedDimension = z.infer<typeof extractedDimensionSchema>
export type ExtractedAdditionalAttribute = z.infer<typeof extractedAdditionalAttributeSchema>
export type ExtractedDynamicField = z.infer<typeof extractedDynamicFieldSchema>
export type ExtractedWidthSlot = z.infer<typeof extractedWidthSlotSchema>
export type ExtractedVendorVariant = z.infer<typeof extractedVendorVariantSchema>
export type ExtractedVendorProductPage = z.infer<typeof extractedVendorProductPageSchema>
export type ExtractedReviewModel = z.infer<typeof extractedReviewModelSchema>
export type ExtractedDetailBlob = z.infer<typeof extractedDetailBlobSchema>
export type PageDetailSummary = z.infer<typeof pageDetailSummarySchema>
export type RangeDetailSummary = z.infer<typeof rangeDetailSummarySchema>
export type VariantDetailSummary = z.infer<typeof variantDetailSummarySchema>
export type ProductDetailSummary = z.infer<typeof productDetailSummarySchema>
export type ComposedProductDetailBlob = z.infer<typeof composedProductDetailBlobSchema>

export function parsePageDetailSummary(value: string): PageDetailSummary {
  return pageDetailSummarySchema.parse(JSON.parse(value))
}

export function parseRangeDetailSummary(value: string): RangeDetailSummary {
  return rangeDetailSummarySchema.parse(JSON.parse(value))
}

export function parseVariantDetailSummary(value: string): VariantDetailSummary {
  return variantDetailSummarySchema.parse(JSON.parse(value))
}

export function parseProductDetailSummary(value: string): ProductDetailSummary {
  return productDetailSummarySchema.parse(JSON.parse(value))
}

export function parseExtractedDetailBlob(value: string): ExtractedDetailBlob {
  return extractedDetailBlobSchema.parse(JSON.parse(value))
}

export function parseVendorProductPageBlob(value: string): ExtractedVendorProductPage {
  return extractedVendorProductPageSchema.parse(JSON.parse(value))
}

export function parseVariantDetailBlob(value: string): ExtractedVendorVariant {
  return extractedVendorVariantSchema.parse(JSON.parse(value))
}

export function parseComposedProductDetailBlob(value: string): ComposedProductDetailBlob {
  return composedProductDetailBlobSchema.parse(JSON.parse(value))
}