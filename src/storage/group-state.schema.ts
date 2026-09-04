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

export type CrawlGroupStateValue = z.infer<typeof crawlGroupStateSchema>
export type CrawlGroupReadinessReasons = z.infer<typeof crawlGroupReadinessReasonsSchema>

export function parseCrawlGroupReadinessReasons(value: string): CrawlGroupReadinessReasons {
  return crawlGroupReadinessReasonsSchema.parse(JSON.parse(value))
}

export function stringifyCrawlGroupReadinessReasons(value: unknown): string {
  return JSON.stringify(crawlGroupReadinessReasonsSchema.parse(value))
}