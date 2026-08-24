import { z } from 'zod'

export const crawlGroupPdfSourceSchema = z.enum(['discovered', 'operator_upload'])
export const crawlGroupPdfStatusSchema = z.enum(['active', 'superseded', 'deleted'])

export const crawlGroupPdfTableSchema = z.object({
  partitionKey: z.string().trim().min(1),
  rowKey: z.string().trim().min(1),
  sourceGroupKey: z.string().trim().min(1),
  sourceGroupStorageKey: z.string().trim().min(1).optional(),
  blobPath: z.string().trim().min(1),
  fileName: z.string().trim().min(1),
  contentType: z.string().trim().min(1),
  contentHash: z.string().trim().min(1),
  source: crawlGroupPdfSourceSchema,
  status: crawlGroupPdfStatusSchema,
  discoveredUrl: z.string().trim().min(1).optional(),
  uploadedAt: z.string().trim().min(1),
  uploadedBy: z.string().trim().min(1).optional(),
  supersededAt: z.string().trim().min(1).optional(),
  deletedAt: z.string().trim().min(1).optional()
})

export type CrawlGroupPdfTable = z.infer<typeof crawlGroupPdfTableSchema>

export function parseCrawlGroupPdfTable(value: unknown): CrawlGroupPdfTable {
  return crawlGroupPdfTableSchema.parse(value)
}