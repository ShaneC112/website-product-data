import { z } from 'zod'
import {
  crawlPageRoleSchema,
  crawlProductDetailStatusSchema,
  pageDetailSummarySchema,
  rangeDetailSummarySchema,
  type PageDetailSummary,
  type RangeDetailSummary
} from './page-detail.schema.js'

// 04-variant-extract's own output table (split from the former shared crawlPageDetail table -
// see plan/queue file refactor/01a-entity-table-redesign.md). Row shape is unchanged from before
// the split; only the owning table/step differs from sourceExtractDetail.
export const variantExtractDetailTableSchema = z.object({
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

export type VariantExtractDetailTable = z.infer<typeof variantExtractDetailTableSchema>
export type VariantExtractDetailParsed = {
  row: VariantExtractDetailTable
  detail: PageDetailSummary | RangeDetailSummary
  detailKind: 'page-detail-summary' | 'range-detail-summary'
}

export function parseVariantExtractDetailTable(value: unknown): VariantExtractDetailTable {
  return variantExtractDetailTableSchema.parse(value)
}

export function parseVariantExtractDetail(row: VariantExtractDetailTable): VariantExtractDetailParsed {
  const parsed = JSON.parse(row.detailJson) as { summaryType?: unknown }

  if (parsed?.summaryType === 'range-detail-summary') {
    return { row, detail: rangeDetailSummarySchema.parse(parsed), detailKind: 'range-detail-summary' }
  }

  return { row, detail: pageDetailSummarySchema.parse(parsed), detailKind: 'page-detail-summary' }
}
