import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {describe, expect, it} from 'vitest'

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

  it('keeps persisted prompt contracts type-only in the shared Data package', () => {
    const sanityContracts = readFileSync(resolve(import.meta.dirname, '../src/image-generation/contracts/sanity.ts'), 'utf8')

    expect(sanityContracts).toContain('export type ColourDesignPrompt')
    expect(sanityContracts).toContain('export type RoomPrompt')
    expect(sanityContracts).not.toContain('export const colourDesignPromptSchema')
    expect(sanityContracts).not.toContain('export const roomPromptSchema')
  })
})