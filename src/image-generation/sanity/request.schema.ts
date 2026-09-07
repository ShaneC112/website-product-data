import { z } from 'zod'
import { SANITY_SUITABLE_ROOMS } from '../../registry/product-taxonomy.js'
import { promptContributionSummarySchema } from '../contracts/prompt-generation.js'
import { imageGenerationAspectRatioSchema } from '../registry/camera.js'
import { creativeDirectionSchema } from '../registry/creative-direction.js'

export const aiImageGenerationRequestCurrentRunSchema = z.object({
  runId: z.string().trim().min(1),
  runEpoch: z.number().int().nonnegative(),
  recordedAt: z.string().datetime(),
  promptContributions: promptContributionSummarySchema.default([])
}).strict().refine((value) => value.runId && value.runEpoch >= 0 && value.recordedAt, {
  message: 'currentRun requires runId, runEpoch, and recordedAt together',
  path: ['runId']
})

export const aiImageGenerationRequestPolicySnapshotSchema = z.object({
  room: z.enum(SANITY_SUITABLE_ROOMS),
  aspectRatio: imageGenerationAspectRatioSchema,
  creativeDirection: creativeDirectionSchema,
  policyHash: z.string().trim().min(1),
  capturedAt: z.string().datetime()
}).strict()

export const imageGenerationSubmissionStateSchema = z.enum([
  'pending',
  'accepted',
  'duplicate',
  'conflict',
  'blocked',
  'failed'
])

export const imageGenerationSubmissionOutcomeSchema = z.object({
  outcome: imageGenerationSubmissionStateSchema.exclude(['pending']),
  recordedAt: z.string().datetime(),
  reasonCode: z.string().trim().min(1).optional()
}).strict()

export const aiImageGenerationRequestSchema = z.object({
  _id: z.string().trim().min(1),
  _type: z.literal('aiImageGenerationRequest'),
  requestId: z.string().trim().min(1),
  submissionId: z.string().trim().min(1),
  submissionState: imageGenerationSubmissionStateSchema,
  submissionOutcome: imageGenerationSubmissionOutcomeSchema.optional(),
  templateId: z.string().trim().min(1),
  variantKey: z.string().trim().min(1),
  room: z.enum(SANITY_SUITABLE_ROOMS),
  aspectRatio: imageGenerationAspectRatioSchema,
  creativeDirection: creativeDirectionSchema,
  currentPolicy: aiImageGenerationRequestPolicySnapshotSchema,
  currentRun: aiImageGenerationRequestCurrentRunSchema.optional(),
  requestedAt: z.string().datetime()
}).strict().superRefine((value, context) => {
  if (value._id !== value.requestId || value.submissionId !== value.requestId) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'request _id, submissionId, and requestId must match'
    })
  }

  if ((value.submissionState === 'pending') === Boolean(value.submissionOutcome)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'pending requests cannot have an outcome and non-pending requests require one'
    })
  } else if (value.submissionOutcome && value.submissionOutcome.outcome !== value.submissionState) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'request submission state and outcome must match'
    })
  }
})

export type AiImageGenerationRequestCurrentRun = z.infer<typeof aiImageGenerationRequestCurrentRunSchema>
export type AiImageGenerationRequestPolicySnapshot = z.infer<typeof aiImageGenerationRequestPolicySnapshotSchema>
export type AiImageGenerationRequest = z.infer<typeof aiImageGenerationRequestSchema>
export type ImageGenerationSubmissionState = z.infer<typeof imageGenerationSubmissionStateSchema>
export type ImageGenerationSubmissionOutcome = z.infer<typeof imageGenerationSubmissionOutcomeSchema>