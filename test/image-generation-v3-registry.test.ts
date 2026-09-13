import { describe, it, expect } from 'vitest'
import {
  imageGenerationV3FamilyKeySchema,
  imageGenerationV3RouteKeySchema,
  imageGenerationV3WorkflowVersionSchema,
  isEligibleForFamily
} from '../src/image-generation-v3/registry/index'

describe('image-generation-v3 registry', () => {
  describe('imageGenerationV3FamilyKeySchema', () => {
    it('accepts valid family keys', () => {
      const result = imageGenerationV3FamilyKeySchema.safeParse('plain-carpet')
      expect(result.success).toBe(true)
    })

    it('rejects invalid family keys', () => {
      const result = imageGenerationV3FamilyKeySchema.safeParse('patterned-carpet')
      expect(result.success).toBe(false)
    })
  })

  describe('imageGenerationV3RouteKeySchema', () => {
    it('accepts valid route keys', () => {
      const result = imageGenerationV3RouteKeySchema.safeParse('flux-2-pro')
      expect(result.success).toBe(true)
    })

    it('rejects invalid route keys', () => {
      const result = imageGenerationV3RouteKeySchema.safeParse('flux-kontext')
      expect(result.success).toBe(false)
    })
  })

  describe('imageGenerationV3WorkflowVersionSchema', () => {
    it('round-trips a valid workflow version', () => {
      const input = {
        workflow: 3,
        family: 'plain-carpet',
        route: 'flux-2-pro',
        featureVersions: {
          product: 1,
          room: 1,
          texture: 1,
          scene: 1
        },
        assemblyVersion: 1,
        promptReviewVersion: 1
      }
      const result = imageGenerationV3WorkflowVersionSchema.safeParse(input)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(input)
    })

    it('rejects workflow version with missing required fields', () => {
      const result = imageGenerationV3WorkflowVersionSchema.safeParse({
        workflow: 3,
        family: 'plain-carpet',
        route: 'flux-2-pro'
      })
      expect(result.success).toBe(false)
    })

    it('rejects workflow version with extra fields', () => {
      const result = imageGenerationV3WorkflowVersionSchema.safeParse({
        workflow: 3,
        family: 'plain-carpet',
        route: 'flux-2-pro',
        featureVersions: { product: 1 },
        assemblyVersion: 1,
        promptReviewVersion: 1,
        extraField: 'should-fail'
      })
      expect(result.success).toBe(false)
    })
  })

  describe('isEligibleForFamily', () => {
    it('returns true for plain-carpet', () => {
      expect(isEligibleForFamily('plain-carpet')).toBe(true)
    })
  })
})
