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
  // see crawlRequestMessageSchema - same authoritative box price / AI-bias pack hint contract.
  rawBoxPriceMinor: z.number().int().optional(),
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