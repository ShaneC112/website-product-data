import { z } from 'zod'

export const manualCrawlEnqueueSchema = z.object({
  tableName: z.enum(['m2crmproducts']),
  rowKey: z.string().min(1),
  url: z.string().url().startsWith('https://'),
  crawlType: z.enum(['Range', 'Single']),
  styleCode: z.string().min(1),
  trade: z.string().min(1),
  force: z.boolean().default(false),
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