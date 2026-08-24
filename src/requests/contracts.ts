import { z } from 'zod'

export const manualCrawlEnqueueSchema = z.object({
  sourceTableName: z.string().min(1),
  sourceRowKey: z.string().min(1),
  crawlUrl: z.string().url(),
  styleCode: z.string().min(1),
  trade: z.string().min(1),
  testMode: z.boolean().optional()
})

export type ManualCrawlEnqueueInput = z.infer<typeof manualCrawlEnqueueSchema>

export const matchingLedgerApprovalSchema = z.object({
  rowKey: z.string().min(1),
  sourceGroupKey: z.string().min(1),
  approvalState: z.enum(['approved', 'rejected', 'pending']),
  testMode: z.boolean().optional()
})

export type MatchingLedgerApprovalInput = z.infer<typeof matchingLedgerApprovalSchema>

export const publishPreflightSchema = z.object({
  sourceGroupKey: z.string().min(1),
  runId: z.string().min(1).optional(),
  testMode: z.boolean().optional()
})

export type PublishPreflightInput = z.infer<typeof publishPreflightSchema>