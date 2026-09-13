import { z } from 'zod'
import {
  aiTemplateEvidenceImageSchema,
  imageGenerationTemplateAuditEntrySchema,
  imageGenerationTemplateBindingSchema
} from '../contracts/sanity.js'
import { SANITY_SUITABLE_ROOMS } from '../../registry/product-taxonomy.js'
import { roomCacheMetadataSchema } from '../../image-generation-v3/cache-compatibility/room-metadata.schema.js'
import { textureMetadataSchema } from '../../image-generation-v3/cache-compatibility/texture-metadata.schema.js'
import { colourDesignMetadataSchema } from '../../image-generation-v3/cache-compatibility/colour-design-metadata.schema.js'

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

const colourDesignPromptSchema = z.object({
  _key: z.string().trim().min(1).optional(),
  variantKey: z.string().trim().min(1),
  templateRevision: z.string().trim().min(1),
  fingerprint: z.string().trim().min(1),
  swatchFingerprint: z.string().trim().min(1).optional(),
  palette: z.array(z.object({
    _key: z.string().trim().min(1).optional(),
    hex: z.string().regex(/^#[0-9a-f]{6}$/i),
    coveragePercent: z.number().int().min(1).max(100)
  }).strict()).min(1).max(3).optional(),
  prompt: z.string().trim().min(1),
  schemaVersion: z.literal(1),
  generatedAt: z.string().datetime()
}).strict().merge(colourDesignMetadataSchema)

const roomPromptSchema = z.object({
  _key: z.string().trim().min(1).optional(),
  roomKey: z.enum(SANITY_SUITABLE_ROOMS),
  templateRevision: z.string().trim().min(1),
  fingerprint: z.string().trim().min(1),
  prompt: z.string().trim().min(1),
  schemaVersion: z.literal(1),
  generatedAt: z.string().datetime()
}).strict().merge(roomCacheMetadataSchema)

const sanityImageAssetRefSchema = z.string().regex(/^image-[a-f0-9]+-\d+x\d+-[a-z0-9]+$/i)
const sanityAiTexturePromptCacheSchema = z.object({
  prompt: z.string().trim().min(40).max(2400),
  sourceFingerprint: z.string().regex(/^[a-f0-9]{64}$/),
  sourceAssetRefs: z.array(sanityImageAssetRefSchema).min(1).max(6),
  generatedAt: z.string().datetime(),
  model: z.string().trim().min(1),
  promptVersion: z.number().int().positive()
}).strict().merge(textureMetadataSchema)

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