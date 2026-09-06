import { z } from 'zod'

export const imageGenerationFashionSchema = z.enum(['modern-classic', 'soft-contemporary'])
export const imageGenerationToneSchema = z.enum(['restrained', 'balanced', 'expressive'])
export const imageGenerationFurnitureTierSchema = z.enum(['mid', 'high', 'premium'])
export const imageGenerationLightingSchema = z.enum(['soft-raking-daylight', 'bright-even-daylight', 'warm-late-daylight'])

export const creativeDirectionSchema = z.object({
  fashion: imageGenerationFashionSchema,
  tone: imageGenerationToneSchema,
  furnitureTier: imageGenerationFurnitureTierSchema,
  lighting: imageGenerationLightingSchema,
  version: z.number().int().positive()
}).strict()

export const DEFAULT_CREATIVE_DIRECTION = {
  fashion: 'soft-contemporary',
  tone: 'balanced',
  furnitureTier: 'high',
  lighting: 'bright-even-daylight',
  version: 1
} as const satisfies z.infer<typeof creativeDirectionSchema>