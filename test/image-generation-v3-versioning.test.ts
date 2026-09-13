import { describe, it, expect } from 'vitest'
import { imageGenerationV3QuarantineSchema } from '../src/image-generation-v3/versioning/index'

describe('image-generation-v3 versioning', () => {
  describe('imageGenerationV3QuarantineSchema', () => {
    it('accepts a valid quarantine record', () => {
      const result = imageGenerationV3QuarantineSchema.safeParse({
        status: 'quarantined',
        reason: 'unsupported-version:2'
      })
      expect(result.success).toBe(true)
    })

    it('rejects a record missing status', () => {
      const result = imageGenerationV3QuarantineSchema.safeParse({
        reason: 'unsupported-version:2'
      })
      expect(result.success).toBe(false)
    })

    it('rejects a record with wrong status value', () => {
      const result = imageGenerationV3QuarantineSchema.safeParse({
        status: 'failed',
        reason: 'unsupported-version:2'
      })
      expect(result.success).toBe(false)
    })

    it('rejects empty reason', () => {
      const result = imageGenerationV3QuarantineSchema.safeParse({
        status: 'quarantined',
        reason: ''
      })
      expect(result.success).toBe(false)
    })

    it('rejects extra fields', () => {
      const result = imageGenerationV3QuarantineSchema.safeParse({
        status: 'quarantined',
        reason: 'unsupported-version:2',
        extraField: 'should-fail'
      })
      expect(result.success).toBe(false)
    })
  })
})
