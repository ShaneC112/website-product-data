import { z } from 'zod'
import { crawlPipelineStageSchema } from '../queues/contracts.js'

const sourceRecordReferenceSchema = z.object({
  tableName: z.string().trim().min(1),
  rowKey: z.string().trim().min(1),
  m2crmUuid: z.string().trim().min(1).optional()
}).strict()

export const productGenerationSubmissionReferenceSchema = z.object({
  schemaVersion: z.literal(1),
  submissionId: z.string().trim().min(1),
  sourceGroupKey: z.string().trim().min(1),
  sourceRecord: sourceRecordReferenceSchema,
  requestedAt: z.string().trim().min(1)
}).strict()

export type ProductGenerationSubmissionReferenceType = z.infer<typeof productGenerationSubmissionReferenceSchema>

export const productGenerationSanityActionReferenceSchema = z.object({
  schemaVersion: z.literal(1),
  actionId: z.string().trim().min(1),
  requestDocumentId: z.string().trim().min(1),
  requestId: z.string().trim().min(1),
  action: z.enum(['crawl', 'rebuild', 'recover', 'stylecode_import']),
  requestedAt: z.string().trim().min(1)
}).strict()

export type ProductGenerationSanityActionReferenceType = z.infer<typeof productGenerationSanityActionReferenceSchema>

export const productGenerationRecoverySchema = z.object({
  schemaVersion: z.literal(1),
  sourceGroupKey: z.string().trim().min(1),
  epoch: z.number().int().positive(),
  startAt: z.enum([
    'render_source',
    'extract_source',
    'recover_missing_variants',
    'extract_variants',
    'classify_images',
    'compose',
    'publish'
  ]),
  requestedAt: z.string().trim().min(1)
}).strict()

export type ProductGenerationRecoveryType = z.infer<typeof productGenerationRecoverySchema>

export const productGenerationStatusProjectionSchema = z.object({
  schemaVersion: z.literal(1),
  sourceGroupKey: z.string().trim().min(1),
  runId: z.string().trim().min(1),
  epoch: z.number().int().positive(),
  status: z.string().trim().min(1),
  stage: crawlPipelineStageSchema.optional(),
  updatedAt: z.string().trim().min(1),
  failureMessage: z.string().trim().min(1).optional()
}).strict()

export type ProductGenerationStatusProjectionType = z.infer<typeof productGenerationStatusProjectionSchema>