import { z } from 'zod'
import { batchItemStatusSchema, batchOperationSchema } from '../queues/contracts.js'

export const crawlExtractBatchTableSchema = z.object({
  partitionKey: z.string().trim().min(1), // sourceGroupKey (or a hashed form, matching existing stores)
  rowKey: z.string().trim().min(1), // `${operation}:${urlKey}` (optionally suffixed with variantId)
  sourceGroupKey: z.string().trim().min(1),
  operation: batchOperationSchema,
  urlKey: z.string().trim().min(1),
  variantId: z.string().trim().min(1).optional(),
  url: z.string().trim().min(1),
  pageRole: z.enum(['range', 'variant', 'single']),
  status: batchItemStatusSchema,
  batchId: z.string().trim().min(1).optional(),
  attempt: z.number().int().nonnegative().default(0),
  estimatedTokens: z.number().int().nonnegative().optional(),
  firstSeenAt: z.string().trim().min(1),
  updatedAt: z.string().trim().min(1),
  ttlExpiresAt: z.string().trim().min(1).optional()
})

export type CrawlExtractBatchTable = z.infer<typeof crawlExtractBatchTableSchema>

export function parseCrawlExtractBatchTable(value: unknown): CrawlExtractBatchTable {
  return crawlExtractBatchTableSchema.parse(value)
}
