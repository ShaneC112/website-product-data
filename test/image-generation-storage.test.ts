import { describe, expect, it } from 'vitest'
import {
  buildImageGenerationRunContentRowKey,
  imageGenerationArtifactLedgerSchema,
  imageGenerationDispatchIntentSchema,
  imageGenerationOrchestrationLedgerSchema,
  imageGenerationRunContentClaimSchema,
  imageGenerationRunContentRowSchema,
  imageGenerationRunSnapshotSchema,
  promptCacheValueSchema,
  upcastImageGenerationOrchestrationLedger,
  upcastImageGenerationRunContentClaim,
  upcastImageGenerationRunContentRow
} from '../src/image-generation/index.js'

describe('imageGenerationOrchestrationLedgerSchema', () => {
  it('accepts a valid orchestration row', () => {
    const parsed = imageGenerationOrchestrationLedgerSchema.parse({
      schemaVersion: 1,
      partitionKey: 'request-1',
      rowKey: 'run-1:generate.texture:texture:product-1',
      requestId: 'request-1',
      runId: 'run-1',
      runEpoch: 0,
      step: 'generate',
      workKind: 'generate.texture',
      workKey: 'texture:product-1',
      state: 'running',
      recoveryDisposition: 'retryable',
      updatedAt: '2026-09-06T00:00:00.000Z'
    })

    expect(parsed.attempt).toBe(0)
  })
})

describe('imageGenerationDispatchIntentSchema', () => {
  it('accepts a valid dispatch intent row', () => {
    const parsed = imageGenerationDispatchIntentSchema.parse({
      schemaVersion: 1,
      partitionKey: 'request-1',
      rowKey: '_dispatch:run-1:generate.texture:texture:product-1',
      requestId: 'request-1',
      runId: 'run-1',
      runEpoch: 0,
      queueName: 'sanity-image-generate-v2',
      payloadJson: '{"schemaVersion":1}',
      state: 'pending_outbound',
      createdAt: '2026-09-06T00:00:00.000Z',
      updatedAt: '2026-09-06T00:00:00.000Z'
    })

    expect(parsed.state).toBe('pending_outbound')
  })
})

describe('imageGenerationArtifactLedgerSchema', () => {
  it('accepts a review-required pattern artifact', () => {
    const parsed = imageGenerationArtifactLedgerSchema.parse({
      schemaVersion: 1,
      partitionKey: 'template-1',
      rowKey: 'pattern:fingerprint-1',
      artifactKind: 'pattern',
      ownerScopeKey: 'template-1',
      fingerprint: 'fingerprint-1',
      state: 'review-required',
      updatedAt: '2026-09-06T00:00:00.000Z'
    })

    expect(parsed.state).toBe('review-required')
  })
})

describe('durable row upcasts', () => {
  it('quarantines unsupported durable row versions', () => {
    expect(upcastImageGenerationOrchestrationLedger({schemaVersion: 2})).toEqual({
      status: 'quarantined',
      reason: 'unsupported-schema-version:2'
    })
  })
})

describe('imageGenerationRunContentRowSchema', () => {
  it('accepts a valid run-content row', () => {
    const parsed = imageGenerationRunContentRowSchema.parse({
      schemaVersion: 1,
      partitionKey: 'request-1',
      rowKey: 'run:run-1:epoch:0:content:texture',
      requestId: 'request-1',
      runId: 'run-1',
      runEpoch: 0,
      featureType: 'texture',
      payloadFingerprint: 'fingerprint-1',
      payloadJson: '{"type":"texture"}',
      capturedAt: '2026-09-08T00:00:00.000Z'
    })

    expect(parsed.featureType).toBe('texture')
  })

  it('rejects extra fields', () => {
    expect(() => imageGenerationRunContentRowSchema.parse({
      schemaVersion: 1,
      partitionKey: 'request-1',
      rowKey: 'run:run-1:epoch:0:content:texture',
      requestId: 'request-1',
      runId: 'run-1',
      runEpoch: 0,
      featureType: 'texture',
      payloadFingerprint: 'fingerprint-1',
      payloadJson: '{"type":"texture"}',
      capturedAt: '2026-09-08T00:00:00.000Z',
      extra: true
    })).toThrow()
  })

  it('round-trips the row key convention', () => {
    expect(buildImageGenerationRunContentRowKey('run-1', 0, 'texture')).toBe('run:run-1:epoch:0:content:texture')
  })

  it('quarantines unsupported versions', () => {
    expect(upcastImageGenerationRunContentRow({ schemaVersion: 2 })).toEqual({
      status: 'quarantined',
      reason: 'unsupported-schema-version:2'
    })
  })
})

describe('imageGenerationRunContentClaimSchema', () => {
  it('accepts a valid run-content claim', () => {
    const parsed = imageGenerationRunContentClaimSchema.parse({
      schemaVersion: 1,
      partitionKey: 'request-1',
      rowKey: 'run:run-1:epoch:0:content:texture:claim',
      requestId: 'request-1',
      runId: 'run-1',
      runEpoch: 0,
      featureType: 'texture',
      leaseOwner: 'worker-1',
      leaseToken: 'lease-1',
      expiresAt: '2026-09-08T00:05:00.000Z'
    })

    expect(parsed.leaseOwner).toBe('worker-1')
  })

  it('rejects missing required fields', () => {
    expect(() => imageGenerationRunContentClaimSchema.parse({
      schemaVersion: 1,
      partitionKey: 'request-1',
      rowKey: 'run:run-1:epoch:0:content:texture:claim',
      requestId: 'request-1',
      runId: 'run-1',
      runEpoch: 0,
      featureType: 'texture',
      leaseOwner: 'worker-1',
      expiresAt: '2026-09-08T00:05:00.000Z'
    })).toThrow()
  })

  it('quarantines unsupported versions', () => {
    expect(upcastImageGenerationRunContentClaim({ schemaVersion: 2 })).toEqual({
      status: 'quarantined',
      reason: 'unsupported-schema-version:2'
    })
  })
})

describe('promptCacheValueSchema', () => {
  it('accepts a completed texture cache value', () => {
    const parsed = promptCacheValueSchema.parse({
      type: 'texture',
      schemaVersion: 1,
      value: {
        kind: 'completed',
        mode: 'generated-vision-prompt',
        texturePrompt: 'Synthetic texture prompt placeholder that is long enough to satisfy validation.',
        sourceFingerprint: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        evidence: {
          templateId: 'template-1',
          imageAssetCount: 1
        }
      }
    })

    expect(parsed.type).toBe('texture')
  })

  it('accepts a non-completed texture cache value without placeholder fields', () => {
    const parsed = promptCacheValueSchema.parse({
      type: 'texture',
      schemaVersion: 1,
      value: {
        kind: 'blocked',
        mode: 'invalid-evidence',
        reasonCode: 'texture-evidence-insufficient'
      }
    })

    expect(parsed.value).toEqual({
      kind: 'blocked',
      mode: 'invalid-evidence',
      reasonCode: 'texture-evidence-insufficient'
    })
  })
})

describe('imageGenerationRunSnapshotSchema', () => {
  it('accepts a run snapshot with contribution plan', () => {
    const parsed = imageGenerationRunSnapshotSchema.parse({
      schemaVersion: 1,
      requestId: 'request-1',
      runId: 'run-1',
      runEpoch: 0,
      workflowVersion: 1,
      childRegistryVersion: 1,
      contributionPlan: {
        schemaVersion: 1,
        items: [{ key: 'texture', applied: false, origin: 'not-reached' }]
      }
    })

    expect(parsed.contributionPlan.items[0]?.origin).toBe('not-reached')
  })
})