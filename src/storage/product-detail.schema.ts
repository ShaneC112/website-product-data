import { z } from 'zod'
import {
  crawlPageRoleSchema,
  crawlProductDetailStatusSchema,
  extractedDetailBlobSchema,
  extractedReviewModelSchema,
  extractedWidthSlotSchema
} from './page-detail.schema.js'

export const crawlProductDetailTableSchema = z.object({
  partitionKey: z.string().trim().min(1),
  rowKey: z.string().trim().min(1),
  urlKey: z.string().trim().min(1).optional(),
  sourceGroupKey: z.string().trim().min(1).optional(),
  sourceGroupStorageKey: z.string().trim().min(1).optional(),
  sourceTableName: z.string().trim().min(1).optional(),
  sourceRowKey: z.string().trim().min(1).optional(),
  vendorSku: z.string().trim().min(1).optional(),
  rawPriceMinor: z.number().optional(),
  vatRate: z.number().optional(),
  styleCode: z.string().trim().min(1).optional(),
  trade: z.string().trim().min(1).optional(),
  status: crawlProductDetailStatusSchema.optional(),
  detailJson: z.string().trim().min(1).optional(),
  detailBlobPath: z.string().trim().min(1).optional(),
  composedBlobPath: z.string().trim().min(1).optional(),
  publishedAt: z.string().trim().min(1).optional(),
  updatedAt: z.string().trim().min(1).optional(),
  createdAt: z.string().trim().min(1).optional(),
  promptVersion: z.string().trim().min(1).optional()
})

export const composedProductSummarySchema = z.object({
  url: z.string().trim().min(1),
  pageRole: crawlPageRoleSchema,
  contentHash: z.string().trim().min(1).optional(),
  visibleTextLength: z.number().int().nonnegative(),
  renderedAt: z.string().trim().min(1)
})

export const composedProductSourceSchema = z.object({
  styleCode: z.string().trim().min(1).optional()
})

export const compactVendorProductPageSchema = z.object({
  url: z.string().trim().min(1),
  pageRole: crawlPageRoleSchema,
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
    trade: z.string().optional(),
    promptVersion: z.string().trim().min(1).optional(),
    url: z.string().trim().min(1).optional(),
    title: z.string().trim().min(1).optional(),
    description: z.string().optional(),
    productType: z.string().trim().min(1).optional(),
    warnings: z.array(z.string().trim().min(1)).optional(),
    status: crawlProductDetailStatusSchema.optional(),
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
  extracted: extractedDetailBlobSchema.extend({
    trade: z.string().optional()
  }),
  review: extractedReviewModelSchema,
  composition: z.object({
    readinessReasons: z.array(z.string().trim().min(1)),
    hasExtractedDetail: z.boolean()
  })
})

export type CrawlProductDetailTable = z.infer<typeof crawlProductDetailTableSchema>
export type ProductDetailSummary = z.infer<typeof productDetailSummarySchema>
export type ComposedProductDetailBlob = z.infer<typeof composedProductDetailBlobSchema>
export type CrawlProductDetailParsed = {
  row: CrawlProductDetailTable
  summary: ProductDetailSummary | null
}
export type CrawlProductDetailWithBlob = CrawlProductDetailParsed & {
  blob: ComposedProductDetailBlob | null
}

export function parseCrawlProductDetailTable(value: unknown): CrawlProductDetailTable {
  return crawlProductDetailTableSchema.parse(value)
}

export function parseProductDetailSummary(value: string): ProductDetailSummary {
  return productDetailSummarySchema.parse(JSON.parse(value))
}

export function parseComposedProductDetailBlob(value: string): ComposedProductDetailBlob {
  return composedProductDetailBlobSchema.parse(JSON.parse(value))
}

export function stringifyProductDetailSummary(value: unknown): string {
  return JSON.stringify(productDetailSummarySchema.parse(value))
}

export function stringifyComposedProductDetailBlob(value: unknown): string {
  return JSON.stringify(composedProductDetailBlobSchema.parse(value))
}

export function parseCrawlProductDetail(row: CrawlProductDetailTable): CrawlProductDetailParsed {
  return {
    row,
    summary: row.detailJson ? parseProductDetailSummary(row.detailJson) : null
  }
}

export function composeCrawlProductDetail(
  row: CrawlProductDetailTable,
  blob: ComposedProductDetailBlob | null
): CrawlProductDetailWithBlob {
  return {
    ...parseCrawlProductDetail(row),
    blob
  }
}