import { z } from 'zod'

export const sanityTexturePromptLedgerStatusSchema = z.enum(['processing', 'completed', 'failed'])

export const sanityTexturePromptLedgerSchema = z.object({
  partitionKey: z.string().trim().min(1),
  rowKey: z.string().trim().min(1),
  sanityProjectId: z.string().trim().min(1),
  sanityDataset: z.string().trim().min(1),
  sanityDocumentId: z.string().trim().min(1),
  sourceFingerprint: z.string().regex(/^[a-f0-9]{64}$/),
  promptVersion: z.number().int().positive(),
  commandId: z.string().trim().min(1),
  status: sanityTexturePromptLedgerStatusSchema,
  attempt: z.number().int().nonnegative(),
  attemptsForCommand: z.number().int().nonnegative(),
  leaseExpiresAt: z.string().datetime().optional(),
  model: z.string().trim().min(1).optional(),
  promptHash: z.string().trim().min(1).optional(),
  requestedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  error: z.string().max(2000).optional()
})

export type SanityTexturePromptLedgerStatus = z.infer<typeof sanityTexturePromptLedgerStatusSchema>
export type SanityTexturePromptLedger = z.infer<typeof sanityTexturePromptLedgerSchema>