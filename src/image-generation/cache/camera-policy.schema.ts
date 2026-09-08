import { z } from 'zod'
import { SANITY_PRODUCT_TYPES, SANITY_SUITABLE_ROOMS } from '../../registry/product-taxonomy.js'

const orderedRange = <T extends number>(item: z.ZodType<T>) => z.tuple([item, item]).refine(([minimum, maximum]) => minimum <= maximum, {
  message: 'Range minimum must not exceed maximum'
})

export const cameraAngleSourceRowSchema = z.object({
  room: z.enum(SANITY_SUITABLE_ROOMS),
  productType: z.enum(SANITY_PRODUCT_TYPES),
  cameraHeightMeters: orderedRange(z.number().positive()),
  lensMmFullFrame: orderedRange(z.number().int().positive()),
  pitch: z.enum(['level', 'slight-down', 'level/slight-down']),
  targetFloorSharePercent: orderedRange(z.number().int().min(1).max(100)),
  cropSafeFloorMinimumPercent: z.literal(33),
  stairsVisibleModifier: z.boolean().optional()
}).strict()

export const cameraPolicySchema = cameraAngleSourceRowSchema.extend({
  version: z.literal(1)
}).strict()

export type CameraAngleSourceRow = z.infer<typeof cameraAngleSourceRowSchema>
export type CameraPolicy = z.infer<typeof cameraPolicySchema>