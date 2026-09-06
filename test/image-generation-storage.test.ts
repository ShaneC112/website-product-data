import { describe, expect, it } from 'vitest'
import {
  imageGenerationArtifactLedgerSchema,
  imageGenerationDispatchIntentSchema,
  imageGenerationOrchestrationLedgerSchema,
  imageGenerationRunSnapshotSchema,
  upcastImageGenerationOrchestrationLedger
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