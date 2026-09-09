import { z } from 'zod'
import {
  aiTemplateEvidenceImageSchema,
  imageGenerationTemplateAuditEntrySchema,
  imageGenerationTemplateBindingSchema,
  colourDesignPromptSchema,
  roomPromptSchema
} from '../contracts/sanity.js'
import { sanityAiTexturePromptCacheSchema } from './texture-prompt.schema.js'

function rejectDuplicateCacheEntries<T extends {fingerprint: string}>(
  entries: T[],
  identity: (entry: T) => string,
  context: z.RefinementCtx
): void {
  const seen = new Set<string>()
  for (const entry of entries) {
    const key = identity(entry)
    if (seen.has(key)) {
      context.addIssue({code: z.ZodIssueCode.custom, message: `duplicate cache entry: ${key}`})
      return
    }
    seen.add(key)
  }
}

const colourDesignPromptsSchema = z.array(colourDesignPromptSchema).default([]).superRefine((entries, context) => {
  rejectDuplicateCacheEntries(entries, (entry) => entry.variantKey, context)
})

const roomPromptsSchema = z.array(roomPromptSchema).default([]).superRefine((entries, context) => {
  rejectDuplicateCacheEntries(entries, (entry) => entry.roomKey, context)
})

export const aiImageGenerationTemplateSchema = z.object({
  _id: z.string().trim().min(1),
  _rev: z.string().trim().min(1).optional(),
  _type: z.literal('aiImageGenerationTemplate'),
  title: z.string().trim().min(1),
  product: z.object({ _type: z.literal('reference'), _ref: z.string().trim().min(1), _weak: z.literal(true).optional() }).strict(),
  evidenceImages: z.array(aiTemplateEvidenceImageSchema).default([]),
  texturePrompt: sanityAiTexturePromptCacheSchema.optional(),
  colourDesignPrompts: colourDesignPromptsSchema,
  roomPrompts: roomPromptsSchema,
  audit: z.array(imageGenerationTemplateAuditEntrySchema).default([]),
  binding: imageGenerationTemplateBindingSchema.optional()
}).strict()