import { z } from 'zod'

export const imageGenerationArtifactKindSchema = z.enum(['texture', 'pattern', 'scene', 'colour-design'])
export const imageGenerationArtifactValidationStateSchema = z.enum(['pending', 'validated', 'review-required', 'failed'])

export const imageGenerationArtifactLedgerSchema = z.object({
  schemaVersion: z.literal(1),
  partitionKey: z.string().trim().min(1),
  rowKey: z.string().trim().min(1),
  artifactKind: imageGenerationArtifactKindSchema,
  ownerScopeKey: z.string().trim().min(1),
  fingerprint: z.string().trim().min(1),
  state: imageGenerationArtifactValidationStateSchema,
  attempt: z.number().int().nonnegative().default(0),
  ownerToken: z.string().trim().min(1).optional(),
  leaseExpiresAt: z.string().datetime().optional(),
  outputReference: z.string().trim().min(1).optional(),
  updatedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional()
}).strict()