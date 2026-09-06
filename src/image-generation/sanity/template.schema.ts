import { z } from 'zod'
import {
  aiTemplateEvidenceImageSchema,
  imageGenerationTemplateArtifactFamiliesSchema,
  imageGenerationTemplateAuditEntrySchema,
  imageGenerationTemplateBindingSchema
} from '../contracts/sanity.js'

export const aiImageGenerationTemplateSchema = z.object({
  _id: z.string().trim().min(1),
  _type: z.literal('aiImageGenerationTemplate'),
  title: z.string().trim().min(1),
  product: z.object({ _type: z.literal('reference'), _ref: z.string().trim().min(1), _weak: z.literal(true).optional() }).strict(),
  evidenceImages: z.array(aiTemplateEvidenceImageSchema).default([]),
  artifactFamilies: imageGenerationTemplateArtifactFamiliesSchema.default({ portable: [], bindingLocal: [] }),
  audit: z.array(imageGenerationTemplateAuditEntrySchema).default([]),
  binding: imageGenerationTemplateBindingSchema.optional()
}).strict()