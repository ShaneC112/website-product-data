import {SANITY_CONTENT_REQUIREMENTS, type SanityProductType} from '../registry/product-taxonomy.js'

export type StudioPublishReadinessProduct = {
  name?: string
  shortDescription?: string
  productType?: string
  widths?: Array<{value?: number; unit?: string}>
  variants?: Array<{
    colourName?: string
    hex?: string
    colourFamily?: string
    primaryImage?: unknown
    swatchImage?: unknown
    packInfo?: unknown
    packPrice?: unknown
  }>
}

// Sanity's own Publish button gate - fully independent of Azure's internal pipeline scoring (see
// evaluateBridgeEligibility, bridgeContract.schema.ts). Only checks fields a content editor can
// actually see and fix; never merge this with the bridge gate.
export function evaluateStudioPublishReadiness(product: StudioPublishReadinessProduct): string[] {
  const reasons: string[] = []
  const variants = product.variants ?? []

  if (!product.name?.trim()) reasons.push('A product name is required.')
  if (!product.shortDescription?.trim()) reasons.push('A short description is required.')
  if (!product.productType) reasons.push('A product type is required.')
  if (variants.length === 0) reasons.push('At least one colour variant is required.')
  if (variants.some((variant) => !variant.colourName?.trim())) {
    reasons.push('Every variant requires a colour name.')
  }
  if (variants.some((variant) => !variant.hex?.trim())) {
    reasons.push('Every variant requires a hex colour.')
  }
  if (variants.some((variant) => !variant.colourFamily?.trim())) {
    reasons.push('Every variant requires a colour family.')
  }
  if (variants.some((variant) => !variant.swatchImage && !variant.primaryImage)) {
    reasons.push('Every variant requires a product image or swatch.')
  }

  const requirements = product.productType
    ? SANITY_CONTENT_REQUIREMENTS[product.productType as SanityProductType]
    : undefined
  if (requirements?.requiresWidth && (product.widths ?? []).length === 0) {
    reasons.push('At least one available width is required for this product type.')
  }
  if (requirements?.requiresPackInfo && !variants.some((variant) => variant.packInfo || variant.packPrice)) {
    reasons.push('At least one variant requires pack/box info for this product type.')
  }

  return reasons
}