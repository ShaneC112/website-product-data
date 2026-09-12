import { z } from 'zod'
import { brandIdentitySchema } from './brand-identity.schema.js'
import { normalizedColourDesignSchema } from './colour-design.schema.js'
import { normalizedFullProductSchema } from './product-ingress.schema.js'
import { normalizedRoomSchema } from './room.schema.js'
import { normalizedSceneSchema } from './scene.schema.js'

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

const orderedRange = <T extends number>(item: z.ZodType<T>) => z.tuple([item, item]).refine(([minimum, maximum]) => minimum <= maximum, {
  message: 'Range minimum must not exceed maximum'
})

const cameraPolicyCacheSchema = z.object({
  version: z.literal(1),
  room: z.string().min(1),
  productType: z.string().min(1),
  cameraHeightMeters: orderedRange(z.number().positive()),
  lensMmFullFrame: orderedRange(z.number().int().positive()),
  pitch: z.enum(['level', 'slight-down', 'level/slight-down']),
  targetFloorSharePercent: orderedRange(z.number().int().min(1).max(100)),
  cropSafeFloorMinimumPercent: z.number().int().min(1).max(100),
  stairsVisibleModifier: z.boolean().optional(),
  bedroomFurnitureCoverageModifier: z.boolean().optional()
}).strict()

export const normalizedTextureSchema = z.discriminatedUnion('mode', [
  textureCompletedValueSchema,
  textureDeterministicFallbackValueSchema,
  textureBlockedValueSchema,
  textureNotApplicableValueSchema
])

export const promptCacheValueSchema = z.union([
  z.object({
    type: z.literal('texture'),
    schemaVersion: z.literal(1),
    value: normalizedTextureSchema
  }).strict(),
  z.object({
    type: z.literal('brand-identity'),
    schemaVersion: z.literal(1),
    value: brandIdentitySchema
  }).strict(),
  z.object({
    type: z.literal('camera'),
    schemaVersion: z.literal(1),
    value: cameraPolicyCacheSchema
  }).strict(),
  z.object({
    type: z.literal('colour-design'),
    schemaVersion: z.literal(1),
    value: normalizedColourDesignSchema
  }).strict(),
  z.object({
    type: z.literal('product'),
    schemaVersion: z.literal(1),
    value: normalizedFullProductSchema
  }).strict(),
  z.object({
    type: z.literal('room'),
    schemaVersion: z.literal(1),
    value: normalizedRoomSchema
  }).strict(),
  z.object({
    type: z.literal('scene'),
    schemaVersion: z.literal(2),
    value: normalizedSceneSchema
  }).strict()
])

export type NormalizedTexture = z.infer<typeof normalizedTextureSchema>
export type PromptCacheValue = z.infer<typeof promptCacheValueSchema>