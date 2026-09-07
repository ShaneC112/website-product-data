import { z } from 'zod'
import {
  aiTemplateEvidenceImageSchema,
  imageGenerationTemplateArtifactCacheEntrySchema,
  imageGenerationTemplateArtifactFamiliesSchema,
  imageGenerationTemplateArtifactProvenanceEntrySchema,
  imageGenerationTemplateAuditEntrySchema,
  imageGenerationTemplateBindingSchema
} from '../contracts/sanity.js'
import { sanityAiTexturePromptCacheSchema } from './texture-prompt.schema.js'

export const aiImageGenerationTemplateSchema = z.object({
  _id: z.string().trim().min(1),
  _type: z.literal('aiImageGenerationTemplate'),
  title: z.string().trim().min(1),
  product: z.object({ _type: z.literal('reference'), _ref: z.string().trim().min(1), _weak: z.literal(true).optional() }).strict(),
  evidenceImages: z.array(aiTemplateEvidenceImageSchema).default([]),
  texturePrompt: sanityAiTexturePromptCacheSchema.optional(),
  artifactFamilies: imageGenerationTemplateArtifactFamiliesSchema.default({ portable: [], bindingLocal: [] }),
  artifactCache: z.array(imageGenerationTemplateArtifactCacheEntrySchema).default([]),
  artifactProvenance: z.array(imageGenerationTemplateArtifactProvenanceEntrySchema).default([]),
  audit: z.array(imageGenerationTemplateAuditEntrySchema).default([]),
  binding: imageGenerationTemplateBindingSchema.optional()
}).strict()