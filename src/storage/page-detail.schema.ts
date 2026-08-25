import { z } from 'zod'

import { registryFieldValueSchema, variantRegistryFieldValueSchema } from '../registry/field-registry.js'
import { classifiedImageSchema } from './image-classification.schema.js'

export const crawlPageRoleSchema = z.enum(['range', 'variant', 'single'])
export const crawlProductDetailStatusSchema = z.enum(['draft', 'ready'])

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
  imageUrls: z.array(z.string().trim().min(1)).optional(),
  swatchImageUrls: z.array(z.string().trim().min(1)).optional(),
  classifiedImages: z.array(classifiedImageSchema).optional(),
  swatchHex: z.string().trim().min(1).optional(),
  variantFields: z.array(variantRegistryFieldValueSchema).optional(),
  widths: z.array(extractedWidthSlotSchema).optional(),
  dynamicFields: z.array(extractedDynamicFieldSchema).optional(),
  features: z.array(z.string().trim().min(1)).optional(),
  specifications: z.array(extractedAdditionalAttributeSchema).optional(),
  suitability: z.array(z.string().trim().min(1)).optional()
})

export const extractedVendorProductPageSchema = z.object({
  url: z.string().trim().min(1),
  pageRole: crawlPageRoleSchema,
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

export const crawlPageDetailTableSchema = z.object({
  partitionKey: z.string().trim().min(1),
  rowKey: z.string().trim().min(1),
  urlKey: z.string().trim().min(1),
  sourceGroupKey: z.string().trim().min(1),
  pageRole: crawlPageRoleSchema,
  status: crawlProductDetailStatusSchema,
  detailJson: z.string().trim().min(1),
  extractedDetailBlobPath: z.string().trim().min(1).optional(),
  vendorProductPageBlobPath: z.string().trim().min(1).optional(),
  ttlExpiresAt: z.string().trim().min(1).optional()
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
  pageRole: crawlPageRoleSchema,
  status: crawlProductDetailStatusSchema,
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

export const extractedDetailBlobSchema = z.object({
  styleCode: z.string().trim().min(1).optional(),
  trade: z.string().trim().min(1).optional(),
  promptVersion: z.string().trim().min(1).optional(),
  url: z.string().trim().min(1).optional(),
  fields: z.array(registryFieldValueSchema).default([]),
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
  waterResistant: z.boolean().optional(),
  packInfo: extractedPackInfoSchema.optional(),
  dimensions: z.array(extractedDimensionSchema).optional(),
  look: z.string().trim().min(1).optional(),
  warnings: z.array(z.string().trim().min(1)).optional(),
  status: crawlProductDetailStatusSchema.optional(),
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

export type CrawlPageDetailTable = z.infer<typeof crawlPageDetailTableSchema>
export type CrawlPageRoleValue = z.infer<typeof crawlPageRoleSchema>
export type CrawlProductDetailStatusValue = z.infer<typeof crawlProductDetailStatusSchema>
export type PageDetailSummary = z.infer<typeof pageDetailSummarySchema>
export type RangeDetailSummary = z.infer<typeof rangeDetailSummarySchema>
export type ExtractedDetailBlob = z.infer<typeof extractedDetailBlobSchema>
export type ExtractedVendorProductPage = z.infer<typeof extractedVendorProductPageSchema>
export type ExtractedVendorVariant = z.infer<typeof extractedVendorVariantSchema>
export type CrawlPageDetailParsed =
  | {
      row: CrawlPageDetailTable
      detail: PageDetailSummary | RangeDetailSummary
      detailKind: 'page-detail-summary' | 'range-detail-summary'
    }

export function parseCrawlPageDetailTable(value: unknown): CrawlPageDetailTable {
  return crawlPageDetailTableSchema.parse(value)
}

export function parsePageDetailSummary(value: string): PageDetailSummary {
  return pageDetailSummarySchema.parse(JSON.parse(value))
}

export function parseRangeDetailSummary(value: string): RangeDetailSummary {
  return rangeDetailSummarySchema.parse(JSON.parse(value))
}

export function parseExtractedDetailBlob(value: string): ExtractedDetailBlob {
  return extractedDetailBlobSchema.parse(JSON.parse(value))
}

export function parseVendorProductPageBlob(value: string): ExtractedVendorProductPage {
  return extractedVendorProductPageSchema.parse(JSON.parse(value))
}

export function stringifyPageDetailSummary(value: unknown): string {
  return JSON.stringify(pageDetailSummarySchema.parse(value))
}

export function stringifyRangeDetailSummary(value: unknown): string {
  return JSON.stringify(rangeDetailSummarySchema.parse(value))
}

export function stringifyExtractedDetailBlob(value: unknown): string {
  return JSON.stringify(extractedDetailBlobSchema.parse(value))
}

export function stringifyVendorProductPageBlob(value: unknown): string {
  return JSON.stringify(extractedVendorProductPageSchema.parse(value))
}

export function parseCrawlPageDetail(row: CrawlPageDetailTable): CrawlPageDetailParsed {
  const parsed = JSON.parse(row.detailJson) as { summaryType?: unknown }

  if (parsed?.summaryType === 'range-detail-summary') {
    return {
      row,
      detail: rangeDetailSummarySchema.parse(parsed),
      detailKind: 'range-detail-summary'
    }
  }

  return {
    row,
    detail: pageDetailSummarySchema.parse(parsed),
    detailKind: 'page-detail-summary'
  }
}