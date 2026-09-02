import { z } from 'zod'

export const imageRoleSchema = z.enum(['primary', 'product', 'roomshot', 'swatch', 'technical', 'unknown'])

export const classifiedImageSchema = z.object({
  url: z.string().trim().min(1),
  role: imageRoleSchema,
  confidence: z.number().min(0).max(1)
})

export type ImageRole = z.infer<typeof imageRoleSchema>
export type ClassifiedImage = z.infer<typeof classifiedImageSchema>