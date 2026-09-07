import { z } from 'zod'
import { aiImageGenerationTemplateSchema } from './template.schema.js'

export const portableImageGenerationTemplateSchema = aiImageGenerationTemplateSchema.omit({
  evidenceImages: true,
  artifactFamilies: true,
  artifactCache: true,
  artifactProvenance: true,
  audit: true,
  binding: true
})

export type PortableImageGenerationTemplate = z.infer<typeof portableImageGenerationTemplateSchema>

export function toPortableImageGenerationTemplate(template: z.input<typeof aiImageGenerationTemplateSchema>): PortableImageGenerationTemplate {
  const parsed = aiImageGenerationTemplateSchema.parse(template)

  return portableImageGenerationTemplateSchema.parse({
    _id: parsed._id,
    _type: parsed._type,
    title: parsed.title,
    product: parsed.product
  })
}