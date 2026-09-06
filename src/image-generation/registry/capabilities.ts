import { z } from 'zod'
import { SANITY_PRODUCT_TYPES, type SanityProductType } from '../../registry/product-taxonomy.js'

export const evidenceRequirementSchema = z.enum(['required', 'preferred-with-surface-profile-fallback', 'optional', 'not-applicable'])

export const imageGenerationCapabilitySchema = z.object({
  texture: evidenceRequirementSchema,
  pattern: evidenceRequirementSchema,
  geometry: evidenceRequirementSchema,
  repeat: evidenceRequirementSchema,
  installation: evidenceRequirementSchema
}).strict()

export const IMAGE_GENERATION_CAPABILITIES = {
  carpet: { texture: 'preferred-with-surface-profile-fallback', pattern: 'optional', geometry: 'not-applicable', repeat: 'optional', installation: 'required' },
  'carpet-tile': { texture: 'preferred-with-surface-profile-fallback', pattern: 'optional', geometry: 'required', repeat: 'not-applicable', installation: 'required' },
  laminate: { texture: 'preferred-with-surface-profile-fallback', pattern: 'optional', geometry: 'required', repeat: 'not-applicable', installation: 'required' },
  lvt: { texture: 'preferred-with-surface-profile-fallback', pattern: 'optional', geometry: 'required', repeat: 'optional', installation: 'required' },
  vinyl: { texture: 'preferred-with-surface-profile-fallback', pattern: 'optional', geometry: 'required', repeat: 'optional', installation: 'required' },
  'engineered-wood': { texture: 'preferred-with-surface-profile-fallback', pattern: 'optional', geometry: 'required', repeat: 'not-applicable', installation: 'required' },
  rug: { texture: 'not-applicable', pattern: 'not-applicable', geometry: 'not-applicable', repeat: 'not-applicable', installation: 'not-applicable' },
  matting: { texture: 'not-applicable', pattern: 'not-applicable', geometry: 'not-applicable', repeat: 'not-applicable', installation: 'not-applicable' },
  'artificial-grass': { texture: 'not-applicable', pattern: 'not-applicable', geometry: 'not-applicable', repeat: 'not-applicable', installation: 'not-applicable' }
} as const satisfies Record<SanityProductType, z.infer<typeof imageGenerationCapabilitySchema>>

export const imageGenerationCapabilitiesSchema = z.record(imageGenerationCapabilitySchema)

export function getImageGenerationCapability(productType: SanityProductType) {
  return IMAGE_GENERATION_CAPABILITIES[productType]
}

export const IMAGE_GENERATION_CAPABILITY_PRODUCT_TYPES = SANITY_PRODUCT_TYPES