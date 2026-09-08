import { z } from 'zod'

export const promptFeatureTypeSchema = z.enum(['texture', 'brand-identity', 'camera', 'colour-design'])

export function buildImageGenerationRunContentRowKey(runId: string, runEpoch: number, featureType: z.infer<typeof promptFeatureTypeSchema>): string {
  return `run:${runId}:epoch:${runEpoch}:content:${featureType}`
}

export const imageGenerationRunContentRowSchema = z.object({
  schemaVersion: z.literal(1),
  partitionKey: z.string().trim().min(1),
  rowKey: z.string().trim().min(1),
  requestId: z.string().trim().min(1),
  runId: z.string().trim().min(1),
  runEpoch: z.number().int().nonnegative(),
  featureType: promptFeatureTypeSchema,
  payloadFingerprint: z.string().trim().min(1),
  payloadJson: z.string().trim().min(1),
  capturedAt: z.string().datetime()
}).strict()

export const imageGenerationRunContentClaimSchema = z.object({
  schemaVersion: z.literal(1),
  partitionKey: z.string().trim().min(1),
  rowKey: z.string().trim().min(1),
  requestId: z.string().trim().min(1),
  runId: z.string().trim().min(1),
  runEpoch: z.number().int().nonnegative(),
  featureType: promptFeatureTypeSchema,
  leaseOwner: z.string().trim().min(1),
  leaseToken: z.string().trim().min(1),
  expiresAt: z.string().datetime()
}).strict()

export type PromptFeatureType = z.infer<typeof promptFeatureTypeSchema>
export type ImageGenerationRunContentRow = z.infer<typeof imageGenerationRunContentRowSchema>
export type ImageGenerationRunContentClaim = z.infer<typeof imageGenerationRunContentClaimSchema>