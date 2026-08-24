import { z } from 'zod'
import { extractedVendorVariantSchema } from './page-detail.schema'

export const crawlVariantDetailTableSchema = z.object({
  partitionKey: z.string().trim().min(1),
  rowKey: z.string().trim().min(1),
  sourceGroupKey: z.string().trim().min(1),
  sourceGroupStorageKey: z.string().trim().min(1).optional(),
  parentUrlKey: z.string().trim().min(1),
  variantId: z.string().trim().min(1).optional(),
  variantUrl: z.string().trim().min(1).optional(),
  label: z.string().trim().min(1).optional(),
  detailJson: z.string().trim().min(1),
  detailBlobPath: z.string().trim().min(1).optional(),
  ttlExpiresAt: z.string().trim().min(1).optional()
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

export type CrawlVariantDetailTable = z.infer<typeof crawlVariantDetailTableSchema>
export type VariantDetailSummary = z.infer<typeof variantDetailSummarySchema>
export type VariantDetailBlob = z.infer<typeof extractedVendorVariantSchema>
export type CrawlVariantDetailParsed = {
  row: CrawlVariantDetailTable
  summary: VariantDetailSummary
}
export type CrawlVariantDetailWithBlob = CrawlVariantDetailParsed & {
  blob: VariantDetailBlob | null
}

export function parseCrawlVariantDetailTable(value: unknown): CrawlVariantDetailTable {
  return crawlVariantDetailTableSchema.parse(value)
}

export function parseVariantDetailSummary(value: string): VariantDetailSummary {
  return variantDetailSummarySchema.parse(JSON.parse(value))
}

export function parseVariantDetailBlob(value: string): VariantDetailBlob {
  return extractedVendorVariantSchema.parse(JSON.parse(value))
}

export function stringifyVariantDetailSummary(value: unknown): string {
  return JSON.stringify(variantDetailSummarySchema.parse(value))
}

export function stringifyVariantDetailBlob(value: unknown): string {
  return JSON.stringify(extractedVendorVariantSchema.parse(value))
}

export function parseCrawlVariantDetail(row: CrawlVariantDetailTable): CrawlVariantDetailParsed {
  return {
    row,
    summary: parseVariantDetailSummary(row.detailJson)
  }
}

export function composeCrawlVariantDetail(
  row: CrawlVariantDetailTable,
  blob: VariantDetailBlob | null
): CrawlVariantDetailWithBlob {
  return {
    ...parseCrawlVariantDetail(row),
    blob
  }
}