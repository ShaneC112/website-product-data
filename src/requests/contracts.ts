import { z } from 'zod'
import { packInfoHintSchema } from '../queues/contracts.js'
import { extractedScalarMeasurementSchema } from '../storage/page-detail.schema.js'

export const manualCrawlEnqueueSchema = z.object({
  tableName: z.enum(['m2crmproducts']),
  rowKey: z.string().min(1),
  url: z.string().url().startsWith('https://').optional(),
  crawlType: z.enum(['Range', 'Single', 'SpecifiedUrls']),
  specifiedUrls: z.array(z.string().url().startsWith('https://')).min(1).optional(),
  styleCode: z.string().min(1),
  trade: z.string().min(1),
  // see crawlRequestMessageSchema's pileWeightHint - same disambiguation contract, just entering
  // via the manual HTTP path instead of the sync path.
  pileWeightHint: z.string().trim().min(1).optional(),
  // M2CRM vendor name supplied as an identity candidate for page-evidence confirmation.
  brandNameHint: z.string().trim().min(1).optional(),
  // Authoritative M2CRM prices in minor currency units. Both must be explicit: use 0 when a
  // product has no sell price rather than dropping the source evidence at the queue boundary.
  price: z.number().int().nonnegative(),
  boxSalesPrice: z.number().int().nonnegative(),
  boxUnit: z.string().trim().min(1).optional(),
  packInfoHint: packInfoHintSchema.optional(),
  // see crawlRequestMessageSchema's rawWidthHint - same authoritative per-SKU roll width contract.
  rawWidthHint: z.array(extractedScalarMeasurementSchema).optional(),
  productOnlinePdfUrl: z.string().url().startsWith('https://').optional(),
  force: z.boolean().default(false),
  testMode: z.boolean().optional()
}).superRefine((input, ctx) => {
  if (input.crawlType !== 'SpecifiedUrls' && !input.url) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['url'], message: 'url is required for Single and Range crawl requests' })
  }
  if (input.crawlType === 'SpecifiedUrls' && !input.specifiedUrls?.length) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['specifiedUrls'], message: 'specifiedUrls is required for SpecifiedUrls crawl requests' })
  }
})

export type ManualCrawlEnqueueInput = z.infer<typeof manualCrawlEnqueueSchema>

// operator-facing recovery checkpoints, mapped 1:1 onto CrawlPipelineStage in the recovery
// executor. `force` is deliberately absent - recovery always targets a precise checkpoint.
export const crawlRecoveryCheckpointSchema = z.enum([
  'render_source', 'extract_source', 'recover_missing_variants',
  'extract_variants', 'classify_images', 'compose', 'publish'
])

export type CrawlRecoveryCheckpoint = z.infer<typeof crawlRecoveryCheckpointSchema>

const sanityActionPayloadSchema = z.object({
  sanityProductId: z.string().trim().min(1),
  force: z.literal(true),
})

// recovery never carries `force` - it always targets one precise pipeline checkpoint, resolved
// server-side by Azure from the product's sourceGroupKey (the browser only chooses a checkpoint).
const sanityRecoveryActionPayloadSchema = z.object({
  sanityProductId: z.string().trim().min(1),
  checkpoint: crawlRecoveryCheckpointSchema,
})

export const sanityActionRequestSchema = z.discriminatedUnion('action', [
  z.object({
    requestId: z.string().trim().min(1),
    action: z.literal('crawl'),
    payload: sanityActionPayloadSchema,
  }),
  z.object({
    requestId: z.string().trim().min(1),
    action: z.literal('rebuild'),
    payload: sanityActionPayloadSchema,
  }),
  z.object({
    requestId: z.string().trim().min(1),
    action: z.literal('recover'),
    payload: sanityRecoveryActionPayloadSchema,
  }),
])

export type SanityActionRequest = z.infer<typeof sanityActionRequestSchema>

export const matchingLedgerApprovalSchema = z.object({
  rowKey: z.string().min(1),
  sourceGroupKey: z.string().min(1),
  approvalState: z.enum(['approved', 'rejected', 'pending']),
  testMode: z.boolean().optional()
})

export type MatchingLedgerApprovalInput = z.infer<typeof matchingLedgerApprovalSchema>

export const publishPreflightSchema = z.object({
  sourceGroupKey: z.string().min(1),
  runId: z.string().min(1).optional(),
  testMode: z.boolean().optional()
})

export type PublishPreflightInput = z.infer<typeof publishPreflightSchema>

export const groupReprocessSchema = z.object({
  sourceGroupKey: z.string().min(1),
  runId: z.string().min(1).optional(),
  reason: z.enum(['manual_pdf_upload', 'manual_pdf_delete', 'operator_reprocess']).default('operator_reprocess'),
  testMode: z.boolean().optional()
})

export type GroupReprocessInput = z.infer<typeof groupReprocessSchema>

export const crawlRecoveryRequestSchema = z.object({
  sourceGroupKey: z.string().trim().min(1),
  checkpoint: crawlRecoveryCheckpointSchema,
  parentRunId: z.string().trim().min(1).optional(),
  requestedVariantUrlKeys: z.array(z.string().trim().min(1)).max(500).optional(),
  actor: z.enum(['nuxt', 'sanity', 'system']).default('nuxt'),
  testMode: z.boolean().optional()
})

export type CrawlRecoveryRequest = z.infer<typeof crawlRecoveryRequestSchema>


export const sanityRegistrySyncSchema = z.object({
  apply: z.boolean().default(false),
})

export type SanityRegistrySyncInput = z.infer<typeof sanityRegistrySyncSchema>

export const manualGroupPdfUploadSchema = z.object({
  sourceGroupKey: z.string().min(1),
  fileName: z.string().min(1),
  contentType: z.literal('application/pdf'),
  testMode: z.boolean().optional()
})

export type ManualGroupPdfUploadInput = z.infer<typeof manualGroupPdfUploadSchema>

export const manualGroupPdfDeleteSchema = z.object({
  sourceGroupKey: z.string().min(1),
  rowKey: z.string().min(1),
  testMode: z.boolean().optional()
})

export type ManualGroupPdfDeleteInput = z.infer<typeof manualGroupPdfDeleteSchema>

export const variantSwatchApproveSchema = z.object({
  sourceGroupKey: z.string().min(1),
  rowKey: z.string().min(1),
  testMode: z.boolean().optional()
})

export type VariantSwatchApproveInput = z.infer<typeof variantSwatchApproveSchema>

export const variantSwatchUrlOverrideSchema = z.object({
  sourceGroupKey: z.string().min(1),
  rowKey: z.string().min(1),
  overrideUrl: z.string().url().startsWith('https://'),
  testMode: z.boolean().optional()
})

export type VariantSwatchUrlOverrideInput = z.infer<typeof variantSwatchUrlOverrideSchema>

export const variantSwatchUploadOverrideSchema = z.object({
  sourceGroupKey: z.string().min(1),
  rowKey: z.string().min(1),
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  testMode: z.boolean().optional()
})

export type VariantSwatchUploadOverrideInput = z.infer<typeof variantSwatchUploadOverrideSchema>

export const variantSwatchClearOverrideSchema = z.object({
  sourceGroupKey: z.string().min(1),
  rowKey: z.string().min(1),
  testMode: z.boolean().optional()
})

export type VariantSwatchClearOverrideInput = z.infer<typeof variantSwatchClearOverrideSchema>