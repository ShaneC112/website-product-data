import { z } from 'zod'

export const crawlMatchingLedgerMatchMethodSchema = z.enum(['exact_url', 'colour_hint', 'unmatched'])
export const crawlMatchingLedgerApprovalStateSchema = z.enum(['pending', 'approved', 'rejected', 'not_required'])
export const crawlMatchingLedgerProposalSourceSchema = z.enum(['publish_preflight'])

export const crawlMatchingLedgerTableSchema = z.object({
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
  matchMethod: crawlMatchingLedgerMatchMethodSchema,
  matchConfidence: z.number(),
  approvalState: crawlMatchingLedgerApprovalStateSchema,
  proposalSource: crawlMatchingLedgerProposalSourceSchema,
  detailJson: z.string().trim().min(1),
  updatedAt: z.string().trim().min(1),
  ttlExpiresAt: z.string().trim().min(1).optional()
})

export type CrawlMatchingLedgerTable = z.infer<typeof crawlMatchingLedgerTableSchema>

export function parseCrawlMatchingLedgerTable(value: unknown): CrawlMatchingLedgerTable {
  return crawlMatchingLedgerTableSchema.parse(value)
}