import { describe, it, expect } from 'vitest'
import {
  roomCacheMetadataSchema,
  textureMetadataSchema,
  colourDesignMetadataSchema
} from '../src/image-generation-v3/cache-compatibility/index.js'
import { upcastImageGenerationV3CacheEntry } from '../src/image-generation-v3/versioning/index.js'

describe('Phase 1c: Cache compatibility and upcast rules', () => {
  describe('Cache metadata schema definitions', () => {
    it('roomCacheMetadataSchema accepts all V3 metadata fields optional', () => {
      const validRoom = {
        v3ProducerVersion: 1,
        v3NormalizationVersion: 1,
        v3PromptVersion: 'v3:1',
        v3InputFingerprint: 'abc123'
      }
      const result = roomCacheMetadataSchema.parse(validRoom)
      expect(result).toHaveProperty('v3ProducerVersion', 1)
      expect(result).toHaveProperty('v3NormalizationVersion', 1)
      expect(result).toHaveProperty('v3PromptVersion', 'v3:1')
      expect(result).toHaveProperty('v3InputFingerprint', 'abc123')
    })

    it('roomCacheMetadataSchema accepts empty object (all optional)', () => {
      const emptyRoom = {}
      const result = roomCacheMetadataSchema.parse(emptyRoom)
      expect(result).toEqual({})
    })

    it('textureCacheMetadataSchema accepts all V3 metadata fields optional', () => {
      const validTexture = {
        v3ProducerVersion: 1,
        v3NormalizationVersion: 1,
        v3PromptVersion: 'v3:1',
        v3InputFingerprint: 'def456'
      }
      const result = textureMetadataSchema.parse(validTexture)
      expect(result).toHaveProperty('v3ProducerVersion', 1)
      expect(result).toHaveProperty('v3InputFingerprint', 'def456')
    })

    it('colourDesignCacheMetadataSchema accepts all V3 metadata fields optional', () => {
      const validColour = {
        v3ProducerVersion: 2,
        v3NormalizationVersion: 3,
        v3PromptVersion: 'v3:2',
        v3InputFingerprint: 'ghi789'
      }
      const result = colourDesignMetadataSchema.parse(validColour)
      expect(result).toHaveProperty('v3ProducerVersion', 2)
      expect(result).toHaveProperty('v3InputFingerprint', 'ghi789')
    })
  })

  describe('Cache entry upcast rules: legacy backward compatibility', () => {
    it('legacy entry without V3 metadata is not silently valid — it is quarantined', () => {
      const legacyEntry = {
        roomKey: 'bedroom',
        roomDescription: 'A bedroom',
        prompt: 'A description of a bedroom',
        schemaVersion: 1,
        generatedAt: new Date().toISOString()
        // Missing: v3ProducerVersion, v3NormalizationVersion, v3PromptVersion, v3InputFingerprint
      }

      const result = upcastImageGenerationV3CacheEntry(legacyEntry)

      expect(result).toHaveProperty('status', 'quarantined')
      expect(result).toHaveProperty('reason')
      expect((result as Record<string, unknown>).reason).toMatch(/missing required V3 metadata/)
    })

    it('legacy entry is never automatically accepted as a valid cache hit', () => {
      const legacyRoom = {
        roomKey: 'living-room',
        fingerprint: 'abc123'
      }

      const result = upcastImageGenerationV3CacheEntry(legacyRoom)

      // Must be quarantined, not accepted
      expect(result).toHaveProperty('status', 'quarantined')
    })
  })

  describe('Cache entry upcast rules: complete V3 entries', () => {
    it('entry with all V3 metadata fields is accepted as-is', () => {
      const v3Entry = {
        roomKey: 'bedroom',
        roomDescription: 'A bedroom',
        prompt: 'A description of a bedroom',
        schemaVersion: 1,
        generatedAt: new Date().toISOString(),
        v3ProducerVersion: 1,
        v3NormalizationVersion: 1,
        v3PromptVersion: 'v3:1',
        v3InputFingerprint: 'abc123'
      }

      const result = upcastImageGenerationV3CacheEntry(v3Entry)

      // Entry should be passed through as-is, not quarantined
      expect(result).toEqual(v3Entry)
      expect((result as Record<string, unknown>).status).not.toBe('quarantined')
    })

    it('texture entry with all V3 metadata is accepted', () => {
      const v3Texture = {
        prompt: 'A texture description',
        sourceFingerprint: 'def456',
        sourceAssetRefs: ['image-abc-1x1-xyz'],
        generatedAt: new Date().toISOString(),
        model: 'flux-2-pro',
        promptVersion: 1,
        v3ProducerVersion: 1,
        v3NormalizationVersion: 1,
        v3PromptVersion: 'v3:1',
        v3InputFingerprint: 'def456'
      }

      const result = upcastImageGenerationV3CacheEntry(v3Texture)

      expect(result).toEqual(v3Texture)
      expect((result as Record<string, unknown>).status).not.toBe('quarantined')
    })
  })

  describe('Cache entry upcast rules: partial metadata treated as stale', () => {
    it('entry with only some V3 metadata fields is quarantined (partial = stale)', () => {
      const partialEntry = {
        roomKey: 'bedroom',
        prompt: 'A description of a bedroom',
        schemaVersion: 1,
        generatedAt: new Date().toISOString(),
        v3ProducerVersion: 1,
        v3NormalizationVersion: 1
        // Missing: v3PromptVersion, v3InputFingerprint
      }

      const result = upcastImageGenerationV3CacheEntry(partialEntry)

      expect(result).toHaveProperty('status', 'quarantined')
      expect((result as Record<string, unknown>).reason).toMatch(/missing required V3 metadata/)
    })

    it('entry with only v3ProducerVersion is quarantined', () => {
      const partialEntry = {
        roomKey: 'bedroom',
        prompt: 'A description of a bedroom',
        v3ProducerVersion: 1
      }

      const result = upcastImageGenerationV3CacheEntry(partialEntry)

      expect(result).toHaveProperty('status', 'quarantined')
    })
  })

  describe('Cache entry upcast rules: invalid inputs', () => {
    it('non-object input is quarantined', () => {
      const result = upcastImageGenerationV3CacheEntry('not an object')
      expect(result).toHaveProperty('status', 'quarantined')
      expect((result as Record<string, unknown>).reason).toMatch(/not an object/)
    })

    it('null input is quarantined', () => {
      const result = upcastImageGenerationV3CacheEntry(null)
      expect(result).toHaveProperty('status', 'quarantined')
    })

    it('number input is quarantined', () => {
      const result = upcastImageGenerationV3CacheEntry(123)
      expect(result).toHaveProperty('status', 'quarantined')
    })
  })
})
