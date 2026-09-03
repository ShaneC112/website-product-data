import { z } from 'zod'
import { registryFieldValueSchema } from '../registry/field-registry.js'
import {
  IMAGE_GENERATION_PRODUCT_REGISTRY,
  IMAGE_LAY_DIRECTIONS,
  SANITY_PRODUCT_TYPES,
  isImageLayDirectionAllowed
} from '../registry/product-taxonomy.js'
import { IMAGE_GENERATION_PROFILE_KEYS } from '../registry/image-generation-profiles.js'
import { extractedScalarMeasurementSchema } from '../storage/page-detail.schema.js'
import { surfaceAppearanceSchema } from '../storage/page-detail.schema.js'

export const packInfoHintSchema = z.object({
  length: extractedScalarMeasurementSchema.optional(),
  width: extractedScalarMeasurementSchema.optional(),
  height: extractedScalarMeasurementSchema.optional(),
  coverage: extractedScalarMeasurementSchema.optional(),
  piecesPerPack: z.number().int().positive().optional()
})

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
  // M2CRM vendor name supplied as an identity candidate for page-evidence confirmation.
  brandNameHint: z.string().trim().min(1).optional(),
  productOnlinePdfUrl: httpsUrlSchema.optional(),
  reason: z.enum(['new', 'url_changed', 'product_changed', 'manual']),
  changedFields: z.array(z.string().trim().min(1)).default([]),
  price: z.number().int().optional(),
  vatRate: z.number().optional(),
  // merchant-set box price, same trust tier as price - not a vendor-page claim to verify.
  boxSalesPrice: z.number().int().optional(),
  boxUnit: z.string().trim().min(1).optional(),
  // this SKU's own roll width(s) from m2crm's native `width` product field (confirmed live, e.g.
  // "13'1\"" on a /400 SKU vs "16'5\"" on a /500 SKU of the same range) - authoritative business
  // data like price, not a bias hint like pileWeightHint/packInfoHint.
  rawWidthHint: z.array(extractedScalarMeasurementSchema).optional(),
  // m2crm's own plank/tile size + coverage + pieces-per-box - a bias hint for AI extraction only,
  // mirrors pileWeightHint. Does NOT override the AI-extracted packInfo registry field.
  packInfoHint: packInfoHintSchema.optional(),
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
  productOnlinePdfUrl: httpsUrlSchema.optional(),
  force: z.boolean().default(false)
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
  sourceGroupKey: z.string().trim().min(1).optional(),
  force: z.boolean().default(false)
})

export const extractJobSchema = z.object({
  urlKey: z.string().trim().min(1),
  runId: z.string().trim().min(1).optional(),
  force: z.boolean().default(false)
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
  sourceGroupKey: z.string().trim().min(1).optional(),
  force: z.boolean().default(false)
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

const sanityImageSettingsSchema = z.object({
  aspectRatio: z.enum(['3:2', '4:3', '1:1', '16:9']).default('3:2'),
  imagePromptStrength: z.number().min(0).max(1).default(0.85),
  productSpecOverride: z.string().max(8000).optional(),
  lightingDirectiveOverride: z.string().max(8000).optional(),
  customInstructions: z.string().max(8000).optional()
})

const sanityImageSpecSchema = z.object({
  key: z.string().trim().min(1),
  label: z.string().trim().min(1),
  value: z.string().trim().min(1)
})

const sanityImageVariantSchema = z.object({
  variantId: z.string().trim().min(1),
  colourName: z.string().trim().min(1),
  colourFamily: z.string().trim().min(1).optional(),
  hex: z.string().regex(/^#[0-9a-f]{6}$/i).optional(),
  surfaceAppearance: surfaceAppearanceSchema.optional(),
  swatchUrl: httpsUrlSchema,
  patternRepeatCm: z.number().positive().optional(),
  repeatsInSwatch: z.number().int().positive().optional(),
  specs: z.array(sanityImageSpecSchema).default([])
})

export const sanityImageFurnitureStyleSchema = z.enum([
  'ikea', 'jysk', 'next-home', 'dfs', 'harvey-norman', 'marks-and-spencer-home',
  'habitat', 'west-elm', 'boconcept', 'hay', 'muuto', 'ligne-roset', 'minotti', 'poliform'
])

export const sanityImageInteriorFashionSchema = z.enum([
  'contemporary', 'scandinavian', 'japandi', 'minimalist', 'mid-century-modern',
  '1970s-revival', '1980s-postmodern', 'art-deco', 'industrial', 'edwardian',
  'victorian', 'georgian', 'country-cottage', 'coastal'
])

export const sanityImageStatementToneSchema = z.enum(['restrained', 'subtle', 'balanced', 'bold', 'dramatic'])

const sanityImageDesignSchema = z.object({
  selectionKey: z.string().trim().min(1),
  furnitureStyle: sanityImageFurnitureStyleSchema,
  interiorFashion: sanityImageInteriorFashionSchema,
  statementTone: sanityImageStatementToneSchema,
  lighting: z.enum(['morning', 'afternoon', 'sunset']),
  pipeline: z.enum(['direct', 'patterned-kontext']),
  generationProfile: z.enum(IMAGE_GENERATION_PROFILE_KEYS),
  presetId: z.string().trim().min(1).optional(),
  presetKey: z.string().trim().min(1).optional(),
  presetTitle: z.string().trim().min(1).optional(),
  presetVersion: z.number().int().positive().optional()
})

const sanityImageCommandBaseSchema = z.object({
  commandId: z.string().trim().min(1),
  requestId: z.string().trim().min(1),
  sanityProjectId: z.string().trim().min(1),
  sanityDataset: z.string().trim().min(1),
  sanityDocumentId: z.string().trim().min(1),
  requestKey: z.string().trim().min(1),
  totalRuns: z.number().int().positive(),
  requestedAt: z.string().datetime()
})

export const sanityImagePrepareCommandSchema = sanityImageCommandBaseSchema.extend({
  phase: z.literal('prepare'),
  autoCreate: z.boolean().default(true),
  product: z.object({
    name: z.string().trim().min(1),
    productType: z.enum(SANITY_PRODUCT_TYPES),
    brand: z.string().trim().optional(),
    shortDescription: z.string().optional(),
    features: z.array(z.string()).default([]),
    specs: z.array(sanityImageSpecSchema).default([])
  }),
  variants: z.array(sanityImageVariantSchema).min(1),
  rooms: z.array(z.string().trim().min(1)).min(1),
  design: sanityImageDesignSchema,
  layDirection: z.enum(IMAGE_LAY_DIRECTIONS).optional(),
  customLayDirection: z.string().trim().min(1).max(100).optional(),
  settings: sanityImageSettingsSchema.default({})
}).superRefine((command, ctx) => {
  for (const [path, values] of [
    ['variants', command.variants.map((variant) => variant.variantId)],
    ['rooms', command.rooms]
  ] as const) {
    if (new Set(values).size !== values.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message: `${path} must be unique` })
    }
  }
  const layDirectionOptions = IMAGE_GENERATION_PRODUCT_REGISTRY[command.product.productType].layDirectionOptions
  if (layDirectionOptions.length > 0 && !command.layDirection) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['layDirection'], message: `layDirection is required for ${command.product.productType}` })
  }
  if (command.layDirection && !isImageLayDirectionAllowed(command.product.productType, command.layDirection)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['layDirection'], message: `${command.layDirection} is not supported for ${command.product.productType}` })
  }
  if (command.layDirection === 'custom' && !command.customLayDirection) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['customLayDirection'], message: 'customLayDirection is required when layDirection is custom' })
  }
  if (command.layDirection !== 'custom' && command.customLayDirection) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['customLayDirection'], message: 'customLayDirection is only valid when layDirection is custom' })
  }
  if (command.design.pipeline === 'patterned-kontext') {
    command.variants.forEach((variant, index) => {
      if (!variant.patternRepeatCm || !variant.repeatsInSwatch) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['variants', index],
          message: 'patterned-kontext requires patternRepeatCm and repeatsInSwatch'
        })
      }
    })
  }
})

export const sanityImageGenerateCommandSchema = sanityImageCommandBaseSchema.extend({
  phase: z.literal('generate'),
  settings: sanityImageSettingsSchema.default({}),
  runs: z.array(z.object({
    runId: z.string().trim().min(1),
    variantId: z.string().trim().min(1),
    colourName: z.string().trim().min(1),
    productType: z.enum(SANITY_PRODUCT_TYPES),
    surfaceAppearance: surfaceAppearanceSchema.optional(),
    room: z.string().trim().min(1),
    pipeline: z.enum(['direct', 'patterned-kontext']),
    generationProfile: z.enum(IMAGE_GENERATION_PROFILE_KEYS),
    finalPrompt: z.string().trim().min(1).max(16000),
    swatchUrl: httpsUrlSchema,
    patternRepeatCm: z.number().positive().optional(),
    repeatsInSwatch: z.number().int().positive().optional()
  })).min(1)
}).superRefine((command, ctx) => {
  const runIds = command.runs.map((run) => run.runId)
  if (new Set(runIds).size !== runIds.length) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['runs'], message: 'run IDs must be unique' })
  }
  command.runs.forEach((run, index) => {
    if (run.pipeline === 'patterned-kontext' && (!run.swatchUrl || !run.patternRepeatCm || !run.repeatsInSwatch)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['runs', index],
        message: 'patterned-kontext requires swatchUrl, patternRepeatCm, and repeatsInSwatch'
      })
    }
  })
})

export const sanityImageCommandSchema = z.union([
  sanityImagePrepareCommandSchema,
  sanityImageGenerateCommandSchema
])

export const sanityImageQueueMessageSchema = z.object({
  schemaVersion: z.literal(1),
  jobId: z.string().trim().min(1)
})

export const sanityActionQueueMessageSchema = z.object({
  schemaVersion: z.literal(1),
  sanityDocumentId: z.string().trim().min(1),
  requestId: z.string().trim().min(1)
})

// canonical stage vocabulary for the durable recovery ledger - Azure, Nuxt, and Studio must
// consume this instead of inventing local stage/state strings.
export const crawlPipelineStageSchema = z.enum([
  'source_render',
  'source_extract',
  'variant_render',
  'variant_extract',
  'image_classify',
  'compose',
  'publish'
])

export const crawlStageStateSchema = z.enum([
  'planned', 'pending_outbound', 'queued', 'running', 'completed',
  'failed', 'timed_out', 'blocked', 'superseded', 'cancelled'
])

export const crawlStageTargetSchema = z.object({
  kind: z.enum(['group', 'source_page', 'variant_page']),
  key: z.string().trim().min(1),
  urlKey: z.string().trim().min(1).optional(),
  variantId: z.string().trim().min(1).optional()
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
export type CrawlPipelineStage = z.infer<typeof crawlPipelineStageSchema>
export type CrawlStageState = z.infer<typeof crawlStageStateSchema>
export type CrawlStageTarget = z.infer<typeof crawlStageTargetSchema>
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
export type SanityImagePrepareCommand = z.infer<typeof sanityImagePrepareCommandSchema>
export type SanityImageGenerateCommand = z.infer<typeof sanityImageGenerateCommandSchema>
export type SanityImageCommand = z.infer<typeof sanityImageCommandSchema>
export type SanityImageQueueMessage = z.infer<typeof sanityImageQueueMessageSchema>
export type SanityActionQueueMessage = z.infer<typeof sanityActionQueueMessageSchema>
export type BatchOperation = z.infer<typeof batchOperationSchema>
export type BatchItemStatus = z.infer<typeof batchItemStatusSchema>
export type ExtractionBatchJobItem = z.infer<typeof extractionBatchJobItemSchema>
export type ExtractionBatchJob = z.infer<typeof extractionBatchJobSchema>
export type BatchItemResult = z.infer<typeof batchItemResultSchema>
export type ExtractionBatchResult = z.infer<typeof extractionBatchResultSchema>

export const CrawlRequestMessage = crawlRequestMessageSchema
export const CrawlPipelineStage = crawlPipelineStageSchema
export const CrawlStageState = crawlStageStateSchema
export const CrawlStageTarget = crawlStageTargetSchema
export const RenderRequest = renderRequestSchema
export const RenderJob = renderJobSchema
export const RenderResponse = renderResponseSchema
export const RenderComplete = renderCompleteSchema
export const ExtractJob = extractJobSchema
export const VariantJob = variantJobSchema
export const TransformJob = transformJobSchema
export const ImageJob = imageJobSchema
export const PublishJob = publishJobSchema
export const SanityImagePrepareCommand = sanityImagePrepareCommandSchema
export const SanityImageGenerateCommand = sanityImageGenerateCommandSchema
export const SanityImageCommand = sanityImageCommandSchema
export const SanityImageQueueMessage = sanityImageQueueMessageSchema
export const SanityActionQueueMessage = sanityActionQueueMessageSchema
export const BatchOperation = batchOperationSchema
export const BatchItemStatus = batchItemStatusSchema
export const ExtractionBatchJob = extractionBatchJobSchema
export const BatchItemResult = batchItemResultSchema
export const ExtractionBatchResult = extractionBatchResultSchema