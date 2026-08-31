import { z } from 'zod'
import { batchItemStatusSchema, batchOperationSchema } from '../queues/contracts.js'

export const crawlExtractBatchTableSchema = z.object({
  partitionKey: z.string().trim().min(1), // encoded sourceGroupKey
  rowKey: z.string().trim().min(1), // `${operation}:${urlKey}`
  sourceGroupKey: z.string().trim().min(1),
  operation: batchOperationSchema,
  runId: z.string().trim().min(1).optional(),
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

export const crawlExtractBatchDispatchStateSchema = z.enum(['ready', 'queued', 'processing', 'completed'])

export const crawlExtractBatchDispatchTableSchema = z.object({
  partitionKey: z.string().trim().min(1), // encoded sourceGroupKey
  rowKey: z.string().trim().min(1), // `_batch:${operation}:${batchId}`
  sourceGroupKey: z.string().trim().min(1),
  operation: batchOperationSchema,
  runId: z.string().trim().min(1).optional(),
  batchId: z.string().trim().min(1),
  payloadJson: z.string().trim().min(1),
  itemCount: z.number().int().positive(),
  estimatedPromptTokens: z.number().int().nonnegative(),
  state: crawlExtractBatchDispatchStateSchema,
  attempt: z.number().int().nonnegative().default(0),
  ownerToken: z.string().trim().min(1).optional(),
  leaseExpiresAt: z.string().trim().min(1).optional(),
  createdAt: z.string().trim().min(1),
  updatedAt: z.string().trim().min(1),
  queuedAt: z.string().trim().min(1).optional(),
  completedAt: z.string().trim().min(1).optional(),
  ttlExpiresAt: z.string().trim().min(1).optional()
})

export type CrawlExtractBatchDispatchTable = z.infer<typeof crawlExtractBatchDispatchTableSchema>
