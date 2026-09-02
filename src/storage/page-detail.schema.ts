import { z } from 'zod'

import { registryFieldValueSchema, variantRegistryFieldValueSchema } from '../registry/field-registry.js'
import { classifiedImageSchema } from './image-classification.schema.js'

export const crawlPageRoleSchema = z.enum(['range', 'variant', 'single'])
export const crawlProductDetailStatusSchema = z.enum(['draft', 'ready'])

export const extractedScalarMeasurementSchema = z.object({
  value: z.number(),
  unit: z.string().trim().min(1)
})

export type ExtractedScalarMeasurement = z.infer<typeof extractedScalarMeasurementSchema>

// m2crm's per-SKU roll width(s) (confirmed live via m2crm's native `width` product field, e.g.
// "13'1\"" on the /400 SKU vs "16'5\"" on the /500 SKU of the same range) - authoritative business
// data like price, not a bias hint. Persisted as a JSON-stringified column on Table Storage
// rows, consistent with variantUrlsJson/packInfoHintJson.
export const rawWidthHintSchema = z.array(extractedScalarMeasurementSchema)

export type RawWidthHint = z.infer<typeof rawWidthHintSchema>

export function parseRawWidthHint(value: string): RawWidthHint {
  return rawWidthHintSchema.parse(JSON.parse(value))
}

export function stringifyRawWidthHint(value: unknown): string {
  return JSON.stringify(rawWidthHintSchema.parse(value))
}

export const extractedAdditionalAttributeSchema = z.object({
  description: z.string().trim().min(1),
  value: z.string().trim().min(1)
})

export const extractedDynamicFieldValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  extractedScalarMeasurementSchema,
  z.array(extractedScalarMeasurementSchema)
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
  hasDecorativePattern: z.boolean().optional(),
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

// Mirrors azure's ExtractedDetail TS type (extractedDetail.ts) exactly. Named trade fields
// (construction, pileWeight, backing, etc.) live only in registry-driven `fields[]`;
// vendor specifications/dynamic fields are reserved for genuinely additional or variant-only facts.
export const extractedDetailBlobSchema = z.object({
  styleCode: z.string().trim().min(1).optional(),
  trade: z.string().trim().min(1).optional(),
  promptVersion: z.string().trim().min(1).optional(),
  url: z.string().trim().min(1).optional(),
  fields: z.array(registryFieldValueSchema).default([]),
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
export type ExtractedVendorVariant = z.infer<typeof extractedVendorVariantSchema>
export type ExtractedReviewKnownAttribute = z.infer<typeof extractedReviewKnownAttributeSchema>
export type ExtractedReviewAdditionalAttribute = z.infer<typeof extractedReviewAdditionalAttributeSchema>
export type ExtractedReviewModel = z.infer<typeof extractedReviewModelSchema>
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