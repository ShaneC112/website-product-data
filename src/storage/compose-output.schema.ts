import { z } from 'zod'
import { crawlProductDetailStatusSchema } from './page-detail.schema.js'
import {
  parseProductDetailSummary,
  type ComposedProductDetailBlob,
  type ProductDetailSummary
} from './product-detail.schema.js'

// 06-compose's own output table (split from the former shared crawlProductDetail table - see
// plan/queue file refactor/01a-entity-table-redesign.md). Row shape is unchanged from before the
// split; detail-blob content still uses product-detail.schema.ts's summary/blob format.
export const composeOutputTableSchema = z.object({
  partitionKey: z.string().trim().min(1),
  rowKey: z.string().trim().min(1),
  urlKey: z.string().trim().min(1).optional(),
  sourceGroupKey: z.string().trim().min(1).optional(),
  sourceGroupStorageKey: z.string().trim().min(1).optional(),
  styleCodeRaw: z.string().trim().min(1).optional(),
  styleCodeStorageKey: z.string().trim().min(1).optional(),
  sourceTableName: z.string().trim().min(1).optional(),
  sourceRowKey: z.string().trim().min(1).optional(),
  m2crmUuid: z.string().trim().min(1).optional(),
  vendorSku: z.string().trim().min(1).optional(),
  price: z.number().optional(),
  vatRate: z.number().optional(),
  boxSalesPrice: z.number().optional(),
  boxUnit: z.string().trim().min(1).optional(),
  packInfoHintJson: z.string().trim().min(1).optional(),
  rawWidthHintJson: z.string().trim().min(1).optional(),
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

export type ComposeOutputTable = z.infer<typeof composeOutputTableSchema>
export type ComposeOutputParsed = {
  row: ComposeOutputTable
  summary: ProductDetailSummary | null
}
export type ComposeOutputWithBlob = ComposeOutputParsed & {
  blob: ComposedProductDetailBlob | null
}

export function parseComposeOutputTable(value: unknown): ComposeOutputTable {
  return composeOutputTableSchema.parse(value)
}

export function parseComposeOutput(row: ComposeOutputTable): ComposeOutputParsed {
  return {
    row,
    summary: row.detailJson ? parseProductDetailSummary(row.detailJson) : null
  }
}

export function composeOutputWithBlob(
  row: ComposeOutputTable,
  blob: ComposedProductDetailBlob | null
): ComposeOutputWithBlob {
  return {
    ...parseComposeOutput(row),
    blob
  }
}
