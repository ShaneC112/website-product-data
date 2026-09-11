import { describe, expect, it } from 'vitest'
import {
  fluxPromptEventNameSchema,
  fluxPromptStageSchema,
  fluxPromptTraceEnvelopeSchema,
  promptContractComparisonSchema,
  createFluxPromptTraceEventId
  ,createFluxPromptAssemblySectionEventId
} from '../src/image-generation/observability/index.js'

describe('flux prompt trace contract', () => {
  it('accepts valid flux stage events and derives event ids', () => {
    const stage = fluxPromptStageSchema.parse('room')
    const event = fluxPromptEventNameSchema.parse('ai-vision:user-prompt')
    const eventId = createFluxPromptTraceEventId(stage, event)

    expect(stage).toBe('room')
    expect(event).toBe('ai-vision:user-prompt')
    expect(eventId).toBe('flux:room:ai-vision:user-prompt')

    const parsed = fluxPromptTraceEnvelopeSchema.parse({
      schemaVersion: 1,
      contractVersion: 2,
      variant: 'current',
      module: 'flux:room',
      event: 'ai-vision:user-prompt',
      eventId,
      producerKind: 'vision',
      sourceEventIds: [],
      content: {
        userPrompt: 'Describe the room composition.'
      },
      metadata: {
        fixtureId: 'fixture-1'
      }
    })

    expect(parsed.content).toMatchObject({ userPrompt: 'Describe the room composition.' })
  })

  it('rejects invalid versioning and disallowed module payloads', () => {
    expect(promptContractComparisonSchema.safeParse({
      currentVersion: 2,
      candidateVersion: 4,
      changedProducers: ['flux:scene:ai-vision:user-prompt'],
      expectedAffected: ['flux:assembly:assembled-prompt']
    }).success).toBe(false)

    expect(fluxPromptTraceEnvelopeSchema.safeParse({
      schemaVersion: 1,
      contractVersion: 2,
      variant: 'candidate',
      module: 'image-generation-v2:room',
      event: 'input',
      eventId: 'flux:room:input',
      producerKind: 'deterministic',
      sourceEventIds: [],
      content: {
        input: { roomKey: 'bedroom' }
      }
    }).success).toBe(false)
  })

  it('rejects nested secrets, signed URLs, and image data URLs', () => {
    const base = {
      schemaVersion: 1,
      contractVersion: 2,
      variant: 'current' as const,
      module: 'flux:room',
      event: 'input' as const,
      eventId: 'flux:room:input',
      producerKind: 'vision' as const,
      sourceEventIds: []
    }

    expect(fluxPromptTraceEnvelopeSchema.safeParse({...base, content: {input: {headers: {authorization: 'Bearer secret'}}}}).success).toBe(false)
    expect(fluxPromptTraceEnvelopeSchema.safeParse({...base, content: {input: {imageUrl: 'https://example.test/image.png?sig=secret'}}}).success).toBe(false)
    expect(fluxPromptTraceEnvelopeSchema.safeParse({...base, content: {input: {imageData: 'data:image/png;base64,AAAA'}}}).success).toBe(false)
  })

  it('accepts stable assembly section event ids', () => {
    const eventId = createFluxPromptAssemblySectionEventId('scene')
    expect(eventId).toBe('flux:assembly:assembly-section#scene')
    expect(fluxPromptTraceEnvelopeSchema.parse({
      schemaVersion: 1,
      contractVersion: 1,
      variant: 'current',
      module: 'flux:assembly',
      event: 'assembly-section',
      eventId,
      producerKind: 'assembly',
      sourceEventIds: ['flux:scene:rendered-contribution'],
      content: {renderedContribution: 'Scene contribution'}
    }).eventId).toBe(eventId)
  })
})
