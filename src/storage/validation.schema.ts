import { z } from 'zod'

export const crawlValidationErrorSchema = z.object({
  path: z.string().trim().min(1),
  message: z.string().trim().min(1)
})

export const crawlValidationErrorsSchema = z.array(crawlValidationErrorSchema)

export const crawlValidationTableSchema = z.object({
  partitionKey: z.string().trim().min(1),
  rowKey: z.string().trim().min(1),
  sourceGroupKey: z.string().trim().min(1).optional(),
  styleCodeRaw: z.string().trim().min(1).optional(),
  styleCodeStorageKey: z.string().trim().min(1).optional(),
  sourceTableName: z.string().trim().min(1),
  sourceRowKey: z.string().trim().min(1),
  m2crmUuid: z.string().trim().min(1).optional(),
  styleCode: z.string().trim().min(1).optional(),
  trade: z.string().trim().min(1).optional(),
  crawlUrl: z.string().trim().min(1).optional(),
  errorsJson: z.string().trim().min(1),
  firstSeenAt: z.string().trim().min(1),
  lastSeenAt: z.string().trim().min(1),
  resolvedAt: z.string().trim().min(1).optional()
})

export type CrawlValidationError = z.infer<typeof crawlValidationErrorSchema>
export type CrawlValidationErrors = z.infer<typeof crawlValidationErrorsSchema>
export type CrawlValidationTable = z.infer<typeof crawlValidationTableSchema>
export type CrawlValidationParsed = {
  row: CrawlValidationTable
  errors: CrawlValidationErrors
}

export function parseCrawlValidationTable(value: unknown): CrawlValidationTable {
  return crawlValidationTableSchema.parse(value)
}

export function parseCrawlValidationErrors(value: string): CrawlValidationErrors {
  return crawlValidationErrorsSchema.parse(JSON.parse(value))
}

export function stringifyCrawlValidationErrors(value: unknown): string {
  return JSON.stringify(crawlValidationErrorsSchema.parse(value))
}

export function parseCrawlValidation(row: CrawlValidationTable): CrawlValidationParsed {
  return {
    row,
    errors: parseCrawlValidationErrors(row.errorsJson)
  }
}