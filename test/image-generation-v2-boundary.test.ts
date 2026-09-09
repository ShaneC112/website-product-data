import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {describe, expect, it} from 'vitest'
import {colourDesignPromptSchema, roomPromptSchema} from '../src/image-generation/contracts/sanity'

describe('image generation v2 boundary', () => {
  it('keeps v2 Sanity request/template/run schemas isolated under image-generation', () => {
    const requestSchema = readFileSync(resolve(import.meta.dirname, '../src/image-generation/sanity/request.schema.ts'), 'utf8')
    const templateSchema = readFileSync(resolve(import.meta.dirname, '../src/image-generation/sanity/template.schema.ts'), 'utf8')
    const runSchema = readFileSync(resolve(import.meta.dirname, '../src/image-generation/sanity/run.schema.ts'), 'utf8')

    expect(requestSchema).toContain("aiImageGenerationRequestSchema")
    expect(templateSchema).toContain("aiImageGenerationTemplateSchema")
    expect(runSchema).toContain("aiImageGenerationRunSchema")
  })

  it('keeps shared mediaImage projection outside the v2 image-generation namespace', () => {
    const imageGenerationIndex = readFileSync(resolve(import.meta.dirname, '../src/image-generation/index.ts'), 'utf8')
    const sanityRoot = readFileSync(resolve(import.meta.dirname, '../src/sanity.ts'), 'utf8')

    expect(imageGenerationIndex).not.toContain('mediaImage.groq')
    expect(sanityRoot).toContain("./sanity/mediaImage.groq.js")
  })

  it('accepts cache entries with optional Sanity array keys for legacy reads', () => {
    expect(colourDesignPromptSchema.parse({
      variantKey: 'variant-1', fingerprint: 'fingerprint-1', prompt: 'prompt', schemaVersion: 1,
      generatedAt: '2026-09-09T00:00:00.000Z'
    })).not.toHaveProperty('_key')
    expect(roomPromptSchema.parse({
      roomKey: 'bedroom', fingerprint: 'fingerprint-1', prompt: 'prompt', schemaVersion: 1,
      generatedAt: '2026-09-09T00:00:00.000Z'
    })).not.toHaveProperty('_key')
  })
})