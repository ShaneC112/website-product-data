import { z } from 'zod'
import {
  parseVariantDetailSummary,
  type VariantDetailBlob,
  type VariantDetailSummary
} from './variant-detail.schema.js'

// 05-image-classify's own output table (split from the former shared crawlVariantDetail table -
// see plan/queue file refactor/01a-entity-table-redesign.md). Row shape is unchanged from before
// the split; detail-blob content still uses variant-detail.schema.ts's summary/blob format.
export const imageClassifyOutcomeTableSchema = z.object({
  partitionKey: z.string().trim().min(1),
  rowKey: z.string().trim().min(1),
  sourceGroupKey: z.string().trim().min(1),
  sourceGroupStorageKey: z.string().trim().min(1).optional(),
  styleCodeRaw: z.string().trim().min(1).optional(),
  styleCodeStorageKey: z.string().trim().min(1).optional(),
  parentUrlKey: z.string().trim().min(1),
  variantId: z.string().trim().min(1).optional(),
  variantUrl: z.string().trim().min(1).optional(),
  label: z.string().trim().min(1).optional(),
  detailJson: z.string().trim().min(1),
  detailBlobPath: z.string().trim().min(1).optional(),
  ttlExpiresAt: z.string().trim().min(1).optional()
})

export type ImageClassifyOutcomeTable = z.infer<typeof imageClassifyOutcomeTableSchema>
export type ImageClassifyOutcomeParsed = {
  row: ImageClassifyOutcomeTable
  summary: VariantDetailSummary
}
export type ImageClassifyOutcomeWithBlob = ImageClassifyOutcomeParsed & {
  blob: VariantDetailBlob | null
}

export function parseImageClassifyOutcomeTable(value: unknown): ImageClassifyOutcomeTable {
  return imageClassifyOutcomeTableSchema.parse(value)
}

export function parseImageClassifyOutcome(row: ImageClassifyOutcomeTable): ImageClassifyOutcomeParsed {
  return {
    row,
    summary: parseVariantDetailSummary(row.detailJson)
  }
}

export function composeImageClassifyOutcome(
  row: ImageClassifyOutcomeTable,
  blob: VariantDetailBlob | null
): ImageClassifyOutcomeWithBlob {
  return {
    ...parseImageClassifyOutcome(row),
    blob
  }
}
