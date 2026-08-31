import { z } from 'zod'
import { registryFieldValueSchema } from '../registry/field-registry.js'

const httpsUrlSchema = z.string().url().startsWith('https://')

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
  crawlType: z.enum(['Range', 'Single', 'SpecifiedUrls']),
  specifiedUrls: z.array(httpsUrlSchema).min(1).optional(),
  styleCode: z.string().trim().default(''),
  trade: z.string().trim().default(''),
  promptVersion: z.string().trim().min(1).optional(),
  sourceGroupKey: z.string().trim().min(1).optional(),
  sourceGroupType: z.enum(['Range', 'Single', 'Mixed']).optional(),
  vendorSku: z.string().trim().min(1).optional(),
  // disambiguates a multi-weight range (e.g. Victoria Carpets' 40oz/50oz Burford Twist, which
  // share one crawled URL but are different m2crm products/groups) so extraction knows which
  // weight option this group's copy is describing. Absent/undefined for single-weight products.
  pileWeightHint: z.string().trim().min(1).optional(),
  productOnlinePdfUrl: httpsUrlSchema.optional(),
  reason: z.enum(['new', 'url_changed', 'product_changed', 'manual']),
  changedFields: z.array(z.string().trim().min(1)).default([]),
  rawPriceMinor: z.number().int().optional(),
  vatRate: z.number().optional(),
  validationErrors: z.array(queueValidationErrorSchema).default([]),
  force: z.boolean().default(false),
  requestedAt: z.string().trim().min(1)
}).superRefine((message, ctx) => {
  // styleCode/trade are only required for otherwise-valid requests; messages that carry
  // validation errors deliberately pass through with empty values so the dispatcher can
  // record them in the validation ledger.
  if (message.validationErrors.length > 0) {
    return
  }
  if (message.styleCode.length === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['styleCode'], message: 'styleCode is required when no validation errors are present' })
  }
  if (message.trade.length === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['trade'], message: 'trade is required when no validation errors are present' })
  }
  if (message.crawlType === 'SpecifiedUrls' && !message.specifiedUrls?.length) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['specifiedUrls'], message: 'specifiedUrls is required for SpecifiedUrls crawl requests' })
  }
})

export const renderRequestSchema = z.object({
  runId: z.string().trim().min(1).optional(),
  urlKey: z.string().trim().min(1),
  url: httpsUrlSchema,
  scrapeConfig: z.record(z.unknown()).default({}),
  blobPrefix: z.string().trim().min(1),
  pageRole: z.enum(['range', 'variant', 'single']).default('single'),
  sourceTableName: z.string().trim().min(1).optional(),
  styleCode: z.string().trim().min(1).optional(),
  styleCodeRaw: z.string().trim().min(1).optional(),
  styleCodeStorageKey: z.string().trim().min(1).optional(),
  m2crmUuid: z.string().trim().min(1).optional(),
  trade: z.string().trim().min(1).optional(),
  sourceGroupKey: z.string().trim().min(1).optional(),
  productOnlinePdfUrl: httpsUrlSchema.optional()
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
    visibleText: z.string().trim().min(1).optional(),
    debug: z.array(z.string().trim().min(1)).optional(),
    debugPayloads: z.array(z.string().trim().min(1)).optional()
  }),
  contentHash: z.string().trim().min(1),
  visibleTextLength: z.number().int(),
  resolvedUrl: z.string().url().optional(),
  warnings: z.array(z.string().trim().min(1)).optional()
})

export const renderCompleteSchema = z.object({
  runId: z.string().trim().min(1).optional(),
  urlKey: z.string().trim().min(1),
  status: z.enum(['ok', 'empty', 'error']),
  contentHash: z.string().trim().min(1),
  startedAt: z.string().trim().min(1).optional(),
  completedAt: z.string().trim().min(1).optional(),
  url: z.string().trim().min(1),
  blobPaths: z.object({
    html: z.string().trim().min(1),
    screenshot: z.string().trim().min(1),
    elements: z.array(z.string().trim().min(1)),
    captureManifest: z.string().trim().min(1).optional(),
    vendorState: z.string().trim().min(1).optional(),
    visibleText: z.string().trim().min(1).optional()
  }),
  visibleTextLength: z.number().int(),
  warnings: z.array(z.string().trim().min(1)).optional(),
  pageRole: z.enum(['range', 'variant', 'single']).optional(),
  sourceTableName: z.string().trim().min(1).optional(),
  styleCode: z.string().trim().min(1).optional(),
  styleCodeRaw: z.string().trim().min(1).optional(),
  styleCodeStorageKey: z.string().trim().min(1).optional(),
  m2crmUuid: z.string().trim().min(1).optional(),
  trade: z.string().trim().min(1).optional(),
  sourceGroupKey: z.string().trim().min(1).optional()
})

export const extractJobSchema = z.object({
  urlKey: z.string().trim().min(1),
  runId: z.string().trim().min(1).optional()
})

export const variantJobSchema = z.object({
  urlKey: z.string().trim().min(1),
  runId: z.string().trim().min(1).optional(),
  sourceTableName: z.string().trim().min(1).optional(),
  styleCode: z.string().trim().min(1).optional(),
  styleCodeRaw: z.string().trim().min(1).optional(),
  styleCodeStorageKey: z.string().trim().min(1).optional(),
  m2crmUuid: z.string().trim().min(1).optional(),
  trade: z.string().trim().min(1).optional(),
  sourceGroupKey: z.string().trim().min(1).optional()
})

export const transformJobSchema = z.object({
  urlKey: z.string().trim().min(1),
  runId: z.string().trim().min(1).optional()
})

export const imageJobSchema = z.object({
  urlKey: z.string().trim().min(1),
  runId: z.string().trim().min(1).optional(),
  bypassBatch: z.boolean().optional()
})

export const publishJobSchema = z.object({
  sourceGroupKey: z.string().trim().min(1),
  runId: z.string().trim().min(1).optional()
})

export const batchOperationSchema = z.enum([
  'product_extraction',
  'image_classification',
  'variant_enrichment', // already single-call today; wrapped for telemetry only
  'final_confidence' // already single-call today; wrapped for telemetry only
])

export const batchItemStatusSchema = z.enum(['pending', 'batched', 'succeeded', 'failed', 'missing'])

export const extractionBatchJobItemSchema = z.object({
  urlKey: z.string().trim().min(1),
  variantId: z.string().trim().min(1).optional(),
  url: z.string().trim().min(1),
  pageRole: z.enum(['range', 'variant', 'single'])
})

export const extractionBatchJobSchema = z.object({
  batchId: z.string().trim().min(1),
  sourceGroupKey: z.string().trim().min(1),
  runId: z.string().trim().min(1).optional(),
  trade: z.string().trim().min(1).optional(),
  operation: batchOperationSchema,
  attempt: z.number().int().nonnegative().default(0),
  items: z.array(extractionBatchJobItemSchema).min(1),
  estimatedPromptTokens: z.number().int().nonnegative(),
  createdAt: z.string().trim().min(1)
}).superRefine((job, ctx) => {
  const seen = new Set<string>()
  job.items.forEach((item, index) => {
    const key = `${item.urlKey}:${item.variantId ?? ''}`
    if (seen.has(key)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['items', index, 'urlKey'],
        message: `duplicate item key ${key} within batch`
      })
      return
    }
    seen.add(key)
  })
})

export const batchItemResultSchema = z.object({
  urlKey: z.string().trim().min(1),
  variantId: z.string().trim().min(1).optional(),
  status: z.enum(['succeeded', 'failed', 'missing']),
  fields: z.array(registryFieldValueSchema).optional(),
  // models often return an explicit `null` (not an omitted key) when there's no error - accept
  // both, matching the pattern used elsewhere for optional AI-authored fields.
  error: z.string().trim().min(1).max(500).nullable().optional(),
  confidence: z.number().min(0).max(1).optional()
})

export const extractionBatchResultSchema = z.object({
  batchId: z.string().trim().min(1),
  operation: batchOperationSchema,
  attempt: z.number().int().nonnegative(),
  results: z.array(batchItemResultSchema)
})

export type QueueValidationError = z.infer<typeof queueValidationErrorSchema>
export type CrawlRequestMessage = z.infer<typeof crawlRequestMessageSchema>
export type RenderRequest = z.infer<typeof renderRequestSchema>
export type RenderJob = z.infer<typeof renderJobSchema>
export type RenderResponse = z.infer<typeof renderResponseSchema>
export type RenderComplete = z.infer<typeof renderCompleteSchema>
export type ExtractJob = z.infer<typeof extractJobSchema>
export type VariantJob = z.infer<typeof variantJobSchema>
export type TransformJob = z.infer<typeof transformJobSchema>
export type ImageJob = z.infer<typeof imageJobSchema>
export type PublishJob = z.infer<typeof publishJobSchema>
export type BatchOperation = z.infer<typeof batchOperationSchema>
export type BatchItemStatus = z.infer<typeof batchItemStatusSchema>
export type ExtractionBatchJobItem = z.infer<typeof extractionBatchJobItemSchema>
export type ExtractionBatchJob = z.infer<typeof extractionBatchJobSchema>
export type BatchItemResult = z.infer<typeof batchItemResultSchema>
export type ExtractionBatchResult = z.infer<typeof extractionBatchResultSchema>

export const CrawlRequestMessage = crawlRequestMessageSchema
export const RenderRequest = renderRequestSchema
export const RenderJob = renderJobSchema
export const RenderResponse = renderResponseSchema
export const RenderComplete = renderCompleteSchema
export const ExtractJob = extractJobSchema
export const VariantJob = variantJobSchema
export const TransformJob = transformJobSchema
export const ImageJob = imageJobSchema
export const PublishJob = publishJobSchema
export const BatchOperation = batchOperationSchema
export const BatchItemStatus = batchItemStatusSchema
export const ExtractionBatchJob = extractionBatchJobSchema
export const BatchItemResult = batchItemResultSchema
export const ExtractionBatchResult = extractionBatchResultSchema