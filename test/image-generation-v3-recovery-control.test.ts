import { describe, expect, it } from 'vitest'
import {
  buildV3RecoveryControl,
  imageGenerationGuardedControlRequestSchema,
  imageGenerationGuardedControlResultSchema
} from '../src/image-generation/index.js'
import {
  imageGenerationV3RecoveryActionSchema,
  imageGenerationV3RecoveryResultSchema
} from '../src/image-generation-v3/contracts/index.js'

describe('V3 recovery control contract', () => {
  const input = {
    controlId: 'control-recovery-1',
    requestedAt: '2026-09-13T00:00:00.000Z',
    requestId: 'request-1',
    runId: 'run-1',
    runEpoch: 2,
    expectedRequestRevision: 'request-rev-1',
    expectedArtifactHash: 'artifact-hash-1',
    action: 'retry-sanity-projection' as const,
    requestedBy: 'operator@example.test'
  }

  it('builds and round-trips a guarded V3 recovery control', () => {
    const control = buildV3RecoveryControl(input)

    expect(control).toEqual({operation: 'request.recover', ...input})
    expect(imageGenerationGuardedControlRequestSchema.parse(control)).toEqual(control)
  })

  it('accepts exactly the three legal recovery actions', () => {
    for (const action of [
      'reconcile-media-attachment',
      'retry-sanity-projection',
      'restart-feature-resolution'
    ] as const) {
      expect(imageGenerationV3RecoveryActionSchema.parse(action)).toBe(action)
    }
  })

  it('rejects unsupported generic recovery actions', () => {
    expect(() => imageGenerationV3RecoveryActionSchema.parse('retry')).toThrow()
    expect(() => imageGenerationV3RecoveryActionSchema.parse('provider-replace')).toThrow()
  })

  it('accepts bounded V3 recovery results without changing V2 result discriminators', () => {
    const results = [
      {outcome: 'v3_recovery_accepted', controlId: input.controlId, v3RecoveryRunId: 'recovery-run-1'},
      {outcome: 'v3_recovery_blocked', controlId: input.controlId, reasonCode: 'provider-outcome-unknown'},
      {outcome: 'v3_recovery_conflict', controlId: input.controlId, reasonCode: 'request-revision-changed', currentRequestRevision: 'request-rev-2'},
      {outcome: 'v3_recovery_failed', controlId: input.controlId, reasonCode: 'recovery-handler-failed'}
    ] as const

    for (const result of results) {
      expect(imageGenerationV3RecoveryResultSchema.parse(result)).toEqual(result)
      expect(imageGenerationGuardedControlResultSchema.parse(result)).toEqual(result)
    }

    expect(imageGenerationGuardedControlResultSchema.parse({
      outcome: 'accepted',
      controlId: input.controlId
    })).toEqual({outcome: 'accepted', controlId: input.controlId})
  })
})
