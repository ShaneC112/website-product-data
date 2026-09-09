import { describe, expect, it } from 'vitest'
import {
  IMAGE_GENERATION_WORKFLOW,
  imageGenerationQueueEnvelopeSchema,
  imageGenerationStatusSchema,
  imageGenerationWorkflowSchema,
  upcastImageGenerationQueueEnvelope
} from '../src/image-generation/index.js'

describe('imageGenerationWorkflowSchema', () => {
  it('accepts the initial workflow registry', () => {
    const parsed = imageGenerationWorkflowSchema.parse(IMAGE_GENERATION_WORKFLOW)
    expect(parsed).toHaveLength(13)
  })

  it('registers room as an active generate dependency', () => {
    const room = IMAGE_GENERATION_WORKFLOW.find((entry) => entry.workKind === 'generate.room')
    expect(room).toEqual({ step: 'generate', workKind: 'generate.room', lifecycle: 'active' })
  })

  it('keeps pattern review work in the generate step and disabled refinement branches', () => {
    const pattern = IMAGE_GENERATION_WORKFLOW.find((entry) => entry.workKind === 'generate.pattern')
    const refinement = IMAGE_GENERATION_WORKFLOW.find((entry) => entry.workKind === 'render.pattern-refinement')
    expect(pattern?.lifecycle).toBe('active')
    expect(refinement?.lifecycle).toBe('disabled-for-new-runs')
  })
})

describe('imageGenerationQueueEnvelopeSchema', () => {
  it('accepts a minimal queue envelope', () => {
    const parsed = imageGenerationQueueEnvelopeSchema.parse({
      schemaVersion: 1,
      requestId: 'request-1',
      runId: 'run-1',
      runEpoch: 0,
      step: 'generate',
      workKind: 'generate.texture',
      workKey: 'texture:product-1',
      dispatchToken: 'dispatch-1'
    })

    expect(parsed.step).toBe('generate')
  })

  it('rejects unknown keys', () => {
    const result = imageGenerationQueueEnvelopeSchema.safeParse({
      schemaVersion: 1,
      requestId: 'request-1',
      runId: 'run-1',
      runEpoch: 0,
      step: 'generate',
      workKind: 'generate.texture',
      workKey: 'texture:product-1',
      dispatchToken: 'dispatch-1',
      prompt: 'not allowed'
    })

    expect(result.success).toBe(false)
  })
})

describe('imageGenerationStatusSchema', () => {
  it('accepts accepted, resolved, and terminal phases', () => {
    expect(imageGenerationStatusSchema.parse({ phase: 'accepted', requestId: 'request-1' }).phase).toBe('accepted')
    expect(imageGenerationStatusSchema.parse({
      phase: 'resolved',
      requestId: 'request-1',
      runId: 'run-1',
      lifecycle: { currentStep: 'generate', currentWorkKind: 'generate.pattern', warningCodes: [] },
      warningCodes: ['warning-1']
    }).phase).toBe('resolved')
    expect(imageGenerationStatusSchema.parse({
      phase: 'terminal',
      requestId: 'request-1',
      runId: 'run-1',
      outcome: 'failed',
      lifecycle: { currentStep: 'generate', currentWorkKind: 'generate.pattern', warningCodes: [] },
      promptContributions: [{ key: 'pattern', applied: false, origin: 'not-reached' }],
      media: {
        mediaId: 'image-gen-v2.run-1.variant-1',
        attachmentCommitToken: 'attach:request-1:provider-op-1',
        providerOperationId: 'provider-op-1',
        productId: 'product-1',
        variantId: 'variant-1',
        attachmentState: 'attached'
      },
      recovery: { disposition: 'validate-artifact', reasonCode: 'review-required' }
    }).phase).toBe('terminal')
  })
})

describe('upcastImageGenerationQueueEnvelope', () => {
  it('quarantines unsupported schema versions', () => {
    expect(upcastImageGenerationQueueEnvelope({ schemaVersion: 2 })).toEqual({
      status: 'quarantined',
      reason: 'unsupported-schema-version:2'
    })
  })
})