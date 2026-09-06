import { z } from 'zod'
import { SANITY_SUITABLE_ROOMS } from '../../registry/product-taxonomy.js'

export const imageGenerationAspectRatioSchema = z.enum(['1:1', '3:2', '4:3', '16:9'])

export const cameraIntentSchema = z.object({
  room: z.enum(SANITY_SUITABLE_ROOMS),
  aspectRatio: imageGenerationAspectRatioSchema,
  semanticFingerprint: z.string().trim().min(1),
  sceneConstraintFingerprint: z.string().trim().min(1)
}).strict()

export const cameraRendererIdentitySchema = z.object({
  key: z.string().trim().min(1),
  version: z.number().int().positive(),
  rendererFingerprint: z.string().trim().min(1)
}).strict()

export const DEFAULT_CAMERA_RENDERER = {
  key: 'camera-renderer',
  version: 1,
  rendererFingerprint: 'camera-renderer:v1'
} as const satisfies z.infer<typeof cameraRendererIdentitySchema>