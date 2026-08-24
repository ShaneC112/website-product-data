import { z } from 'zod'

export const crawlVariantSwatchSourceSchema = z.enum([
  'selector',
  'ai',
  'primary_fallback',
  'operator_url',
  'operator_upload'
])

export const crawlVariantSwatchStatusSchema = z.enum([
  'found',
  'review',
  'missing',
  'override_pending',
  'approved'
])

export const crawlVariantSwatchReviewStateSchema = z.enum([
  'pending',
  'approved',
  'rejected'
])

export const crawlVariantSwatchTableSchema = z.object({
  partitionKey: z.string().trim().min(1),
  rowKey: z.string().trim().min(1),
  sourceGroupKey: z.string().trim().min(1),
  sourceGroupStorageKey: z.string().trim().min(1).optional(),
  parentUrlKey: z.string().trim().min(1).optional(),
  variantId: z.string().trim().min(1).optional(),
  variantUrl: z.string().trim().min(1).optional(),
  variantLabel: z.string().trim().min(1).optional(),
  colourName: z.string().trim().min(1).optional(),
  selectedSwatchUrl: z.string().trim().min(1).optional(),
  selectedSwatchBlobPath: z.string().trim().min(1).optional(),
  selectedSwatchHash: z.string().trim().min(1).optional(),
  swatchStatus: crawlVariantSwatchStatusSchema,
  swatchSource: crawlVariantSwatchSourceSchema.optional(),
  reviewState: crawlVariantSwatchReviewStateSchema,
  overrideSource: z.enum(['url', 'upload']).optional(),
  overrideUrl: z.string().trim().min(1).optional(),
  overrideBlobPath: z.string().trim().min(1).optional(),
  overrideHash: z.string().trim().min(1).optional(),
  overrideReviewState: crawlVariantSwatchReviewStateSchema.optional(),
  approvedAt: z.string().trim().min(1).optional(),
  approvedBy: z.string().trim().min(1).optional(),
  clearedAt: z.string().trim().min(1).optional(),
  clearedBy: z.string().trim().min(1).optional(),
  updatedAt: z.string().trim().min(1)
})

export type CrawlVariantSwatchTable = z.infer<typeof crawlVariantSwatchTableSchema>

export function parseCrawlVariantSwatchTable(value: unknown): CrawlVariantSwatchTable {
  return crawlVariantSwatchTableSchema.parse(value)
}