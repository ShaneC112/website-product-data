export const MINIMUM_DETAIL_SCORE = 0.7
export const MINIMUM_ACCURACY_SCORE = 0.8

export type PublicationGateProduct = {
  name?: string
  slug?: {current?: string}
  productType?: string
  variants?: Array<{
    colourName?: string
    primaryImage?: unknown
    swatchImage?: unknown
  }>
  importMeta?: {
    gateStatus?: string
    detailScore?: number
    accuracyScore?: number
    blockingReasons?: string[]
  }
}

export function evaluatePublicationGate(product: PublicationGateProduct): string[] {
  const reasons: string[] = []
  const variants = product.variants ?? []

  if (!product.name?.trim()) reasons.push('A product name is required.')
  if (!product.slug?.current?.trim()) reasons.push('A slug is required.')
  if (!product.productType) reasons.push('A product type is required.')
  if (variants.length === 0) reasons.push('At least one colour variant is required.')
  if (variants.some((variant) => !variant.colourName?.trim())) {
    reasons.push('Every variant requires a colour name.')
  }
  if (!variants.some((variant) => variant.primaryImage || variant.swatchImage)) {
    reasons.push('At least one variant requires a product image or swatch.')
  }
  if (product.importMeta?.gateStatus !== 'ready') {
    reasons.push('Pipeline gate status must be ready.')
  }
  if ((product.importMeta?.detailScore ?? 0) < MINIMUM_DETAIL_SCORE) {
    reasons.push(`Detail score must be at least ${MINIMUM_DETAIL_SCORE}.`)
  }
  if ((product.importMeta?.accuracyScore ?? 0) < MINIMUM_ACCURACY_SCORE) {
    reasons.push(`Accuracy score must be at least ${MINIMUM_ACCURACY_SCORE}.`)
  }
  if ((product.importMeta?.blockingReasons?.length ?? 0) > 0) {
    reasons.push('Resolve all pipeline blocking reasons.')
  }

  return reasons
}