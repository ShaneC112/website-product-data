import { describe, expect, it } from 'vitest'
import {
  buildImageGenerationRunContentRowKey,
  buildColourDesignVariantKey,
  colourDesignArtifactSchema,
  computeColourDesignFingerprint,
  cameraAngleSourceRowSchema,
  cameraPolicySchema,
  imageGenerationArtifactLedgerSchema,
  imageGenerationDispatchIntentSchema,
  imageGenerationOrchestrationLedgerSchema,
  imageGenerationRunContentClaimSchema,
  imageGenerationRunContentRowSchema,
  imageGenerationRunSnapshotSchema,
  promptCacheValueSchema,
  normalizedColourDesignSchema,
  upcastImageGenerationOrchestrationLedger,
  upcastImageGenerationRunContentClaim,
  upcastImageGenerationRunContentRow,
  brandIdentityFingerprint,
  brandIdentitySchema
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
  it('accepts the approved deterministic colour/design content and artifact contracts', () => {
    const fingerprint = computeColourDesignFingerprint({
      documentKey: 'product-doc-1',
      variantKey: 'variant-key-1',
      templateId: 'template-1',
      templateRevision: 'rev-1',
      colourName: 'Cloud',
      colourHex: '#AABBCC',
      fashion: 'soft-contemporary',
      tone: 'balanced',
      furnitureTier: 'high',
      lighting: 'bright-even-daylight'
    })
    const value = {
      version: 1 as const,
      documentKey: 'product-doc-1',
      variantKey: 'variant-key-1',
      colourName: 'Cloud',
      colourHex: '#AABBCC',
      fashion: 'soft-contemporary',
      tone: 'balanced',
      furnitureTier: 'high',
      lighting: 'bright-even-daylight',
      semanticFingerprint: fingerprint
    }

    expect(normalizedColourDesignSchema.parse(value)).toEqual(value)
    expect(promptCacheValueSchema.parse({type: 'colour-design', schemaVersion: 1, value}).type).toBe('colour-design')
    expect(colourDesignArtifactSchema.parse({
      artifactVersion: 1,
      artifactKind: 'colour-design',
      scope: {documentKey: 'product-doc-1', variantKey: 'variant-key-1'},
      value
    }).scope).toEqual({documentKey: 'product-doc-1', variantKey: 'variant-key-1'})
    expect(buildColourDesignVariantKey('product-doc-1', 'variant-key-1')).toBe('variant:product-doc-1:variant-key-1')
  })

  it('rejects colour/design identity or artifact version drift', () => {
    const valid = {
      version: 1,
      documentKey: 'product-doc-1',
      variantKey: 'variant-key-1',
      colourName: 'Cloud',
      fashion: 'soft-contemporary',
      tone: 'balanced',
      furnitureTier: 'high',
      lighting: 'bright-even-daylight',
      semanticFingerprint: 'a'.repeat(64)
    }

    expect(() => normalizedColourDesignSchema.parse({...valid, version: 2})).toThrow()
    expect(() => normalizedColourDesignSchema.parse({...valid, documentKey: ''})).toThrow()
    expect(() => colourDesignArtifactSchema.parse({artifactVersion: 2, artifactKind: 'colour-design', scope: {documentKey: 'product-doc-1', variantKey: 'variant-key-1'}, value: valid})).toThrow()
  })

  it('accepts the approved camera policy and source row', () => {
    const sourceRow = {
      room: 'bedroom',
      productType: 'carpet',
      cameraHeightMeters: [1.2, 1.4],
      lensMmFullFrame: [40, 50],
      pitch: 'slight-down',
      targetFloorSharePercent: [40, 55],
      cropSafeFloorMinimumPercent: 33,
      stairsVisibleModifier: false
    }

    expect(cameraAngleSourceRowSchema.parse(sourceRow)).toEqual(sourceRow)
    expect(cameraPolicySchema.parse({version: 1, ...sourceRow})).toEqual({version: 1, ...sourceRow})
    expect(buildImageGenerationRunContentRowKey('run-1', 0, 'camera')).toBe('run:run-1:epoch:0:content:camera')
  })

  it('accepts a camera cache value without changing existing members', () => {
    const parsed = promptCacheValueSchema.parse({
      type: 'camera',
      schemaVersion: 1,
      value: {
        version: 1,
        room: 'bedroom',
        productType: 'carpet',
        cameraHeightMeters: [1.2, 1.4],
        lensMmFullFrame: [40, 50],
        pitch: 'slight-down',
        targetFloorSharePercent: [40, 55],
        cropSafeFloorMinimumPercent: 33
      }
    })

    expect(parsed.type).toBe('camera')
  })

  it('rejects invalid camera versions, rooms, and range ordering', () => {
    const valid = {
      version: 1,
      room: 'bedroom',
      productType: 'carpet',
      cameraHeightMeters: [1.2, 1.4],
      lensMmFullFrame: [40, 50],
      pitch: 'slight-down',
      targetFloorSharePercent: [40, 55],
      cropSafeFloorMinimumPercent: 33
    }

    expect(() => cameraPolicySchema.parse({...valid, version: 2})).toThrow()
    expect(() => cameraPolicySchema.parse({...valid, room: 'not-a-room'})).toThrow()
    expect(() => cameraPolicySchema.parse({...valid, cameraHeightMeters: [1.4, 1.2]})).toThrow()
    expect(() => cameraPolicySchema.parse({...valid, lensMmFullFrame: [50, 40]})).toThrow()
    expect(() => cameraPolicySchema.parse({...valid, targetFloorSharePercent: [55, 40]})).toThrow()
    expect(() => cameraPolicySchema.parse({...valid, cropSafeFloorMinimumPercent: 32})).toThrow()
  })

  it('accepts and normalizes the approved brand identity contract', () => {
    const parsed = brandIdentitySchema.parse({
      version: 1,
      visualGuidance: '  Grounded   Irish   home styling. ',
      brandGuidance: '  Keep   the   prompt coherent. '
    })

    expect(parsed).toEqual({
      version: 1,
      visualGuidance: 'Grounded Irish home styling.',
      brandGuidance: 'Keep the prompt coherent.'
    })
    expect(brandIdentityFingerprint(parsed)).toHaveLength(64)
  })

  it('accepts a brand identity cache value and feature type', () => {
    const parsed = promptCacheValueSchema.parse({
      type: 'brand-identity',
      schemaVersion: 1,
      value: {
        version: 1,
        visualGuidance: 'Grounded Irish home styling.',
        brandGuidance: 'Keep the prompt coherent.'
      }
    })

    expect(parsed.type).toBe('brand-identity')
    expect(buildImageGenerationRunContentRowKey('run-1', 0, 'brand-identity')).toBe('run:run-1:epoch:0:content:brand-identity')
  })

  it('rejects missing or overlong brand identity guidance', () => {
    expect(() => brandIdentitySchema.parse({
      version: 1,
      visualGuidance: '',
      brandGuidance: 'Valid guidance.'
    })).toThrow()

    expect(() => brandIdentitySchema.parse({
      version: 1,
      visualGuidance: 'a'.repeat(281),
      brandGuidance: 'Valid guidance.'
    })).toThrow()

    expect(() => brandIdentitySchema.parse({
      version: 1,
      visualGuidance: 'Valid guidance.',
      brandGuidance: 'a'.repeat(221)
    })).toThrow()
  })

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