import { z } from 'zod'

/**
 * V3 metadata fields for room cache entries.
 * Extends the existing `roomPrompts[]` schema with compatible optional fields.
 * These fields are used to validate that a cached room entry is current for V3,
 * and to distinguish cache hits from cache misses when V3 metadata is absent or stale.
 */
export const roomCacheMetadataSchema = z.object({
  v3ProducerVersion: z.number().int().positive().optional(),
  v3NormalizationVersion: z.number().int().positive().optional(),
  v3PromptVersion: z.string().trim().min(1).optional(),
  v3InputFingerprint: z.string().trim().min(1).optional()
}).strict()

export type RoomCacheMetadata = z.infer<typeof roomCacheMetadataSchema>

