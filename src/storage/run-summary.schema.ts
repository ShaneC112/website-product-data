import { z } from 'zod'

export const crawlRunSummaryTableSchema = z.object({
  partitionKey: z.string().trim().min(1),
  rowKey: z.string().trim().min(1),
  runId: z.string().trim().min(1),
  sourceGroupKey: z.string().trim().min(1).optional(),
  urlKey: z.string().trim().min(1).optional(),
  styleCode: z.string().trim().min(1).optional(),
  sourceTableName: z.string().trim().min(1).optional(),
  sourceRowKey: z.string().trim().min(1).optional(),
  force: z.boolean().optional(),
  originType: z.literal('sanity_action').optional(),
  originRequestDocumentId: z.string().trim().min(1).optional(),
  originRequestId: z.string().trim().min(1).optional(),
  originRequestType: z.literal('stylecode_import').optional(),
  joinedRunId: z.string().trim().min(1).optional(),
  status: z.string().trim().min(1).optional(),
  requestedAt: z.string().trim().min(1).optional(),
  renderStartedAt: z.string().trim().min(1).optional(),
  renderCompletedAt: z.string().trim().min(1).optional(),
  extractStartedAt: z.string().trim().min(1).optional(),
  extractCompletedAt: z.string().trim().min(1).optional(),
  transformStartedAt: z.string().trim().min(1).optional(),
  transformCompletedAt: z.string().trim().min(1).optional(),
  publishStartedAt: z.string().trim().min(1).optional(),
  publishCompletedAt: z.string().trim().min(1).optional(),
  aiCallCount: z.number().int().nonnegative().optional(),
  aiTotalTokens: z.number().int().nonnegative().optional(),
  aiEstimatedCost: z.number().optional(),
  warningCount: z.number().int().nonnegative().optional(),
  renderDurationMs: z.number().int().nonnegative().optional(),
  extractDurationMs: z.number().int().nonnegative().optional(),
  transformDurationMs: z.number().int().nonnegative().optional(),
  publishDurationMs: z.number().int().nonnegative().optional(),
  sanityOutcome: z.enum(['draft', 'mixed', 'held']).optional(),
  sanityDocumentIds: z.string().trim().min(1).optional(),
  sanityDraftCount: z.number().int().nonnegative().optional(),
  sanityHeldCount: z.number().int().nonnegative().optional(),
  sanityHeldReasonsJson: z.string().trim().min(1).optional(),
  totalDurationMs: z.number().int().nonnegative().optional(),
  aiPromptTokens: z.number().int().nonnegative().optional(),
  aiCompletionTokens: z.number().int().nonnegative().optional(),
  failedStage: z.string().trim().min(1).optional(),
  failedAt: z.string().trim().min(1).optional(),
  failureMessage: z.string().trim().min(1).optional(),
  attemptFailuresJson: z.string().trim().min(1).optional()
})

export type CrawlRunSummaryTable = z.infer<typeof crawlRunSummaryTableSchema>

export function parseCrawlRunSummaryTable(value: unknown): CrawlRunSummaryTable {
  return crawlRunSummaryTableSchema.parse(value)
}