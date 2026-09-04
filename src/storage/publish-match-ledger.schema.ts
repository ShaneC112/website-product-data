import { z } from 'zod'

// 07-publish's own matching ledger table (renamed from crawlMatchingLedger for explicit
// step-ownership - see plan/queue file refactor/01a-entity-table-redesign.md). Already
// single-step-owned before this rename; row shape is unchanged.
export const publishMatchLedgerMatchMethodSchema = z.enum([
  'exact_url',
  'colour_hint',
  'colour_field',
  'vendor_rule',
  'ai_proposal',
  'unmatched'
])
export const publishMatchLedgerApprovalStateSchema = z.enum(['pending', 'approved', 'rejected', 'not_required'])
export const publishMatchLedgerProposalSourceSchema = z.enum(['publish_preflight'])
export const publishMatchLedgerDetailSchema = z.record(z.unknown())

export const publishMatchLedgerTableSchema = z.object({
  partitionKey: z.string().trim().min(1),
  rowKey: z.string().trim().min(1),
  sourceGroupKey: z.string().trim().min(1),
  sourceGroupStorageKey: z.string().trim().min(1).optional(),
  parentUrlKey: z.string().trim().min(1),
  variantRowKey: z.string().trim().min(1),
  variantId: z.string().trim().min(1).optional(),
  variantUrl: z.string().trim().min(1).optional(),
  variantLabel: z.string().trim().min(1).optional(),
  colourName: z.string().trim().min(1).optional(),
  swatchImageUrl: z.string().trim().min(1).optional(),
  swatchHex: z.string().trim().min(1).optional(),
  matchedProductRowKey: z.string().trim().min(1).optional(),
  matchedSourceRowKey: z.string().trim().min(1).optional(),
  matchedSourceTableName: z.string().trim().min(1).optional(),
  matchMethod: publishMatchLedgerMatchMethodSchema,
  matchConfidence: z.number(),
  approvalState: publishMatchLedgerApprovalStateSchema,
  proposalSource: publishMatchLedgerProposalSourceSchema,
  detailJson: z.string().trim().min(1),
  updatedAt: z.string().trim().min(1),
  ttlExpiresAt: z.string().trim().min(1).optional()
})

export type PublishMatchLedgerTable = z.infer<typeof publishMatchLedgerTableSchema>
export type PublishMatchLedgerDetail = z.infer<typeof publishMatchLedgerDetailSchema>
export type PublishMatchLedgerParsed = {
  row: PublishMatchLedgerTable
  detail: PublishMatchLedgerDetail | null
}

export function parsePublishMatchLedgerTable(value: unknown): PublishMatchLedgerTable {
  return publishMatchLedgerTableSchema.parse(value)
}

export function parsePublishMatchLedgerDetail(value: string): PublishMatchLedgerDetail {
  return publishMatchLedgerDetailSchema.parse(JSON.parse(value))
}

export function stringifyPublishMatchLedgerDetail(value: unknown): string {
  return JSON.stringify(publishMatchLedgerDetailSchema.parse(value))
}

export function parsePublishMatchLedger(row: PublishMatchLedgerTable): PublishMatchLedgerParsed {
  try {
    return {
      row,
      detail: parsePublishMatchLedgerDetail(row.detailJson)
    }
  } catch {
    return {
      row,
      detail: null
    }
  }
}
