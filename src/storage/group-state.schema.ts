import { z } from 'zod'

export const crawlGroupStateSchema = z.enum([
  'draft',
  'ready',
  'trade_unmapped',
  'ai_field_missing',
  'swatch_missing',
  'final_check_flagged'
])

export const crawlGroupReadinessReasonsSchema = z.array(z.string().trim().min(1))

export const crawlGroupStateTableSchema = z.object({
  partitionKey: z.string().trim().min(1),
  rowKey: z.string().trim().min(1),
  sourceGroupKey: z.string().trim().min(1),
  styleCodeRaw: z.string().trim().min(1).optional(),
  styleCodeStorageKey: z.string().trim().min(1).optional(),
  state: crawlGroupStateSchema,
  pageCount: z.number().int().nonnegative(),
  detailCount: z.number().int().nonnegative(),
  readinessReasonsJson: z.string().trim().min(1).optional(),
  ttlExpiresAt: z.string().trim().min(1).optional()
})

export type CrawlGroupStateValue = z.infer<typeof crawlGroupStateSchema>
export type CrawlGroupReadinessReasons = z.infer<typeof crawlGroupReadinessReasonsSchema>
export type CrawlGroupStateTable = z.infer<typeof crawlGroupStateTableSchema>
export type CrawlGroupStateParsed = {
  row: CrawlGroupStateTable
  readinessReasons: CrawlGroupReadinessReasons
}

export function parseCrawlGroupStateTable(value: unknown): CrawlGroupStateTable {
  return crawlGroupStateTableSchema.parse(value)
}

export function parseCrawlGroupReadinessReasons(value: string): CrawlGroupReadinessReasons {
  return crawlGroupReadinessReasonsSchema.parse(JSON.parse(value))
}

export function stringifyCrawlGroupReadinessReasons(value: unknown): string {
  return JSON.stringify(crawlGroupReadinessReasonsSchema.parse(value))
}

export function parseCrawlGroupState(row: CrawlGroupStateTable): CrawlGroupStateParsed {
  return {
    row,
    readinessReasons: row.readinessReasonsJson
      ? parseCrawlGroupReadinessReasons(row.readinessReasonsJson)
      : []
  }
}