import { describe, expect, it } from 'vitest'
import {
  buildImageGenerationRequestDuplicateControl,
  buildImageGenerationRequestPolicySnapshot,
  buildImageGenerationRequestRefreshPolicyControl,
  buildImageGenerationTemplateRebindAuditEntry,
  buildImageGenerationTemplateResetAuditEntry,
  buildImageGenerationPatternValidateControl,
  buildImageGenerationTemplateRebindControl,
  buildImageGenerationTemplateDeleteControl,
  buildImageGenerationTemplateResetControl,
  diffImageGenerationRequestPolicySnapshot,
  hashImageGenerationRequestPolicySnapshot,
  imageGenerationGuardedControlRequestSchema,
  imageGenerationGuardedControlResultSchema,
  aiImageGenerationControlIntentSchema,
  imageGenerationSanitySubmissionSchema,
  imageGenerationTemplateAuditEntrySchema,
  imageGenerationTemplateResetControlSchema,
  aiImageGenerationRequestSchema,
  aiImageGenerationRequestCurrentRunSchema,
  evaluateImageGenerationTemplateReadiness,
  aiImageGenerationRequestPolicySnapshotSchema,
  aiImageGenerationRunSchema,
  aiImageGenerationTemplateSchema,
  aiTemplateEvidenceImageSchema,
  imageGenerationTemplateBindingSchema
} from '../src/image-generation/index.js'
import { toPortableImageGenerationTemplate } from '../src/image-generation/sanity/control-template.js'

describe('aiTemplateEvidenceImageSchema', () => {
  it('accepts template-owned evidence images with optional role-scoped uses', () => {
    const parsed = aiTemplateEvidenceImageSchema.parse({
      _type: 'image',
      _key: 'image-1',
      asset: { _type: 'reference', _ref: 'image-abc123-1000x1000-png' },
      templateUses: [{ templateType: 'texture', targetVariantIds: ['variant-1'] }]
    })

    expect(parsed.templateUses?.[0]?.templateType).toBe('texture')
  })

  it('accepts Sanity aiTemplateEvidenceImage type and templateUses with _key and _type', () => {
    const parsed = aiTemplateEvidenceImageSchema.parse({
      _type: 'aiTemplateEvidenceImage',
      _key: 'image-2',
      asset: { _type: 'reference', _ref: 'image-def456-1000x1000-png', _weak: true },
      templateUses: [{ _key: 'use-1', _type: 'templateUse', templateType: 'texture', targetVariantIds: ['variant-1'] }]
    })

    expect(parsed._type).toBe('aiTemplateEvidenceImage')
    expect(parsed.templateUses?.[0]?._key).toBe('use-1')
    expect(parsed.templateUses?.[0]?._type).toBe('templateUse')
  })
})

describe('aiImageGenerationTemplateSchema', () => {
  it('accepts a template with weak product reference and v2-owned evidenceImages', () => {
    const parsed = aiImageGenerationTemplateSchema.parse({
      _id: 'template-1',
      _type: 'aiImageGenerationTemplate',
      title: 'Bedroom inspiration',
      product: { _type: 'reference', _ref: 'product-1', _weak: true },
      evidenceImages: [{
        _type: 'image',
        _key: 'image-1',
        asset: { _type: 'reference', _ref: 'image-abc123-1000x1000-png' }
      }],
      audit: [buildImageGenerationTemplateResetAuditEntry({
        auditId: 'audit-1',
        operation: 'template.reset',
        recordedAt: '2026-09-06T00:00:00.000Z',
        templateRevision: 'rev-1',
        targetRunId: 'run-1',
        targetRunEpoch: 2,
        clearedFields: ['texturePrompt', 'colourDesignPrompts', 'roomPrompts']
      })],
      binding: imageGenerationTemplateBindingSchema.parse({
        productId: 'product-1',
        productType: 'carpet',
        categoryKey: 'carpets',
        variantBindings: [{ variantKey: 'variant-key-1', colourName: 'Cloud', patternClassification: 'unknown' }]
      })
    })

    expect(parsed.evidenceImages).toHaveLength(1)
    expect(parsed.audit).toHaveLength(1)
  })

  it('rejects reset audit entries with only one target run guard field present', () => {
    expect(() => imageGenerationTemplateAuditEntrySchema.parse({
      auditId: 'audit-2',
      operation: 'template.reset',
      recordedAt: '2026-09-06T00:00:00.000Z',
      targetRunId: 'run-1',
      clearedFields: ['texturePrompt']
    })).toThrow(/targetRunId and targetRunEpoch/)
  })

  it('rejects rebind audit entries without rebound cache fields', () => {
    expect(() => buildImageGenerationTemplateRebindAuditEntry({
      auditId: 'audit-3',
      operation: 'template.rebind',
      recordedAt: '2026-09-06T00:00:00.000Z',
      nextProductId: 'product-2',
      nextVariantIds: ['variant-2'],
      reboundFields: []
    })).toThrow(/at least 1 element/)
  })

  it('rejects multiple colour/design prompts for one variant even when fingerprints differ', () => {
    expect(() => aiImageGenerationTemplateSchema.parse({
      _id: 'template-2',
      _type: 'aiImageGenerationTemplate',
      title: 'Bedroom inspiration',
      product: {_type: 'reference', _ref: 'product-1'},
      colourDesignPrompts: [
        {variantKey: 'variant-1', templateRevision: 'revision-1', fingerprint: 'fingerprint-1', prompt: 'First prompt', schemaVersion: 1, generatedAt: '2026-09-06T00:00:00.000Z'},
        {variantKey: 'variant-1', templateRevision: 'revision-1', fingerprint: 'fingerprint-2', prompt: 'Second prompt', schemaVersion: 1, generatedAt: '2026-09-06T00:00:00.000Z'}
      ]
    })).toThrow(/duplicate cache entry/)
  })

  it('rejects multiple room prompts for one room even when fingerprints differ', () => {
    expect(() => aiImageGenerationTemplateSchema.parse({
      _id: 'template-3',
      _type: 'aiImageGenerationTemplate',
      title: 'Bedroom inspiration',
      product: {_type: 'reference', _ref: 'product-1'},
      roomPrompts: [
        {roomKey: 'bedroom', templateRevision: 'revision-1', fingerprint: 'fingerprint-1', prompt: 'First prompt', schemaVersion: 1, generatedAt: '2026-09-06T00:00:00.000Z'},
        {roomKey: 'bedroom', templateRevision: 'revision-1', fingerprint: 'fingerprint-2', prompt: 'Second prompt', schemaVersion: 1, generatedAt: '2026-09-06T00:00:00.000Z'}
      ]
    })).toThrow(/duplicate cache entry/)
  })

  it('accepts Sanity array keys on persisted colour/design palette entries', () => {
    const parsed = aiImageGenerationTemplateSchema.parse({
      _id: 'template-palette',
      _type: 'aiImageGenerationTemplate',
      title: 'Palette template',
      product: {_type: 'reference', _ref: 'product-1'},
      colourDesignPrompts: [{
        _key: 'colour-design-1',
        variantKey: 'variant-1',
        templateRevision: 'revision-1',
        fingerprint: 'fingerprint-1',
        swatchFingerprint: 'sanity-asset:image-swatch-1',
        palette: [
          {_key: 'palette-1', hex: '#AABBCC', coveragePercent: 70},
          {_key: 'palette-2', hex: '#99AABB', coveragePercent: 30},
        ],
        prompt: 'Palette-aware colour design prompt',
        schemaVersion: 1,
        generatedAt: '2026-09-09T00:00:00.000Z',
      }],
    })

    expect(parsed.colourDesignPrompts[0]?.palette).toHaveLength(2)
  })
})

describe('colour/design palette cache contract', () => {
  it('accepts a bounded swatch-derived palette and invalidates the prior fingerprint shape', async () => {
    const {computeColourDesignFingerprint, normalizedColourDesignSchema} = await import('../src/image-generation/cache/colour-design.schema.js')
    const base = {
      documentKey: 'product-1',
      variantKey: 'variant-1',
      templateRevision: 'revision-1',
      colourName: 'Cloud',
      colourHex: '#aabbcc',
      fashion: 'soft-contemporary',
      tone: 'balanced',
      furnitureTier: 'high',
      lighting: 'bright-even-daylight',
    }
    const fingerprintContext = {templateId: 'template-1', templateRevision: 'revision-1'}
    const palette = [{_key: 'palette-1', hex: '#AABBCC', coveragePercent: 70}, {_key: 'palette-2', hex: '#99AABB', coveragePercent: 30}]

    expect(normalizedColourDesignSchema.parse({
      version: 1,
      ...base,
      swatchFingerprint: 'image-abc123-100x100-png',
      palette,
      semanticFingerprint: 'a'.repeat(64),
    }).palette).toEqual(palette)
    expect(computeColourDesignFingerprint({...base, ...fingerprintContext, swatchFingerprint: 'image-abc123-100x100-png', palette}))
      .toBe(computeColourDesignFingerprint({...base, ...fingerprintContext, swatchFingerprint: 'image-abc123-100x100-png', palette: [{hex: '#112233', coveragePercent: 100}]}))
    expect(computeColourDesignFingerprint({...base, ...fingerprintContext, swatchFingerprint: 'image-abc123-100x100-png'}))
      .not.toBe(computeColourDesignFingerprint({...base, ...fingerprintContext, templateRevision: 'revision-2', swatchFingerprint: 'image-abc123-100x100-png'}))
    expect(computeColourDesignFingerprint({...base, ...fingerprintContext, swatchFingerprint: 'image-abc123-100x100-png'}))
      .not.toBe(computeColourDesignFingerprint({...base, ...fingerprintContext}))
  })

  it('rejects palette coverage that does not total 100 percent', async () => {
    const {normalizedColourDesignSchema} = await import('../src/image-generation/cache/colour-design.schema.js')

    expect(() => normalizedColourDesignSchema.parse({
      version: 1,
      documentKey: 'product-1',
      variantKey: 'variant-1',
      templateRevision: 'revision-1',
      colourName: 'Cloud',
      colourHex: '#aabbcc',
      palette: [{hex: '#AABBCC', coveragePercent: 60}, {hex: '#99AABB', coveragePercent: 30}],
      fashion: 'soft-contemporary',
      tone: 'balanced',
      furnitureTier: 'high',
      lighting: 'bright-even-daylight',
      semanticFingerprint: 'a'.repeat(64),
    })).toThrow(/Palette coverage percentages must total 100/)
  })
})

describe('request and run schemas', () => {
  it('accepts a request document without currentRun', () => {
    const parsed = aiImageGenerationRequestSchema.parse({
      _id: 'request-1',
      _type: 'aiImageGenerationRequest',
      requestId: 'request-1',
      submissionId: 'request-1',
      submissionState: 'pending',
      templateId: 'template-1',
      variantKey: 'variant-key-1',
      room: 'bedroom',
      aspectRatio: '3:2',
      creativeDirection: {
        fashion: 'soft-contemporary',
        tone: 'balanced',
        furnitureTier: 'high',
        lighting: 'bright-even-daylight',
        version: 1
      },
      currentPolicy: {
        room: 'bedroom',
        aspectRatio: '3:2',
        creativeDirection: {
          fashion: 'soft-contemporary',
          tone: 'balanced',
          furnitureTier: 'high',
          lighting: 'bright-even-daylight',
          version: 1
        },
        policyHash: 'policy-hash-1',
        capturedAt: '2026-09-06T00:00:00.000Z'
      },
      requestedAt: '2026-09-06T00:00:00.000Z'
    })

    expect(parsed.room).toBe('bedroom')
    expect(parsed.currentRun).toBeUndefined()
  })

  it('accepts a request document with a valid currentRun snapshot', () => {
    const parsed = aiImageGenerationRequestSchema.parse({
      _id: 'request-1',
      _type: 'aiImageGenerationRequest',
      requestId: 'request-1',
      submissionId: 'request-1',
      submissionState: 'accepted',
      submissionOutcome: { outcome: 'accepted', recordedAt: '2026-09-06T00:00:00.000Z' },
      templateId: 'template-1',
      variantKey: 'variant-key-1',
      room: 'bedroom',
      aspectRatio: '3:2',
      creativeDirection: {
        fashion: 'soft-contemporary',
        tone: 'balanced',
        furnitureTier: 'high',
        lighting: 'bright-even-daylight',
        version: 1
      },
      currentPolicy: {
        room: 'bedroom',
        aspectRatio: '3:2',
        creativeDirection: {
          fashion: 'soft-contemporary',
          tone: 'balanced',
          furnitureTier: 'high',
          lighting: 'bright-even-daylight',
          version: 1
        },
        policyHash: 'policy-hash-1',
        capturedAt: '2026-09-06T00:00:00.000Z'
      },
      currentRun: {
        runId: 'run-42',
        runEpoch: 3,
        recordedAt: '2026-09-06T00:00:00.000Z',
        promptContributions: [{ key: 'pattern', applied: true, origin: 'deterministic-policy', warningCode: 'pattern-review-required' }]
      },
      requestedAt: '2026-09-06T00:00:00.000Z'
    })

    expect(aiImageGenerationRequestCurrentRunSchema.parse(parsed.currentRun)).toMatchObject({ runId: 'run-42', runEpoch: 3 })
  })

  it('rejects a partially populated currentRun snapshot', () => {
    expect(() => aiImageGenerationRequestSchema.parse({
      _id: 'request-1',
      _type: 'aiImageGenerationRequest',
      requestId: 'request-1',
      submissionId: 'request-1',
      submissionState: 'pending',
      templateId: 'template-1',
      variantKey: 'variant-key-1',
      room: 'bedroom',
      aspectRatio: '3:2',
      creativeDirection: {
        fashion: 'soft-contemporary',
        tone: 'balanced',
        furnitureTier: 'high',
        lighting: 'bright-even-daylight',
        version: 1
      },
      currentPolicy: {
        room: 'bedroom',
        aspectRatio: '3:2',
        creativeDirection: {
          fashion: 'soft-contemporary',
          tone: 'balanced',
          furnitureTier: 'high',
          lighting: 'bright-even-daylight',
          version: 1
        },
        policyHash: 'policy-hash-1',
        capturedAt: '2026-09-06T00:00:00.000Z'
      },
      currentRun: {
        runId: 'run-42',
        runEpoch: 3
      },
      requestedAt: '2026-09-06T00:00:00.000Z'
    })).toThrow(/currentRun requires runId, runEpoch, and recordedAt together|recordedAt/)
  })

  it('accepts a Sanity-originated request enqueue submission', () => {
    const parsed = imageGenerationSanitySubmissionSchema.parse({
      schemaVersion: 1,
      submissionKind: 'request.enqueue',
      submissionId: 'request-1',
      documentId: 'request-1',
      requestId: 'request-1',
      requestedAt: '2026-09-06T00:00:00.000Z'
    })

    expect(parsed.submissionKind).toBe('request.enqueue')
  })

  it('accepts a product-local request enqueue submission', () => {
    const parsed = imageGenerationSanitySubmissionSchema.parse({
      schemaVersion: 1,
      submissionKind: 'product.request.enqueue',
      submissionId: 'request-1',
      documentId: 'product-1',
      productId: 'product-1',
      payloadKey: 'payload-1',
      requestId: 'request-1',
      requestedAt: '2026-09-06T00:00:00.000Z'
    })

    expect(parsed.submissionKind).toBe('product.request.enqueue')
  })

  it('accepts a Sanity-originated guarded control submission', () => {
    const parsed = imageGenerationSanitySubmissionSchema.parse({
      schemaVersion: 1,
      submissionKind: 'control.submit',
      submissionId: 'control-1',
      documentId: 'control-1',
      controlId: 'control-1',
      requestedAt: '2026-09-06T00:00:00.000Z'
    })

    expect(parsed.submissionKind).toBe('control.submit')
  })

  it('accepts a Sanity-originated template deletion submission', () => {
    const parsed = imageGenerationSanitySubmissionSchema.parse({
      schemaVersion: 1,
      submissionKind: 'template.delete',
      submissionId: 'template-1',
      documentId: 'template-1',
      templateId: 'template-1',
      requestedAt: '2026-09-06T00:00:00.000Z'
    })

    expect(parsed.submissionKind).toBe('template.delete')
  })

  it('rejects invalid Sanity-originated submission payload combinations', () => {
    expect(() => imageGenerationSanitySubmissionSchema.parse({
      schemaVersion: 1,
      submissionKind: 'control.submit',
      submissionId: 'control-1',
      documentId: 'different-control',
      controlId: 'control-1',
      requestedAt: '2026-09-06T00:00:00.000Z'
    })).toThrow()

    expect(() => imageGenerationSanitySubmissionSchema.parse({
      schemaVersion: 1,
      submissionKind: 'product.request.enqueue',
      submissionId: 'request-1',
      documentId: 'product-2',
      productId: 'product-1',
      payloadKey: 'payload-1',
      requestId: 'request-1',
      requestedAt: '2026-09-06T00:00:00.000Z'
    })).toThrow(/documentId must match productId/)
  })

  it('accepts a pending top-level control intent', () => {
    const control = buildImageGenerationRequestDuplicateControl({
      controlId: 'control-1',
      requestedAt: '2026-09-06T00:00:00.000Z',
      sourceRequestId: 'request-1',
      sourceRequestRevision: 'rev-1',
      templateId: 'template-1'
    })

    const parsed = aiImageGenerationControlIntentSchema.parse({
      _id: 'control-1',
      _type: 'aiImageGenerationControlIntent',
      controlId: 'control-1',
      submissionId: 'control-1',
      submissionState: 'pending',
      control,
      requestedAt: control.requestedAt
    })

    expect(parsed.control.operation).toBe('request.duplicate')
  })

  it('accepts a terminal control intent with its bounded guarded result', () => {
    const control = buildImageGenerationRequestDuplicateControl({
      controlId: 'control-1',
      requestedAt: '2026-09-06T00:00:00.000Z',
      sourceRequestId: 'request-1',
      sourceRequestRevision: 'rev-1',
      templateId: 'template-1'
    })

    expect(aiImageGenerationControlIntentSchema.parse({
      _id: 'control-1',
      _type: 'aiImageGenerationControlIntent',
      controlId: 'control-1',
      submissionId: 'control-1',
      submissionState: 'conflict',
      submissionOutcome: {
        outcome: 'conflict',
        recordedAt: '2026-09-06T00:01:00.000Z',
        reasonCode: 'conflict_revision'
      },
      result: {
        outcome: 'conflict_revision',
        controlId: 'control-1',
        currentRevision: 'rev-2'
      },
      control,
      requestedAt: control.requestedAt
    }).result?.outcome).toBe('conflict_revision')
  })

  it('rejects embedded mutable submission payloads', () => {
    expect(() => imageGenerationSanitySubmissionSchema.parse({
      schemaVersion: 1,
      submissionKind: 'request.enqueue',
      submissionId: 'request-1',
      documentId: 'request-1',
      requestId: 'request-1',
      requestedAt: '2026-09-06T00:00:00.000Z',
      request: { requestId: 'request-1' }
    })).toThrow()
  })

  it('accepts a request policy snapshot helper payload', () => {
    const parsed = aiImageGenerationRequestPolicySnapshotSchema.parse(buildImageGenerationRequestPolicySnapshot({
      room: 'bedroom',
      aspectRatio: '3:2',
      creativeDirection: {
        fashion: 'soft-contemporary',
        tone: 'balanced',
        furnitureTier: 'high',
        lighting: 'bright-even-daylight',
        version: 1
      },
      capturedAt: '2026-09-06T00:00:00.000Z'
    }))

    expect(parsed.policyHash).toHaveLength(64)
  })

  it('hashes equivalent policy inputs stably and ignores capture time', () => {
    const firstHash = hashImageGenerationRequestPolicySnapshot({
      room: 'bedroom',
      aspectRatio: '3:2',
      creativeDirection: {
        fashion: 'soft-contemporary',
        tone: 'balanced',
        furnitureTier: 'high',
        lighting: 'bright-even-daylight',
        version: 1
      }
    })

    const secondHash = buildImageGenerationRequestPolicySnapshot({
      room: 'bedroom',
      aspectRatio: '3:2',
      creativeDirection: {
        fashion: 'soft-contemporary',
        tone: 'balanced',
        furnitureTier: 'high',
        lighting: 'bright-even-daylight',
        version: 1
      },
      capturedAt: '2026-09-07T00:00:00.000Z'
    }).policyHash

    expect(firstHash).toBe(secondHash)
    expect(firstHash).toBe('886d438e8b6258497e45cc1c597cff956ac7ea9a524b50fa546a757856d49f1d')
  })

  it('detects no-op versus refresh-required policy recomputes', () => {
    const current = buildImageGenerationRequestPolicySnapshot({
      room: 'bedroom',
      aspectRatio: '3:2',
      creativeDirection: {
        fashion: 'soft-contemporary',
        tone: 'balanced',
        furnitureTier: 'high',
        lighting: 'bright-even-daylight',
        version: 1
      },
      capturedAt: '2026-09-06T00:00:00.000Z'
    })

    expect(diffImageGenerationRequestPolicySnapshot(current, {
      room: 'bedroom',
      aspectRatio: '3:2',
      creativeDirection: {
        fashion: 'soft-contemporary',
        tone: 'balanced',
        furnitureTier: 'high',
        lighting: 'bright-even-daylight',
        version: 1
      }
    })).toEqual({
      outcome: 'noop',
      policyHash: current.policyHash
    })

    expect(diffImageGenerationRequestPolicySnapshot(current, {
      room: 'bedroom',
      aspectRatio: '16:9',
      creativeDirection: {
        fashion: 'soft-contemporary',
        tone: 'balanced',
        furnitureTier: 'high',
        lighting: 'bright-even-daylight',
        version: 1
      }
    })).toEqual({
      outcome: 'refresh-required',
      policyHash: expect.any(String)
    })
  })

  it('rejects invalid policy snapshot combinations', () => {
    expect(() => buildImageGenerationRequestPolicySnapshot({
      room: 'bedroom',
      aspectRatio: '2:1' as '3:2',
      creativeDirection: {
        fashion: 'soft-contemporary',
        tone: 'balanced',
        furnitureTier: 'high',
        lighting: 'bright-even-daylight',
        version: 1
      },
      capturedAt: '2026-09-06T00:00:00.000Z'
    })).toThrow()
  })

  it('accepts a run document with terminal status projection', () => {
    const parsed = aiImageGenerationRunSchema.parse({
      _id: 'run-1',
      _type: 'aiImageGenerationRun',
      runId: 'run-1',
      requestId: 'request-1',
      status: {
        phase: 'terminal',
        requestId: 'request-1',
        runId: 'run-1',
        outcome: 'completed',
        lifecycle: { currentStep: 'persist', currentWorkKind: 'persist.media', warningCodes: [] },
        promptContributions: [{ key: 'surfaceProfile', applied: true, origin: 'deterministic-policy' }],
        recovery: { disposition: 'terminal' }
      },
      attachmentCommitToken: 'commit-token-1'
    })

    expect(parsed.attachmentCommitToken).toBe('commit-token-1')
  })
})

describe('image generation template readiness', () => {
  const template = {
    _id: 'template-1', _type: 'aiImageGenerationTemplate', title: 'Template',
    product: {_type: 'reference', _ref: 'product-1'}, evidenceImages: [], audit: [],
    binding: {productId: 'product-1', productType: 'carpet', categoryKey: 'carpets', variantBindings: [{variantKey: 'variant-key-1', colourName: 'Natural'}]},
  }
  const selection = {variantKey: 'variant-key-1', room: 'bedroom', aspectRatio: '4:3', creativeDirection: {fashion: 'soft-contemporary', tone: 'balanced', furnitureTier: 'high', lighting: 'bright-even-daylight', version: 1}}

  it('accepts an explicit request selection bound to the linked product', () => {
    expect(evaluateImageGenerationTemplateReadiness({template, linkedProduct: {_id: 'product-1', productType: 'carpet'}, ...selection})).toEqual({canSubmit: true, reasons: [], templateId: 'template-1'})
  })

  it('returns stable blockers for unbound variants without using website room metadata', () => {
    expect(evaluateImageGenerationTemplateReadiness({template, linkedProduct: {_id: 'product-1', productType: 'carpet'}, ...selection, variantKey: 'variant-key-2'})).toEqual(expect.objectContaining({canSubmit: false, reasons: ['variant-not-bound']}))
  })
})

describe('guarded control schemas', () => {
  it('accepts a duplicate request control payload through the shared helper', () => {
    const parsed = buildImageGenerationRequestDuplicateControl({
      controlId: 'control-1',
      requestedAt: '2026-09-06T00:00:00.000Z',
      sourceRequestId: 'request-1',
      sourceRequestRevision: 'rev-1',
      templateId: 'template-1'
    })

    expect(parsed).toEqual(expect.objectContaining({
      operation: 'request.duplicate',
      sourceRequestId: 'request-1',
      sourceRequestRevision: 'rev-1',
      templateId: 'template-1'
    }))
  })

  it('rejects reset controls with only one run guard field present', () => {
    expect(() => imageGenerationTemplateResetControlSchema.parse({
      controlId: 'control-2',
      operation: 'template.reset',
      requestedAt: '2026-09-06T00:00:00.000Z',
      templateId: 'template-1',
      expectedTemplateRevision: 'rev-1',
      targetRunId: 'run-1'
    })).toThrow(/targetRunId and targetRunEpoch/)
  })

  it('accepts explicit conflict result discriminants', () => {
    const parsed = imageGenerationGuardedControlResultSchema.parse({
      outcome: 'conflict_run',
      controlId: 'control-3',
      currentRunId: 'run-2',
      currentRunEpoch: 4
    })

    expect(parsed).toEqual({
      outcome: 'conflict_run',
      controlId: 'control-3',
      currentRunId: 'run-2',
      currentRunEpoch: 4
    })
  })

  it('builds the remaining guarded control payloads through shared helpers', () => {
    expect(buildImageGenerationPatternValidateControl({
      controlId: 'control-4',
      requestedAt: '2026-09-06T00:00:00.000Z',
      requestId: 'request-1',
      runId: 'run-1',
      runEpoch: 0,
      artifactId: 'artifact-1',
      expectedArtifactHash: 'hash-1',
      expectedRequestRevision: 'rev-1',
      validationDecision: 'validated'
    })).toEqual(expect.objectContaining({operation: 'pattern.validate'}))

    expect(buildImageGenerationTemplateResetControl({
      controlId: 'control-5',
      requestedAt: '2026-09-06T00:00:00.000Z',
      templateId: 'template-1',
      expectedTemplateRevision: 'rev-1',
      targetRunId: 'run-1',
      targetRunEpoch: 2
    })).toEqual(expect.objectContaining({operation: 'template.reset'}))

    expect(buildImageGenerationTemplateDeleteControl({
      controlId: 'control-delete',
      requestedAt: '2026-09-06T00:00:00.000Z',
      templateId: 'template-1',
      expectedTemplateRevision: 'rev-1'
    })).toEqual(expect.objectContaining({operation: 'template.delete'}))

    expect(buildImageGenerationTemplateRebindControl({
      controlId: 'control-6',
      requestedAt: '2026-09-06T00:00:00.000Z',
      templateId: 'template-1',
      expectedTemplateRevision: 'rev-1',
      targetProductId: 'product-2',
      targetVariantIds: ['variant-2']
    })).toEqual(expect.objectContaining({operation: 'template.rebind'}))

    expect(buildImageGenerationRequestRefreshPolicyControl({
      controlId: 'control-7',
      requestedAt: '2026-09-06T00:00:00.000Z',
      requestId: 'request-1',
      expectedRequestRevision: 'rev-2',
      expectedPolicyHash: 'policy-hash-1',
      currentRunId: 'run-2',
      currentRunEpoch: 3
    })).toEqual(expect.objectContaining({operation: 'request.refreshPolicy'}))
  })

  it('omits binding-local evidence and binding state from portable templates', () => {
    const portable = toPortableImageGenerationTemplate({
      _id: 'template-1',
      _type: 'aiImageGenerationTemplate',
      title: 'Bedroom inspiration',
      product: { _type: 'reference', _ref: 'product-1', _weak: true },
      evidenceImages: [{
        _type: 'image',
        _key: 'image-1',
        asset: { _type: 'reference', _ref: 'image-abc123-1000x1000-png' }
      }],
      binding: {
        productId: 'product-1',
        productType: 'carpet',
        categoryKey: 'carpets',
        variantBindings: [{ variantKey: 'variant-key-1', colourName: 'Cloud', patternClassification: 'unknown' }]
      }
    })

    expect(portable).toEqual({
      _id: 'template-1',
      _type: 'aiImageGenerationTemplate',
      title: 'Bedroom inspiration',
      product: { _type: 'reference', _ref: 'product-1', _weak: true },
      texturePrompt: undefined,
      colourDesignPrompts: [],
      roomPrompts: []
    })
  })
})