import { describe, expect, it } from 'vitest'
import {
  DEFAULT_CAMERA_RENDERER,
  DEFAULT_CREATIVE_DIRECTION,
  IMAGE_GENERATION_CAPABILITIES,
  IMAGE_GENERATION_CAPABILITY_PRODUCT_TYPES,
  PATTERN_STRATEGIES,
  SURFACE_PROFILES,
  cameraIntentSchema,
  creativeDirectionSchema,
  getImageGenerationCapability,
  patternStrategyEntrySchema,
  surfaceProfileRendererIdentitySchema,
  surfaceProfileSchema
} from '../src/image-generation/index.js'

describe('IMAGE_GENERATION_CAPABILITIES', () => {
  it('has one capability row for every product type', () => {
    expect(Object.keys(IMAGE_GENERATION_CAPABILITIES).sort()).toEqual([...IMAGE_GENERATION_CAPABILITY_PRODUCT_TYPES].sort())
  })

  it('keeps fallback-capable texture rows on supported installed flooring only', () => {
    expect(getImageGenerationCapability('carpet').texture).toBe('preferred-with-surface-profile-fallback')
    expect(getImageGenerationCapability('laminate').texture).toBe('preferred-with-surface-profile-fallback')
    expect(getImageGenerationCapability('rug').texture).toBe('not-applicable')
  })
})

describe('surface profiles and renderers', () => {
  it('accepts the installed surface profiles', () => {
    for (const profile of Object.values(SURFACE_PROFILES)) {
      expect(surfaceProfileSchema.parse(profile).semanticFingerprint).toContain('surface:')
    }
  })

  it('keeps renderer identity separate from semantic profile identity', () => {
    const renderer = surfaceProfileRendererIdentitySchema.parse(DEFAULT_CAMERA_RENDERER)
    expect(renderer.rendererFingerprint).toContain('renderer')
    expect(SURFACE_PROFILES.carpet.semanticFingerprint).not.toBe(renderer.rendererFingerprint)
  })
})

describe('creative direction and camera', () => {
  it('accepts the default creative direction', () => {
    expect(creativeDirectionSchema.parse(DEFAULT_CREATIVE_DIRECTION).fashion).toBe('soft-contemporary')
  })

  it('accepts a provider-neutral camera intent snapshot', () => {
    const parsed = cameraIntentSchema.parse({
      room: 'bedroom',
      aspectRatio: '3:2',
      semanticFingerprint: 'camera:bedroom:3:2:v1',
      sceneConstraintFingerprint: 'camera-scene:bedroom:3:2:v1'
    })
    expect(parsed.room).toBe('bedroom')
  })
})

describe('pattern strategies', () => {
  it('keeps patterned and unknown classifications review-gated', () => {
    expect(patternStrategyEntrySchema.parse(PATTERN_STRATEGIES.patterned).requiresValidation).toBe(true)
    expect(patternStrategyEntrySchema.parse(PATTERN_STRATEGIES.unknown).requiresValidation).toBe(true)
    expect(patternStrategyEntrySchema.parse(PATTERN_STRATEGIES.plain).requiresValidation).toBe(false)
  })
})