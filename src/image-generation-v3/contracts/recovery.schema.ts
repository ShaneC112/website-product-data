import { z } from 'zod'

export const imageGenerationV3RecoveryActionSchema = z.enum([
  'reconcile-media-attachment',
  'retry-sanity-projection',
  'restart-feature-resolution'
])

export type ImageGenerationV3RecoveryAction = z.infer<typeof imageGenerationV3RecoveryActionSchema>

export const imageGenerationV3RecoveryControlSchema = z.object({
  operation: z.literal('request.recover'),
  controlId: z.string().trim().min(1),
  requestedAt: z.string().datetime(),
  requestId: z.string().trim().min(1),
  runId: z.string().trim().min(1),
  runEpoch: z.number().int().nonnegative(),
  expectedRequestRevision: z.string().trim().min(1),
  expectedArtifactHash: z.string().trim().min(1),
  action: imageGenerationV3RecoveryActionSchema,
  requestedBy: z.string().trim().min(1)
}).strict()

export type ImageGenerationV3RecoveryControl = z.infer<typeof imageGenerationV3RecoveryControlSchema>

const imageGenerationV3RecoveryResultBaseSchema = z.object({
  controlId: z.string().trim().min(1),
  v3RecoveryRunId: z.string().trim().min(1).optional()
}).strict()

export const imageGenerationV3RecoveryAcceptedResultSchema = imageGenerationV3RecoveryResultBaseSchema.extend({
  outcome: z.literal('v3_recovery_accepted')
}).strict()

export const imageGenerationV3RecoveryBlockedResultSchema = imageGenerationV3RecoveryResultBaseSchema.extend({
  outcome: z.literal('v3_recovery_blocked'),
  reasonCode: z.string().trim().min(1)
}).strict()

export const imageGenerationV3RecoveryConflictResultSchema = imageGenerationV3RecoveryResultBaseSchema.extend({
  outcome: z.literal('v3_recovery_conflict'),
  reasonCode: z.string().trim().min(1),
  currentRequestRevision: z.string().trim().min(1)
}).strict()

export const imageGenerationV3RecoveryFailedResultSchema = imageGenerationV3RecoveryResultBaseSchema.extend({
  outcome: z.literal('v3_recovery_failed'),
  reasonCode: z.string().trim().min(1)
}).strict()

export const imageGenerationV3RecoveryResultSchema = z.discriminatedUnion('outcome', [
  imageGenerationV3RecoveryAcceptedResultSchema,
  imageGenerationV3RecoveryBlockedResultSchema,
  imageGenerationV3RecoveryConflictResultSchema,
  imageGenerationV3RecoveryFailedResultSchema
])

export type ImageGenerationV3RecoveryResult = z.infer<typeof imageGenerationV3RecoveryResultSchema>
