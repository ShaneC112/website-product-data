import { z } from 'zod'
import { crawlPageRoleSchema } from './page-detail.schema'

export const crawlPageVariantUrlsSchema = z.array(z.string().trim().min(1))

export const crawlPageTableSchema = z.object({
  partitionKey: z.string().trim().min(1),
  rowKey: z.string().trim().min(1),
  url: z.string().trim().min(1),
  urlKey: z.string().trim().min(1),
  sourceTableName: z.string().trim().min(1).optional(),
  styleCode: z.string().trim().min(1).optional(),
  trade: z.string().trim().min(1).optional(),
  sourceGroupKey: z.string().trim().min(1).optional(),
  pageRole: crawlPageRoleSchema.optional(),
  rootDomain: z.string().trim().min(1).optional(),
  variantUrlsJson: z.string().trim().min(1).optional(),
  linkedProductCount: z.number().int().nonnegative().optional(),
  contentHash: z.string().trim().min(1).optional(),
  status: z.string().trim().min(1).optional(),
  blobHtmlPath: z.string().trim().min(1).optional(),
  blobScreenshotPath: z.string().trim().min(1).optional(),
  blobElementsJsonPath: z.string().trim().min(1).optional(),
  blobCaptureManifestPath: z.string().trim().min(1).optional(),
  blobVendorStatePath: z.string().trim().min(1).optional(),
  visibleTextLength: z.number().int().nonnegative().optional(),
  ttlExpiresAt: z.string().trim().min(1).optional(),
  etag: z.string().trim().min(1).optional(),
  rawPriceMinor: z.number().optional(),
  vatRate: z.number().optional(),
  vendorSku: z.string().trim().min(1).optional(),
  sourceRowKey: z.string().trim().min(1).optional()
})

export type CrawlPageVariantUrls = z.infer<typeof crawlPageVariantUrlsSchema>
export type CrawlPageTable = z.infer<typeof crawlPageTableSchema>
export type CrawlPageParsed = {
  row: CrawlPageTable
  variantUrls: CrawlPageVariantUrls
}

export function parseCrawlPageTable(value: unknown): CrawlPageTable {
  return crawlPageTableSchema.parse(value)
}

export function parseCrawlPageVariantUrls(value: string): CrawlPageVariantUrls {
  return crawlPageVariantUrlsSchema.parse(JSON.parse(value))
}

export function stringifyCrawlPageVariantUrls(value: unknown): string {
  return JSON.stringify(crawlPageVariantUrlsSchema.parse(value))
}

export function parseCrawlPage(row: CrawlPageTable): CrawlPageParsed {
  return {
    row,
    variantUrls: row.variantUrlsJson ? parseCrawlPageVariantUrls(row.variantUrlsJson) : []
  }
}