import { z } from 'zod'

/**
 * Returned when a payload is unsupported, malformed, or has an incompatible version.
 * This is the "visibility into incompatibility" — never silently accept a payload
 * by default or merge it structurally.
 */
export const imageGenerationV3QuarantineSchema = z.object({
  status: z.literal('quarantined'),
  reason: z.string().trim().min(1)
}).strict()

export type ImageGenerationV3Quarantine = z.infer<typeof imageGenerationV3QuarantineSchema>

/**
 * Placeholder for recovery-control contract upcast. Actual recovery schema is defined in Phase 2a.
 */
export function upcastImageGenerationV3RecoveryControl(input: unknown): unknown {
  // Implemented in Phase 2a when the recovery-control schema is added.
  throw new Error('Recovery control upcast not yet implemented; defined in Phase 2a')
}

/**
 * Upcast rules for cache-entry compatibility.
 * Legacy cache entries (without v3 metadata) are treated as explicit cache misses in V3.
 * This prevents stale data (e.g., missing prompt-version field) from being silently served.
 *
 * In Phase 1c, we don't attempt to retroactively upcast legacy entries — they are quarantined.
 * Future phases may implement deterministic upcast rules (e.g., "if layout is unchanged and
 * product is not deleted, accept with v3 metadata defaults"), but that is not attempted here.
 */
export function upcastImageGenerationV3CacheEntry(
  input: unknown,
  options?: { allowLegacy?: boolean }
): unknown {
  if (typeof input !== 'object' || input === null) {
    return {
      status: 'quarantined',
      reason: 'Input is not an object'
    } as const
  }

  const entry = input as Record<string, unknown>

  // Check for required V3 metadata fields. If any are missing, treat as cache miss.
  const hasV3ProducerVersion = 'v3ProducerVersion' in entry && entry.v3ProducerVersion !== undefined
  const hasV3NormalizationVersion =
    'v3NormalizationVersion' in entry && entry.v3NormalizationVersion !== undefined
  const hasV3PromptVersion = 'v3PromptVersion' in entry && entry.v3PromptVersion !== undefined
  const hasV3InputFingerprint =
    'v3InputFingerprint' in entry && entry.v3InputFingerprint !== undefined

  const allV3MetadataPresent =
    hasV3ProducerVersion &&
    hasV3NormalizationVersion &&
    hasV3PromptVersion &&
    hasV3InputFingerprint

  // Legacy entry: no V3 metadata. Treat as cache miss unless explicitly allowed (never in Phase 1c).
  if (!allV3MetadataPresent) {
    if (options?.allowLegacy) {
      // Future phase: upcast with defaults (not implemented in Phase 1c)
      return input
    }
    // Cache miss: quarantine the entry so it's not silently served.
    return {
      status: 'quarantined',
      reason: 'Legacy cache entry missing required V3 metadata fields'
    } as const
  }

  // Entry has all required V3 metadata fields. Accept it as-is.
  return input
}
