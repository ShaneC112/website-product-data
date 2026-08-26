import { z } from 'zod'

export const crawlUrlLinkTableSchema = z.object({
  partitionKey: z.string().trim().min(1),
  rowKey: z.string().trim().min(1),
  urlStorageKey: z.string().trim().min(1),
  sourceGroupStorageKey: z.string().trim().min(1),
  sourceGroupKey: z.string().trim().min(1),
  urlKey: z.string().trim().min(1),
  styleCode: z.string().trim().min(1).optional(),
  styleCodeRaw: z.string().trim().min(1).optional(),
  styleCodeStorageKey: z.string().trim().min(1).optional(),
  trade: z.string().trim().min(1).optional(),
  sourceTableName: z.string().trim().min(1),
  sourceRowKey: z.string().trim().min(1),
  m2crmUuid: z.string().trim().min(1).optional(),
  vendorSku: z.string().trim().min(1).optional(),
  crawlUrl: z.string().trim().min(1).optional()
})

export type CrawlUrlLinkTable = z.infer<typeof crawlUrlLinkTableSchema>

export function parseCrawlUrlLinkTable(value: unknown): CrawlUrlLinkTable {
  return crawlUrlLinkTableSchema.parse(value)
}