import { z } from 'zod'

export const sanityImageGenerationStatusSchema = z.enum([
  'accepted',
  'queued',
  'processing',
  'completed',
  'failed'
])

export const sanityImageGenerationTableSchema = z.object({
  partitionKey: z.string().trim().min(1),
  rowKey: z.string().trim().min(1),
  commandId: z.string().trim().min(1),
  requestId: z.string().trim().min(1),
  phase: z.enum(['prepare', 'generate']),
  runId: z.string().trim().min(1).optional(),
  sanityProjectId: z.string().trim().min(1),
  sanityDataset: z.string().trim().min(1),
  sanityDocumentId: z.string().trim().min(1),
  requestKey: z.string().trim().min(1),
  status: sanityImageGenerationStatusSchema,
  pipeline: z.enum(['direct', 'patterned-kontext']),
  generationProfile: z.string().trim().min(1),
  estimatedCostEur: z.number().nonnegative().optional(),
  pricingRevision: z.string().trim().min(1).optional(),
  provider: z.string().trim().min(1).optional(),
  model: z.string().trim().min(1).optional(),
  promptHash: z.string().trim().min(1).optional(),
  promptSent: z.string().optional(),
  assetId: z.string().trim().min(1).optional(),
  attempt: z.number().int().nonnegative().default(0),
  requestedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  terminalAt: z.string().datetime().optional(),
  retentionExpiresAt: z.string().datetime().optional(),
  error: z.string().max(2000).optional()
})

export type SanityImageGenerationStatus = z.infer<typeof sanityImageGenerationStatusSchema>
export type SanityImageGenerationTable = z.infer<typeof sanityImageGenerationTableSchema>