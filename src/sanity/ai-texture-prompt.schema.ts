import { z } from 'zod'
import { computeHash } from '../storage/keys.js'

export const sanityImageAssetRefSchema = z.string().regex(
  /^image-[a-f0-9]+-\d+x\d+-[a-z0-9]+$/i
)

export const sanityAiTextureTemplateSchema = z.object({
  _key: z.string().trim().min(1),
  _type: z.literal('image'),
  asset: z.object({
    _type: z.literal('reference'),
    _ref: sanityImageAssetRefSchema
  }),
  crop: z.unknown().optional(),
  hotspot: z.unknown().optional()
})

export const sanityAiTexturePromptCacheSchema = z.object({
  prompt: z.string().trim().min(40).max(2400),
  sourceFingerprint: z.string().regex(/^[a-f0-9]{64}$/),
  sourceAssetRefs: z.array(sanityImageAssetRefSchema).min(1).max(6),
  generatedAt: z.string().datetime(),
  model: z.string().trim().min(1),
  promptVersion: z.number().int().positive()
})

/**
 * Normalizes template asset refs into a stable, order-independent source set.
 */
export function normalizeAiTextureAssetRefs(assetRefs: readonly string[]): string[] {
  const parsedRefs = assetRefs.map((assetRef) => sanityImageAssetRefSchema.parse(assetRef))
  const uniqueRefs = [...new Set(parsedRefs)].sort((left, right) => left.localeCompare(right))

  if (uniqueRefs.length !== parsedRefs.length) {
    throw new Error('AI texture template asset refs must be unique')
  }

  if (uniqueRefs.length === 0) {
    throw new Error('At least one AI texture template asset ref is required')
  }

  if (uniqueRefs.length > 6) {
    throw new Error('No more than 6 AI texture template asset refs are allowed')
  }

  return uniqueRefs
}

export function computeAiTextureSourceFingerprint(assetRefs: readonly string[], promptVersion: number): string {
  return computeHash(JSON.stringify({
    assetRefs: normalizeAiTextureAssetRefs(assetRefs),
    promptVersion
  }))
}

export type SanityImageAssetRef = z.infer<typeof sanityImageAssetRefSchema>
export type SanityAiTextureTemplate = z.infer<typeof sanityAiTextureTemplateSchema>
export type SanityAiTexturePromptCache = z.infer<typeof sanityAiTexturePromptCacheSchema>