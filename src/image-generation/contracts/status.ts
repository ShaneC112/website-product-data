import { z } from 'zod'
import { promptContributionSummarySchema } from './prompt-generation.js'

export const imageGenerationTerminalOutcomeSchema = z.enum(['completed', 'failed', 'cancelled', 'abandoned'])

export const imageGenerationRecoveryDispositionSchema = z.enum([
  'retryable',
  'validate-artifact',
  'operator-action-required',
  'terminal'
])

export const imageGenerationLifecycleProjectionSchema = z.object({
  currentStep: z.enum(['resolve', 'generate', 'assemble', 'render', 'persist']).optional(),
  currentWorkKind: z.string().trim().min(1).optional(),
  warningCodes: z.array(z.string().trim().min(1)).default([])
}).strict()

export const imageGenerationRecoveryProjectionSchema = z.object({
  disposition: imageGenerationRecoveryDispositionSchema,
  reasonCode: z.string().trim().min(1).optional()
}).strict()

export const imageGenerationTerminalMediaProjectionSchema = z.object({
  mediaId: z.string().trim().min(1),
  attachmentCommitToken: z.string().trim().min(1).optional(),
  providerOperationId: z.string().trim().min(1).optional(),
  productId: z.string().trim().min(1).optional(),
  variantId: z.string().trim().min(1).optional(),
  attachmentState: z.literal('attached').optional()
}).strict()

export const imageGenerationStatusSchema = z.discriminatedUnion('phase', [
  z.object({
    phase: z.literal('accepted'),
    requestId: z.string().trim().min(1)
  }).strict(),
  z.object({
    phase: z.literal('resolved'),
    requestId: z.string().trim().min(1),
    runId: z.string().trim().min(1),
    lifecycle: imageGenerationLifecycleProjectionSchema,
    warningCodes: z.array(z.string().trim().min(1)).default([])
  }).strict(),
  z.object({
    phase: z.literal('terminal'),
    requestId: z.string().trim().min(1),
    runId: z.string().trim().min(1),
    outcome: imageGenerationTerminalOutcomeSchema,
    lifecycle: imageGenerationLifecycleProjectionSchema,
    promptContributions: promptContributionSummarySchema,
    media: imageGenerationTerminalMediaProjectionSchema.optional(),
    recovery: imageGenerationRecoveryProjectionSchema
  }).strict()
])