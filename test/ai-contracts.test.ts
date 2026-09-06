import { describe, expect, it } from 'vitest'
import {
  canonicalAiOperationSchema,
  canonicalImageEditOperationSchema,
  canonicalImageGenerationOperationSchema,
  canonicalStructuredTextOperationSchema
} from '../src/ai/contracts.js'
import { STORAGE_QUEUES, STORAGE_TABLES } from '../src/storage/constants.js'

describe('canonicalAiOperationSchema', () => {
  it('accepts a structured-text operation', () => {
    const parsed = canonicalStructuredTextOperationSchema.parse({
      kind: 'structured-text',
      version: 1,
      parts: [{ kind: 'text', text: 'Describe the flooring surface.' }],
      outputSchemaKey: 'image.scene.v1'
    })

    expect(parsed.kind).toBe('structured-text')
  })

  it('accepts an image-generation operation', () => {
    const parsed = canonicalImageGenerationOperationSchema.parse({
      kind: 'image-generation',
      version: 1,
      prompt: 'Render a flooring-led room image.',
      references: [{ assetRef: 'image-asset-ref', role: 'source-evidence' }],
      output: { aspectRatio: '3:2', count: 1, format: 'png' }
    })

    expect(parsed.output.aspectRatio).toBe('3:2')
  })

  it('accepts an image-edit operation', () => {
    const parsed = canonicalImageEditOperationSchema.parse({
      kind: 'image-edit',
      version: 1,
      prompt: 'Refine the flooring pattern only.',
      inputs: [{ assetRef: 'image-asset-ref', role: 'base-scene' }],
      output: { aspectRatio: '4:3', count: 1, format: 'jpeg' }
    })

    expect(parsed.kind).toBe('image-edit')
  })

  it('rejects provider-shaped fields on canonical operations', () => {
    const result = canonicalAiOperationSchema.safeParse({
      kind: 'structured-text',
      version: 1,
      parts: [{ kind: 'text', text: 'Describe the flooring surface.' }],
      outputSchemaKey: 'image.scene.v1',
      messages: [{ role: 'user', content: 'provider payload' }]
    })

    expect(result.success).toBe(false)
  })

  it('rejects unknown image-generation provider fields', () => {
    const result = canonicalAiOperationSchema.safeParse({
      kind: 'image-generation',
      version: 1,
      prompt: 'Render a flooring-led room image.',
      references: [{ assetRef: 'image-asset-ref', role: 'source-evidence' }],
      output: { aspectRatio: '3:2', count: 1, format: 'png' },
      image_prompt: 'provider-only field'
    })

    expect(result.success).toBe(false)
  })
})

describe('v2 storage identities', () => {
  it('adds the approved v2 queues and tables without changing v1 values', () => {
    expect(STORAGE_QUEUES.sanityImagePrepare).toBe('sanity-image-prepare')
    expect(STORAGE_QUEUES.sanityImageGenerate).toBe('sanity-image-generate')
    expect(STORAGE_QUEUES.sanityImageResolveV2).toBe('sanity-image-resolve-v2')
    expect(STORAGE_QUEUES.sanityImageGenerateV2).toBe('sanity-image-generate-v2')
    expect(STORAGE_QUEUES.sanityImageAssembleV2).toBe('sanity-image-assemble-v2')
    expect(STORAGE_QUEUES.sanityImageRenderV2).toBe('sanity-image-render-v2')
    expect(STORAGE_QUEUES.sanityImagePersistV2).toBe('sanity-image-persist-v2')
    expect(STORAGE_TABLES.sanityImageGeneration).toBe('sanityimagegeneration')
    expect(STORAGE_TABLES.sanityTexturePrompt).toBe('sanitytextureprompts')
    expect(STORAGE_TABLES.sanityImageGenerationV2).toBe('sanityimagegenerationv2')
    expect(STORAGE_TABLES.sanityImageArtifactsV2).toBe('sanityimageartifactsv2')
    expect(STORAGE_TABLES.aiProviderQuotas).toBe('aiproviderquotas')
  })
})