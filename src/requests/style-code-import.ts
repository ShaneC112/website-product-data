import { z } from 'zod'

export const styleCodeImportRequestTypeSchema = z.literal('stylecode_import')

export const styleCodeImportRequestStatusSchema = z.enum([
  'pending',
  'processing',
  'queued',
  'completed',
  'held',
  'failed'
])

export const styleCodeImportResultOutcomeSchema = z.enum([
  'draft',
  'held',
  'failed',
  'excluded'
])

export const styleCodeImportPayloadSchema = z.object({
  styleCode: z.string().trim().min(1)
})

export const styleCodeImportResultSchema = z.object({
  m2crmRowKey: z.string().trim().min(1),
  runId: z.string().trim().min(1).optional(),
  outcome: styleCodeImportResultOutcomeSchema,
  message: z.string().trim().min(1),
  sanityDocumentId: z.string().trim().min(1).optional(),
  failedStage: z.string().trim().min(1).optional(),
  holdReasons: z.array(z.string().trim().min(1)).optional(),
  completedAt: z.string().datetime()
})

export const styleCodeImportRequestDocumentSchema = z.object({
  _id: z.string().trim().min(1).optional(),
  _type: z.literal('styleCodeImportRequest'),
  requestId: z.string().trim().min(1),
  source: z.string().trim().min(1),
  requestType: styleCodeImportRequestTypeSchema,
  styleCode: z.string().trim().min(1),
  status: styleCodeImportRequestStatusSchema,
  progressMessages: z.array(z.string().trim().min(1)),
  successResults: z.array(styleCodeImportResultSchema),
  failureResults: z.array(styleCodeImportResultSchema),
  requestedAt: z.string().datetime(),
  completedAt: z.union([z.string().datetime(), z.null()]).optional()
})

export type StyleCodeImportPayload = z.infer<typeof styleCodeImportPayloadSchema>
export type StyleCodeImportResult = z.infer<typeof styleCodeImportResultSchema>
export type StyleCodeImportRequestDocument = z.infer<typeof styleCodeImportRequestDocumentSchema>
export type StyleCodeImportRequestStatus = z.infer<typeof styleCodeImportRequestStatusSchema>
export type StyleCodeImportResultOutcome = z.infer<typeof styleCodeImportResultOutcomeSchema>