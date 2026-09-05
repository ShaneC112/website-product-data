import { describe, expect, it } from 'vitest'
import {
  sanityImageCommandSchema,
  sanityImagePrepareCommandSchema,
  sanityImageStatementToneSchema,
  type SanityImagePrepareCommand
} from '../src/queues/contracts.js'

const basePrepareCommand = {
  commandId: 'request-1:prepare',
  requestId: 'request-1',
  sanityProjectId: 'project',
  sanityDataset: 'production',
  sanityDocumentId: 'drafts.product-1',
  requestKey: 'request-key',
  totalRuns: 1,
  requestedAt: '2026-09-01T00:00:00.000Z',
  phase: 'prepare' as const,
  autoCreate: true,
  product: { name: 'Range', productType: 'carpet' as const },
  variants: [{ variantId: 'v1', colourName: 'Cloud', swatchUrl: 'https://cdn.sanity.io/swatch.png' }],
  rooms: ['bedroom' as const],
  layDirection: 'toward-main-light' as const,
  design: {
    selectionKey: 'design-1',
    furnitureStyle: 'boconcept' as const,
    interiorFashion: '1980s-postmodern' as const,
    statementTone: 'bold' as const,
    lighting: 'afternoon' as const,
    pipeline: 'direct' as const,
    generationProfile: 'flux-roomshot-v1' as const,
    presetId: 'preset-1',
    presetKey: 'mid-market',
    presetTitle: 'Mid market',
    presetVersion: 1
  }
}

describe('sanityImageStatementToneSchema', () => {
  it('accepts none and the existing tones', () => {
    expect(sanityImageStatementToneSchema.parse('none')).toBe('none')
    expect(sanityImageStatementToneSchema.parse('restrained')).toBe('restrained')
    expect(sanityImageStatementToneSchema.parse('subtle')).toBe('subtle')
    expect(sanityImageStatementToneSchema.parse('balanced')).toBe('balanced')
    expect(sanityImageStatementToneSchema.parse('bold')).toBe('bold')
    expect(sanityImageStatementToneSchema.parse('dramatic')).toBe('dramatic')
  })

  it('rejects unknown tones', () => {
    expect(sanityImageStatementToneSchema.safeParse('maximalist').success).toBe(false)
  })
})

describe('sanityImagePrepareCommandSchema', () => {
  it('defaults an omitted statement tone to balanced', () => {
    const { statementTone, ...designWithoutTone } = basePrepareCommand.design
    const parsed = sanityImagePrepareCommandSchema.parse({
      ...basePrepareCommand,
      design: designWithoutTone
    })

    expect(parsed.design.statementTone).toBe('balanced')
  })

  it('preserves an explicit none tone', () => {
    const parsed = sanityImagePrepareCommandSchema.parse({
      ...basePrepareCommand,
      design: {
        ...basePrepareCommand.design,
        statementTone: 'none'
      }
    })

    expect(parsed.design.statementTone).toBe('none')
  })
})

describe('sanityImageCommandSchema', () => {
  it('validates a prompt preparation snapshot', () => {
    const command = sanityImageCommandSchema.parse(basePrepareCommand)
    expect(command.phase).toBe('prepare')
    expect(command.autoCreate).toBe(true)
  })

  it('enforces product-specific lay direction choices', () => {
    const result = sanityImageCommandSchema.safeParse({
      commandId: 'prepare-2', requestId: 'request-2', sanityProjectId: 'project', sanityDataset: 'production', sanityDocumentId: 'product-1', requestKey: 'request-key', totalRuns: 1, phase: 'prepare', requestedAt: '2026-08-31T12:00:00.000Z',
      product: { name: 'Oak', productType: 'engineered-wood' },
      variants: [{ variantId: 'v1', colourName: 'Oak', swatchUrl: 'https://cdn.sanity.io/swatch.png' }],
      rooms: ['bedroom'], layDirection: 'quarter-turn',
      design: { selectionKey: 'design-1', furnitureStyle: 'boconcept', interiorFashion: 'contemporary', statementTone: 'balanced', lighting: 'afternoon', pipeline: 'direct', generationProfile: 'flux-roomshot-v1', presetId: 'preset-1', presetKey: 'key', presetTitle: 'Title', presetVersion: 1 }
    })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues.some((issue) => issue.path.join('.') === 'layDirection')).toBe(true)
  })

  it('rejects duplicate generation run IDs and insecure swatch URLs', () => {
    const result = sanityImageCommandSchema.safeParse({
      ...basePrepareCommand,
      commandId: 'request-1:generate',
      phase: 'generate',
      runs: [
        { runId: 'run-1', variantId: 'v1', room: 'bedroom', pipeline: 'direct', generationProfile: 'flux-roomshot-v1', finalPrompt: 'Prompt', swatchUrl: 'http://example.com/swatch.png' },
        { runId: 'run-1', variantId: 'v1', room: 'hallway', pipeline: 'direct', generationProfile: 'flux-roomshot-v1', finalPrompt: 'Prompt' }
      ]
    })
    expect(result.success).toBe(false)
  })

  it('blocks patterned Kontext runs without physical repeat metadata', () => {
    const result = sanityImageCommandSchema.safeParse({
      ...basePrepareCommand,
      commandId: 'request-1:generate',
      phase: 'generate',
      runs: [{
        runId: 'run-1',
        variantId: 'v1',
        room: 'bedroom',
        pipeline: 'patterned-kontext',
        generationProfile: 'flux-kontext-pattern-v1',
        finalPrompt: 'Plain floor base room',
        swatchUrl: 'https://cdn.sanity.io/swatch.png'
      }]
    })
    expect(result.success).toBe(false)
  })

  it('exposes none in the inferred prepare command type', () => {
    const parsed: SanityImagePrepareCommand = sanityImagePrepareCommandSchema.parse({
      ...basePrepareCommand,
      design: {
        ...basePrepareCommand.design,
        statementTone: 'none'
      }
    })

    expect(parsed.design.statementTone).toBe('none')
  })
})