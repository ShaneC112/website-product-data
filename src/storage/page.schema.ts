import { z } from 'zod'
import { crawlPageRoleSchema, extractedScalarMeasurementSchema } from './page-detail.schema.js'

export const crawlPageVariantUrlsSchema = z.array(z.string().trim().min(1))

// m2crm's plank/tile size + coverage + pieces-per-box - a bias hint for AI extraction only,
// mirrors pileWeightHint. Persisted as a JSON-stringified column, consistent with variantUrlsJson.
export const crawlPagePackInfoHintSchema = z.object({
  length: extractedScalarMeasurementSchema.optional(),
  width: extractedScalarMeasurementSchema.optional(),
  height: extractedScalarMeasurementSchema.optional(),
  coverage: extractedScalarMeasurementSchema.optional(),
  piecesPerPack: z.number().int().positive().optional()
})

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
  specifiedVariantUrlsJson: z.string().trim().min(1).optional(),
  crawlType: z.enum(['Range', 'Single', 'SpecifiedUrls']).optional(),
  linkedProductCount: z.number().int().nonnegative().optional(),
  contentHash: z.string().trim().min(1).optional(),
  status: z.string().trim().min(1).optional(),
  blobHtmlPath: z.string().trim().min(1).optional(),
  blobScreenshotPath: z.string().trim().min(1).optional(),
  blobElementsJsonPath: z.string().trim().min(1).optional(),
  blobCaptureManifestPath: z.string().trim().min(1).optional(),
  blobVendorStatePath: z.string().trim().min(1).optional(),
  blobVisibleTextPath: z.string().trim().min(1).optional(),
  visibleTextLength: z.number().int().nonnegative().optional(),
  ttlExpiresAt: z.string().trim().min(1).optional(),
  etag: z.string().trim().min(1).optional(),
  rawPriceMinor: z.number().optional(),
  vatRate: z.number().optional(),
  // merchant-set box price, same trust tier as rawPriceMinor - not a vendor-page claim to verify.
  rawBoxPriceMinor: z.number().optional(),
  boxUnit: z.string().trim().min(1).optional(),
  packInfoHintJson: z.string().trim().min(1).optional(),
  vendorSku: z.string().trim().min(1).optional(),
  sourceRowKey: z.string().trim().min(1).optional(),
  pileWeightHint: z.string().trim().min(1).optional()
})

export type CrawlPageVariantUrls = z.infer<typeof crawlPageVariantUrlsSchema>
export type CrawlPagePackInfoHint = z.infer<typeof crawlPagePackInfoHintSchema>
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

export function parseCrawlPagePackInfoHint(value: string): CrawlPagePackInfoHint {
  return crawlPagePackInfoHintSchema.parse(JSON.parse(value))
}

export function stringifyCrawlPagePackInfoHint(value: unknown): string {
  return JSON.stringify(crawlPagePackInfoHintSchema.parse(value))
}

export function parseCrawlPage(row: CrawlPageTable): CrawlPageParsed {
  return {
    row,
    variantUrls: row.variantUrlsJson ? parseCrawlPageVariantUrls(row.variantUrlsJson) : []
  }
}