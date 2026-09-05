import { describe, expect, it } from 'vitest'
import {
  computeAiTextureSourceFingerprint,
  normalizeAiTextureAssetRefs,
  sanityAiTexturePromptCacheSchema,
  sanityAiTextureTemplateSchema
} from '../src/sanity/ai-texture-prompt.schema.js'
import {
  sanityTexturePromptLedgerSchema,
  sanityTexturePromptLedgerStatusSchema
} from '../src/storage/sanity-texture-prompt.schema.js'
import { STORAGE_TABLES } from '../src/storage/constants.js'

describe('AI texture prompt Sanity contracts', () => {
  it('accepts a native Sanity image template entry', () => {
    const parsed = sanityAiTextureTemplateSchema.parse({
      _key: 'template-1',
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: 'image-0123456789abcdef0123456789abcdef-1200x800-jpg'
      }
    })

    expect(parsed.asset._ref).toContain('1200x800')
  })

  it('accepts bounded cache metadata', () => {
    const parsed = sanityAiTexturePromptCacheSchema.parse({
      prompt: 'Dense, finely finished low-to-medium cut pile with restrained soft lustre and no clouding, marbling, or exaggerated relief.',
      sourceFingerprint: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      sourceAssetRefs: [
        'image-0123456789abcdef0123456789abcdef-1200x800-jpg',
        'image-fedcba9876543210fedcba9876543210-1600x900-png'
      ],
      generatedAt: '2026-09-01T00:00:00.000Z',
      model: 'gpt-5-vision',
      promptVersion: 1
    })

    expect(parsed.sourceAssetRefs).toHaveLength(2)
  })

  it('normalizes refs order-independently and rejects duplicates', () => {
    expect(normalizeAiTextureAssetRefs([
      'image-fedcba9876543210fedcba9876543210-1600x900-png',
      'image-0123456789abcdef0123456789abcdef-1200x800-jpg'
    ])).toEqual([
      'image-0123456789abcdef0123456789abcdef-1200x800-jpg',
      'image-fedcba9876543210fedcba9876543210-1600x900-png'
    ])

    expect(() => normalizeAiTextureAssetRefs([
      'image-0123456789abcdef0123456789abcdef-1200x800-jpg',
      'image-0123456789abcdef0123456789abcdef-1200x800-jpg'
    ])).toThrow(/unique/)
  })

  it('computes a stable source fingerprint from normalized refs and prompt version', () => {
    expect(computeAiTextureSourceFingerprint([
      'image-fedcba9876543210fedcba9876543210-1600x900-png',
      'image-0123456789abcdef0123456789abcdef-1200x800-jpg'
    ], 1)).toBe(computeAiTextureSourceFingerprint([
      'image-0123456789abcdef0123456789abcdef-1200x800-jpg',
      'image-fedcba9876543210fedcba9876543210-1600x900-png'
    ], 1))
  })

  it('enforces the six-image maximum', () => {
    expect(() => normalizeAiTextureAssetRefs([
      'image-00000000000000000000000000000001-100x100-jpg',
      'image-00000000000000000000000000000002-100x100-jpg',
      'image-00000000000000000000000000000003-100x100-jpg',
      'image-00000000000000000000000000000004-100x100-jpg',
      'image-00000000000000000000000000000005-100x100-jpg',
      'image-00000000000000000000000000000006-100x100-jpg',
      'image-00000000000000000000000000000007-100x100-jpg'
    ])).toThrow(/No more than 6/)
  })
})

describe('AI texture prompt storage contracts', () => {
  it('exports the dedicated storage table name', () => {
    expect(STORAGE_TABLES.sanityTexturePrompt).toBe('sanitytextureprompts')
  })

  it('accepts processing, completed, and failed ledger states', () => {
    expect(sanityTexturePromptLedgerStatusSchema.parse('processing')).toBe('processing')
    expect(sanityTexturePromptLedgerStatusSchema.parse('completed')).toBe('completed')
    expect(sanityTexturePromptLedgerStatusSchema.parse('failed')).toBe('failed')
  })

  it('accepts lease metadata without storing prompt text or image bytes', () => {
    const parsed = sanityTexturePromptLedgerSchema.parse({
      partitionKey: 'product-hash',
      rowKey: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      sanityProjectId: 'project',
      sanityDataset: 'production',
      sanityDocumentId: 'product-1',
      sourceFingerprint: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      promptVersion: 1,
      commandId: 'request-1:prepare',
      status: 'processing',
      attempt: 1,
      attemptsForCommand: 1,
      leaseExpiresAt: '2026-09-01T00:05:00.000Z',
      model: 'gpt-5-vision',
      promptHash: 'hash-1',
      requestedAt: '2026-09-01T00:00:00.000Z',
      updatedAt: '2026-09-01T00:00:00.000Z'
    })

    expect(parsed).not.toHaveProperty('prompt')
    expect(parsed).not.toHaveProperty('imageData')
  })
})