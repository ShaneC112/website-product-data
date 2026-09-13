import { z } from 'zod'

/**
 * V3 metadata fields for texture cache entries (exported separately for clarity).
 * Extends the existing `texturePrompt` schema in prompt-cache-value.schema.ts.
 */
export const textureMetadataSchema = z.object({
  v3ProducerVersion: z.number().int().positive().optional(),
  v3NormalizationVersion: z.number().int().positive().optional(),
  v3PromptVersion: z.string().trim().min(1).optional(),
  v3InputFingerprint: z.string().trim().min(1).optional()
}).strict()

export type TextureMetadata = z.infer<typeof textureMetadataSchema>
