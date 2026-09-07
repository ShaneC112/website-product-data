import { z } from 'zod'
import { SANITY_PRODUCT_TYPES, SANITY_SUITABLE_ROOMS } from '../../registry/product-taxonomy.js'
import { imageGenerationAspectRatioSchema } from '../registry/camera.js'
import { creativeDirectionSchema } from '../registry/creative-direction.js'
import { getImageGenerationCapability } from '../registry/capabilities.js'
import { aiImageGenerationTemplateSchema } from './template.schema.js'

const linkedProductSchema = z.object({
  _id: z.string().trim().min(1),
  productType: z.enum(SANITY_PRODUCT_TYPES),
}).strict()

export type ImageGenerationTemplateReadiness = {
  canSubmit: boolean
  reasons: string[]
  templateId?: string
}

/** Validates the current editor selection against the authoritative template binding and linked product. */
export function evaluateImageGenerationTemplateReadiness(input: {
  template: unknown
  linkedProduct: unknown
  variantId: unknown
  room: unknown
  aspectRatio: unknown
  creativeDirection: unknown
}): ImageGenerationTemplateReadiness {
  const reasons: string[] = []
  const templateResult = aiImageGenerationTemplateSchema.safeParse(input.template)
  const productResult = linkedProductSchema.safeParse(input.linkedProduct)
  const roomResult = z.enum(SANITY_SUITABLE_ROOMS).safeParse(input.room)
  const aspectRatioResult = imageGenerationAspectRatioSchema.safeParse(input.aspectRatio)
  const creativeDirectionResult = creativeDirectionSchema.safeParse(input.creativeDirection)

  if (!templateResult.success) reasons.push('template-invalid')
  if (!productResult.success) reasons.push('linked-product-invalid')
  if (!z.string().trim().min(1).safeParse(input.variantId).success) reasons.push('variant-required')
  if (!roomResult.success) reasons.push('room-invalid')
  if (!aspectRatioResult.success) reasons.push('aspect-ratio-invalid')
  if (!creativeDirectionResult.success) reasons.push('creative-direction-invalid')
  if (reasons.length > 0) return {canSubmit: false, reasons}

  if (!templateResult.success || !productResult.success || !roomResult.success || !aspectRatioResult.success || !creativeDirectionResult.success) {
    return {canSubmit: false, reasons}
  }
  const variantIdResult = z.string().trim().min(1).safeParse(input.variantId)
  if (!variantIdResult.success) return {canSubmit: false, reasons: [...reasons, 'variant-required']}

  const template = templateResult.data
  const product = productResult.data
  const variantId = variantIdResult.data
  if (!template.binding || template.binding.variantBindings.length === 0) {
    reasons.push('template-binding-missing')
  } else {
    if (template.product._ref !== product._id || template.binding.productId !== product._id) reasons.push('binding-product-mismatch')
    if (template.binding.productType !== product.productType) reasons.push('binding-product-type-mismatch')
    if (!template.binding.variantBindings.some((binding) => binding.variantId === variantId)) reasons.push('variant-not-bound')
  }
  if (Object.values(getImageGenerationCapability(product.productType)).every((requirement) => requirement === 'not-applicable')) {
    reasons.push('product-type-not-supported')
  }

  return {
    canSubmit: reasons.length === 0,
    reasons,
    templateId: reasons.length === 0 ? template._id.replace(/^drafts\./, '') : undefined,
  }
}