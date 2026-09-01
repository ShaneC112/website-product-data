export const IMAGE_GENERATION_PROFILE_KEYS = [
  'flux-roomshot-v1',
  'flux-kontext-pattern-v1'
] as const

export type ImageGenerationProfileKey = (typeof IMAGE_GENERATION_PROFILE_KEYS)[number]

export type ImageGenerationProfileEstimate = {
  title: string
  pipeline: 'direct' | 'patterned-kontext'
  estimatedCostEurPerImage: number
  pricingRevision: string
  pricingNote: string
}

export const IMAGE_GENERATION_PROFILE_ESTIMATES = {
  'flux-roomshot-v1': {
    title: 'Direct room image',
    pipeline: 'direct',
    estimatedCostEurPerImage: 0.039,
    pricingRevision: 'bfl-2026-08-31',
    pricingNote: 'FLUX.2 Pro image editing from USD 0.045 at up to 1 MP because the request includes a swatch image prompt; converted at ECB 1 EUR = 1.1596 USD.'
  },
  'flux-kontext-pattern-v1': {
    title: 'Patterned room image',
    pipeline: 'patterned-kontext',
    estimatedCostEurPerImage: 0.061,
    pricingRevision: 'bfl-2026-08-31',
    pricingNote: 'FLUX.2 Pro base from USD 0.03 plus FLUX.1 Kontext Pro USD 0.04; converted at ECB 1 EUR = 1.1596 USD.'
  }
} as const satisfies Record<ImageGenerationProfileKey, ImageGenerationProfileEstimate>

export function estimateImageGenerationCostEur(profile: ImageGenerationProfileKey, imageCount: number): number {
  return Number((IMAGE_GENERATION_PROFILE_ESTIMATES[profile].estimatedCostEurPerImage * imageCount).toFixed(2))
}