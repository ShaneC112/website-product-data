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
  templateType: z.enum(['texture', 'pattern']),
  targetVariantIds: z.array(z.string().trim().min(1)).min(1).optional()
}).strict()

export const aiTemplateEvidenceImageSchema = z.object({
  _type: z.literal('image'),
  _key: z.string().trim().min(1),
  asset: z.object({ _type: z.literal('reference'), _ref: sanityImageAssetRefSchema }).strict(),
  crop: sanityCropSchema.optional(),
  hotspot: sanityHotspotSchema.optional(),
  templateUses: z.array(aiTemplateUseSchema).min(1).optional()
}).strict()

export const imageGenerationVariantBindingSchema = z.object({
  variantId: z.string().trim().min(1),
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

export const imageGenerationTemplateArtifactFamilySchema = z.enum(['portable', 'binding-local'])

export const imageGenerationTemplateArtifactFamiliesSchema = z.object({
  portable: z.array(z.string().trim().min(1)).default([]),
  bindingLocal: z.array(z.string().trim().min(1)).default([])
}).strict()

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
  clearedArtifactFamilies: z.array(imageGenerationTemplateArtifactFamilySchema).min(1)
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
  reboundArtifactFamilies: z.array(imageGenerationTemplateArtifactFamilySchema).min(1)
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