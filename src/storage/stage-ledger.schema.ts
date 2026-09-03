import { z } from 'zod'
import { crawlPipelineStageSchema, crawlStageStateSchema } from '../queues/contracts.js'

// bounded Azure Table row: one logical unit of pipeline work (e.g. `variant_extract` for one
// variant URL key). Never store raw page data or AI responses here - reference artefacts by path.
export const crawlStageLedgerTableSchema = z.object({
  partitionKey: z.string().trim().min(1), // encoded sourceGroupKey
  rowKey: z.string().trim().min(1), // `${runId}:${stage}:${targetKey}`
  sourceGroupKey: z.string().trim().min(1),
  runId: z.string().trim().min(1),
  parentRunId: z.string().trim().min(1).optional(),
  generation: z.number().int().positive(),
  stage: crawlPipelineStageSchema,
  targetJson: z.string().trim().min(1),
  state: crawlStageStateSchema,
  attempt: z.number().int().nonnegative().default(0),
  inputReference: z.string().max(4000).optional(),
  outputReference: z.string().max(4000).optional(),
  failureMessage: z.string().max(2000).optional(),
  expectedBy: z.string().trim().min(1).optional(),
  ownerToken: z.string().trim().min(1).optional(),
  lastUpdatedAt: z.string().trim().min(1),
  completedAt: z.string().trim().min(1).optional(),
  ttlExpiresAt: z.string().trim().min(1).optional()
})

export type CrawlStageLedgerTable = z.infer<typeof crawlStageLedgerTableSchema>

// durable transactional-outbox record: the exact downstream queue payload, persisted before
// queue delivery so a crash between table persistence and `sendQueueMessage` is recoverable.
export const crawlStageDispatchStateSchema = z.enum(['pending_outbound', 'queued', 'failed'])

export const crawlStageDispatchTableSchema = z.object({
  partitionKey: z.string().trim().min(1), // encoded sourceGroupKey
  rowKey: z.string().trim().min(1), // `_dispatch:${runId}:${stage}:${targetKey}`
  sourceGroupKey: z.string().trim().min(1),
  runId: z.string().trim().min(1),
  generation: z.number().int().positive(),
  stageItemRowKey: z.string().trim().min(1),
  queueName: z.string().trim().min(1),
  payloadJson: z.string().trim().min(1),
  state: crawlStageDispatchStateSchema,
  attempt: z.number().int().nonnegative().default(0),
  nextAttemptAt: z.string().trim().min(1).optional(),
  failureMessage: z.string().max(2000).optional(),
  createdAt: z.string().trim().min(1),
  updatedAt: z.string().trim().min(1),
  queuedAt: z.string().trim().min(1).optional(),
  ttlExpiresAt: z.string().trim().min(1).optional()
})

export type CrawlStageDispatchTable = z.infer<typeof crawlStageDispatchTableSchema>
