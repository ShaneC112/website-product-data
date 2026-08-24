import { z } from 'zod'

export const queueValidationErrorSchema = z.object({
  path: z.string().trim().min(1),
  message: z.string().trim().min(1)
})

export const crawlRequestMessageSchema = z.object({
  runId: z.string().trim().min(1).optional(),
  source: z.enum(['sync', 'manual', 'sweeper']),
  tableName: z.string().trim().min(1),
  rowKey: z.string().trim().min(1),
  url: z.string().trim().min(1).optional(),
  crawlType: z.enum(['Range', 'Single']),
  styleCode: z.string().trim().min(1),
  trade: z.string().trim().min(1),
  promptVersion: z.string().trim().min(1).optional(),
  sourceGroupKey: z.string().trim().min(1).optional(),
  sourceGroupType: z.enum(['Range', 'Single', 'Mixed']).optional(),
  vendorSku: z.string().trim().min(1).optional(),
  reason: z.enum(['new', 'url_changed', 'product_changed', 'manual']),
  changedFields: z.array(z.string().trim().min(1)).default([]),
  rawPriceMinor: z.number().int().optional(),
  vatRate: z.number().optional(),
  validationErrors: z.array(queueValidationErrorSchema).default([]),
  force: z.boolean().default(false),
  requestedAt: z.string().trim().min(1)
})

export const renderRequestSchema = z.object({
  runId: z.string().trim().min(1).optional(),
  urlKey: z.string().trim().min(1),
  url: z.string().url(),
  scrapeConfig: z.record(z.unknown()).default({}),
  blobPrefix: z.string().trim().min(1),
  pageRole: z.enum(['range', 'variant', 'single']).default('single'),
  sourceTableName: z.string().trim().min(1).optional(),
  styleCode: z.string().trim().min(1).optional(),
  trade: z.string().trim().min(1).optional(),
  sourceGroupKey: z.string().trim().min(1).optional()
})

export const renderJobSchema = renderRequestSchema

export const renderResponseSchema = z.object({
  runId: z.string().trim().min(1).optional(),
  startedAt: z.string().trim().min(1).optional(),
  completedAt: z.string().trim().min(1).optional(),
  status: z.enum(['ok', 'empty', 'error']),
  blobPaths: z.object({
    html: z.string().trim().min(1),
    screenshot: z.string().trim().min(1),
    elements: z.array(z.string().trim().min(1)),
    captureManifest: z.string().trim().min(1).optional(),
    vendorState: z.string().trim().min(1).optional(),
    debug: z.array(z.string().trim().min(1)).optional(),
    debugPayloads: z.array(z.string().trim().min(1)).optional()
  }),
  contentHash: z.string().trim().min(1),
  visibleTextLength: z.number().int(),
  resolvedUrl: z.string().url().optional(),
  warnings: z.array(z.string().trim().min(1)).optional()
})

export const extractJobSchema = z.object({
  urlKey: z.string().trim().min(1),
  runId: z.string().trim().min(1).optional()
})

export const variantJobSchema = z.object({
  urlKey: z.string().trim().min(1),
  runId: z.string().trim().min(1).optional()
})

export const transformJobSchema = z.object({
  urlKey: z.string().trim().min(1),
  runId: z.string().trim().min(1).optional()
})

export const publishJobSchema = z.object({
  sourceGroupKey: z.string().trim().min(1),
  runId: z.string().trim().min(1).optional()
})

export type QueueValidationError = z.infer<typeof queueValidationErrorSchema>
export type CrawlRequestMessage = z.infer<typeof crawlRequestMessageSchema>
export type RenderRequest = z.infer<typeof renderRequestSchema>
export type RenderJob = z.infer<typeof renderJobSchema>
export type RenderResponse = z.infer<typeof renderResponseSchema>
export type ExtractJob = z.infer<typeof extractJobSchema>
export type VariantJob = z.infer<typeof variantJobSchema>
export type TransformJob = z.infer<typeof transformJobSchema>
export type PublishJob = z.infer<typeof publishJobSchema>

export const CrawlRequestMessage = crawlRequestMessageSchema
export const RenderRequest = renderRequestSchema
export const RenderJob = renderJobSchema
export const RenderResponse = renderResponseSchema
export const ExtractJob = extractJobSchema
export const VariantJob = variantJobSchema
export const TransformJob = transformJobSchema
export const PublishJob = publishJobSchema