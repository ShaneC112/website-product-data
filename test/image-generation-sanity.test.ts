import { describe, expect, it } from 'vitest'
import {
  buildImageGenerationRequestDuplicateControl,
  buildImageGenerationRequestPolicySnapshot,
  buildImageGenerationRequestRefreshPolicyControl,
  buildImageGenerationTemplateRebindAuditEntry,
  buildImageGenerationTemplateResetAuditEntry,
  buildImageGenerationPatternValidateControl,
  buildImageGenerationTemplateRebindControl,
  buildImageGenerationTemplateResetControl,
  diffImageGenerationRequestPolicySnapshot,
  hashImageGenerationRequestPolicySnapshot,
  computeTemplateArtifactFingerprint,
  imageGenerationGuardedControlRequestSchema,
  imageGenerationGuardedControlResultSchema,
  aiImageGenerationControlIntentSchema,
  imageGenerationSanitySubmissionSchema,
  imageGenerationTemplateAuditEntrySchema,
  imageGenerationTemplateResetControlSchema,
  aiImageGenerationRequestSchema,
  evaluateImageGenerationTemplateReadiness,
  normalizeTemplateArtifactFingerprintInput,
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
      artifactFamilies: {
        portable: ['mask/base'],
        bindingLocal: ['render/run-1']
      },
      artifactCache: [{
        cacheEntryId: 'cache-1',
        artifactKind: 'texture',
        scope: { level: 'product' },
        fingerprint: 'fingerprint-1',
        artifactRef: 'artifact:texture:1',
        provenanceRef: 'provenance:texture:1',
        producerKey: 'texture-generator',
        producerVersion: 'v1',
        policyVersion: 'policy-v1',
        templateGeneration: 0,
        createdAt: '2026-09-06T00:00:00.000Z',
        requestId: 'request-1',
        runId: 'run-1'
      }],
      artifactProvenance: [{
        provenanceEntryId: 'prov-1',
        artifactKind: 'texture',
        scope: { level: 'product' },
        fingerprint: 'fingerprint-1',
        artifactRef: 'artifact:texture:1',
        producerKey: 'texture-generator',
        producerVersion: 'v1',
        policyVersion: 'policy-v1',
        templateGeneration: 0,
        recordedAt: '2026-09-06T00:00:00.000Z',
        requestId: 'request-1',
        runId: 'run-1'
      }],
      audit: [buildImageGenerationTemplateResetAuditEntry({
        auditId: 'audit-1',
        operation: 'template.reset',
        recordedAt: '2026-09-06T00:00:00.000Z',
        templateRevision: 'rev-1',
        targetRunId: 'run-1',
        targetRunEpoch: 2,
        clearedArtifactFamilies: ['binding-local']
      })],
      binding: imageGenerationTemplateBindingSchema.parse({
        productId: 'product-1',
        productType: 'carpet',
        categoryKey: 'carpets',
        variantBindings: [{ variantKey: 'variant-key-1', colourName: 'Cloud', patternClassification: 'unknown' }]
      })
    })

    expect(parsed.evidenceImages).toHaveLength(1)
    expect(parsed.artifactFamilies.bindingLocal).toEqual(['render/run-1'])
    expect(parsed.artifactCache).toHaveLength(1)
    expect(parsed.artifactProvenance).toHaveLength(1)
    expect(parsed.audit).toHaveLength(1)
  })

  it('rejects reset audit entries with only one target run guard field present', () => {
    expect(() => imageGenerationTemplateAuditEntrySchema.parse({
      auditId: 'audit-2',
      operation: 'template.reset',
      recordedAt: '2026-09-06T00:00:00.000Z',
      targetRunId: 'run-1',
      clearedArtifactFamilies: ['binding-local']
    })).toThrow(/targetRunId and targetRunEpoch/)
  })

  it('rejects rebind audit entries without rebound artifact families', () => {
    expect(() => buildImageGenerationTemplateRebindAuditEntry({
      auditId: 'audit-3',
      operation: 'template.rebind',
      recordedAt: '2026-09-06T00:00:00.000Z',
      nextProductId: 'product-2',
      nextVariantIds: ['variant-2'],
      reboundArtifactFamilies: []
    })).toThrow(/at least 1 element/)
  })
})

describe('request and run schemas', () => {
  it('accepts a request document', () => {
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
    product: {_type: 'reference', _ref: 'product-1'}, evidenceImages: [], artifactFamilies: {portable: [], bindingLocal: []}, audit: [],
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
      product: { _type: 'reference', _ref: 'product-1', _weak: true }
    })
  })
})

describe('template artifact fingerprint helpers', () => {
  const baseFingerprintInput = {
    templateRevision: 'rev-1',
    evidence: [
      {
        assetId: 'image-b',
        templateUses: [{ templateType: 'pattern' as const, targetVariantIds: ['variant-2', 'variant-1'] }]
      },
      {
        assetId: 'image-a',
        templateUses: [{ templateType: 'texture' as const, targetVariantIds: [] }]
      }
    ],
    binding: {
      productId: 'product-1',
      productType: 'carpet',
      categoryKey: 'carpets',
      selectedVariant: { variantId: 'variant-1', colourName: 'Cloud' }
    },
    productFacts: { title: 'Cloud Nine', colours: ['Cloud', 'Mist'] },
    policyVersions: { surface: 2, prompt: 'v3' },
    surfaceProfileVersion: 'surface-v1',
    artifactKind: 'pattern' as const,
    scope: { level: 'variant' as const, variantId: 'variant-1' }
  }

  it('normalizes evidence ordering and variant targeting deterministically', () => {
    expect(normalizeTemplateArtifactFingerprintInput(baseFingerprintInput)).toEqual({
      templateRevision: 'rev-1',
      artifactKind: 'pattern',
      scope: { level: 'variant', variantId: 'variant-1' },
      evidence: [
        {
          assetId: 'image-a',
          templateUses: [{ templateType: 'texture', targetVariantIds: [] }]
        },
        {
          assetId: 'image-b',
          templateUses: [{ templateType: 'pattern', targetVariantIds: ['variant-1', 'variant-2'] }]
        }
      ],
      binding: {
        productId: 'product-1',
        productType: 'carpet',
        categoryKey: 'carpets',
        selectedVariant: { colourName: 'Cloud', variantId: 'variant-1' }
      },
      productFacts: { colours: ['Cloud', 'Mist'], title: 'Cloud Nine' },
      policyVersions: { prompt: 'v3', surface: 2 },
      surfaceProfileVersion: 'surface-v1'
    })
  })

  it('produces the same fingerprint for semantically equivalent ordering', () => {
    const first = computeTemplateArtifactFingerprint(baseFingerprintInput)
    const second = computeTemplateArtifactFingerprint({
      ...baseFingerprintInput,
      evidence: [...baseFingerprintInput.evidence].reverse(),
      policyVersions: { prompt: 'v3', surface: 2 }
    })

    expect(first).toBe(second)
  })

  it('changes the fingerprint when a scoped variant input changes', () => {
    const first = computeTemplateArtifactFingerprint(baseFingerprintInput)
    const second = computeTemplateArtifactFingerprint({
      ...baseFingerprintInput,
      scope: { level: 'variant', variantId: 'variant-2' }
    })

    expect(first).not.toBe(second)
  })

  it('rejects duplicate evidence asset ids', () => {
    expect(() => computeTemplateArtifactFingerprint({
      ...baseFingerprintInput,
      evidence: [
        baseFingerprintInput.evidence[0],
        { ...baseFingerprintInput.evidence[0] }
      ]
    })).toThrow(/Duplicate template evidence assetId/)
  })
})