import { z } from 'zod'

const textureCompletedValueSchema = z.object({
  kind: z.literal('completed'),
  mode: z.enum(['cached-template-prompt', 'generated-vision-prompt']),
  texturePrompt: z.string().min(1),
  sourceFingerprint: z.string().length(64),
  evidence: z.object({
    templateId: z.string().min(1),
    imageAssetCount: z.number().int().nonnegative()
  }).strict()
}).strict()

const textureDeterministicFallbackValueSchema = z.object({
  kind: z.literal('completed'),
  mode: z.literal('deterministic-fallback'),
  warningCode: z.literal('texture-helper-absent-surface-profile-used'),
  evidence: z.object({
    templateId: z.string().min(1),
    imageAssetCount: z.number().int().nonnegative()
  }).strict(),
  surfaceProfile: z.object({
    key: z.string().min(1),
    version: z.number().int().nonnegative(),
    semanticFingerprint: z.string().min(1)
  }).strict()
}).strict()

const textureBlockedValueSchema = z.object({
  kind: z.literal('blocked'),
  mode: z.literal('invalid-evidence'),
  reasonCode: z.enum(['texture-evidence-missing-texture-role', 'texture-evidence-insufficient'])
}).strict()

const textureNotApplicableValueSchema = z.object({
  kind: z.literal('completed'),
  mode: z.literal('not-applicable')
}).strict()

export const normalizedTextureSchema = z.discriminatedUnion('mode', [
  textureCompletedValueSchema,
  textureDeterministicFallbackValueSchema,
  textureBlockedValueSchema,
  textureNotApplicableValueSchema
])

export const promptCacheValueSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('texture'),
    schemaVersion: z.literal(1),
    value: normalizedTextureSchema
  }).strict()
])

export type NormalizedTexture = z.infer<typeof normalizedTextureSchema>
export type PromptCacheValue = z.infer<typeof promptCacheValueSchema>