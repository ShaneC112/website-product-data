import { z } from 'zod'
import {
  SANITY_CATEGORY_KEYS,
  SANITY_PRODUCT_TYPES,
  SANITY_SUITABLE_ROOMS
} from '../../registry/product-taxonomy.js'
import { patternClassificationSchema } from '../registry/pattern-strategies.js'

const sanityImageAssetRefSchema = z.string().regex(/^image-[a-f0-9]+-\d+x\d+-[a-z0-9]+$/i)
const sanityCategoryKeySchema = z.string().refine((value) => SANITY_CATEGORY_KEYS.includes(value as (typeof SANITY_CATEGORY_KEYS)[number]), {
  message: 'Invalid category key'
})

export const sanityCropSchema = z.object({
  _type: z.literal('sanity.imageCrop'),
  top: z.number(),
  bottom: z.number(),
  left: z.number(),
  right: z.number()
}).strict()

export const sanityHotspotSchema = z.object({
  _type: z.literal('sanity.imageHotspot'),
  x: z.number(),
  y: z.number(),
  height: z.number(),
  width: z.number()
}).strict()

export const aiTemplateUseSchema = z.object({
  _key: z.string().trim().min(1).optional(),
  _type: z.string().trim().min(1).optional(),
  templateType: z.enum(['texture', 'pattern']),
  targetVariantIds: z.array(z.string().trim().min(1)).min(1).optional()
}).strict()

export const aiTemplateEvidenceImageSchema = z.object({
  _type: z.string().trim().min(1),
  _key: z.string().trim().min(1),
  asset: z.object({ _type: z.literal('reference'), _ref: sanityImageAssetRefSchema, _weak: z.boolean().optional() }).strict(),
  crop: sanityCropSchema.optional(),
  hotspot: sanityHotspotSchema.optional(),
  templateUses: z.array(aiTemplateUseSchema).min(1).optional()
}).strict()

export const imageGenerationVariantBindingSchema = z.object({
  _key: z.string().trim().min(1).optional(),
  variantKey: z.string().trim().min(1),
  colourName: z.string().trim().min(1),
  colourHex: z.string().regex(/^#[0-9a-f]{6}$/i).optional(),
  patternClassification: patternClassificationSchema.default('unknown')
}).strict()

export const imageGenerationTemplateBindingSchema = z.object({
  productId: z.string().trim().min(1),
  productType: z.enum(SANITY_PRODUCT_TYPES),
  categoryKey: sanityCategoryKeySchema,
  variantBindings: z.array(imageGenerationVariantBindingSchema).default([])
}).strict()

export const imageGenerationTemplateCacheFieldSchema = z.enum([
  'texturePrompt',
  'colourDesignPrompts',
  'roomPrompts'
])

const imageGenerationTemplateAuditEntryBaseSchema = z.object({
  auditId: z.string().trim().min(1),
  recordedAt: z.string().datetime(),
  actorId: z.string().trim().min(1).optional(),
  templateRevision: z.string().trim().min(1).optional()
}).strict()

export const imageGenerationTemplateResetAuditEntrySchema = imageGenerationTemplateAuditEntryBaseSchema.extend({
  operation: z.literal('template.reset'),
  targetRunId: z.string().trim().min(1).optional(),
  targetRunEpoch: z.number().int().min(0).optional(),
  clearedFields: z.array(imageGenerationTemplateCacheFieldSchema).min(1)
}).superRefine((value, context) => {
  const hasTargetRunId = typeof value.targetRunId === 'string'
  const hasTargetRunEpoch = typeof value.targetRunEpoch === 'number'

  if (hasTargetRunId !== hasTargetRunEpoch) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'targetRunId and targetRunEpoch must be provided together'
    })
  }
})

export const imageGenerationTemplateRebindAuditEntrySchema = imageGenerationTemplateAuditEntryBaseSchema.extend({
  operation: z.literal('template.rebind'),
  previousProductId: z.string().trim().min(1).optional(),
  nextProductId: z.string().trim().min(1),
  previousVariantIds: z.array(z.string().trim().min(1)).default([]),
  nextVariantIds: z.array(z.string().trim().min(1)).default([]),
  reboundFields: z.array(imageGenerationTemplateCacheFieldSchema).min(1)
})

export const imageGenerationTemplateAuditEntrySchema = z.union([
  imageGenerationTemplateResetAuditEntrySchema,
  imageGenerationTemplateRebindAuditEntrySchema
])

export function buildImageGenerationTemplateResetAuditEntry(input: z.input<typeof imageGenerationTemplateResetAuditEntrySchema>) {
  return imageGenerationTemplateResetAuditEntrySchema.parse(input)
}

export function buildImageGenerationTemplateRebindAuditEntry(input: z.input<typeof imageGenerationTemplateRebindAuditEntrySchema>) {
  return imageGenerationTemplateRebindAuditEntrySchema.parse(input)
}

export const colourDesignPromptSchema = z.object({
  _key: z.string().trim().min(1).optional(),
  variantKey: z.string().trim().min(1),
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
}).strict()

export const roomPromptSchema = z.object({
  _key: z.string().trim().min(1).optional(),
  roomKey: z.enum(SANITY_SUITABLE_ROOMS),
  fingerprint: z.string().trim().min(1),
  prompt: z.string().trim().min(1),
  schemaVersion: z.literal(1),
  generatedAt: z.string().datetime()
}).strict()

export type ColourDesignPrompt = z.infer<typeof colourDesignPromptSchema>
export type RoomPrompt = z.infer<typeof roomPromptSchema>