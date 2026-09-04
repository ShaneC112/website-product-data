import { describe, expect, it } from 'vitest'
import {
  crawlPipelineStageSchema,
  crawlStageStateSchema,
  crawlStageTargetSchema
} from '../src/queues/contracts.js'
import {
  crawlStageDispatchTableSchema,
  crawlStageLedgerTableSchema
} from '../src/storage/stage-ledger.schema.js'
import { STORAGE_TABLES } from '../src/storage/constants.js'
import {
  crawlRecoveryCheckpointSchema,
  crawlRecoveryPlanSchema,
  crawlRecoveryRequestSchema
} from '../src/requests/contracts.js'

describe('crawlPipelineStageSchema', () => {
  it.each([
    'source_render', 'source_extract', 'variant_render', 'variant_extract',
    'image_classify', 'compose', 'publish'
  ])('accepts %s', (stage) => {
    expect(crawlPipelineStageSchema.parse(stage)).toBe(stage)
  })

  it('rejects an unknown stage', () => {
    expect(crawlPipelineStageSchema.safeParse('render').success).toBe(false)
  })
})

describe('crawlStageStateSchema', () => {
  it.each([
    'planned', 'pending_outbound', 'queued', 'running', 'completed',
    'failed', 'timed_out', 'blocked', 'superseded', 'cancelled'
  ])('accepts %s', (state) => {
    expect(crawlStageStateSchema.parse(state)).toBe(state)
  })

  it('rejects an unknown state', () => {
    expect(crawlStageStateSchema.safeParse('done').success).toBe(false)
  })
})

describe('crawlStageTargetSchema', () => {
  it.each(['group', 'source_page', 'variant_page'] as const)('accepts a %s target', (kind) => {
    const result = crawlStageTargetSchema.safeParse({ kind, key: 'VENDOR/RANGE' })
    expect(result.success).toBe(true)
  })

  it('rejects an unknown target kind', () => {
    expect(crawlStageTargetSchema.safeParse({ kind: 'page', key: 'x' }).success).toBe(false)
  })

  it('rejects an empty key', () => {
    expect(crawlStageTargetSchema.safeParse({ kind: 'group', key: '' }).success).toBe(false)
  })

  it('accepts optional urlKey and variantId', () => {
    const parsed = crawlStageTargetSchema.parse({
      kind: 'variant_page', key: 'url-key-1', urlKey: 'url-key-1', variantId: 'variant-1'
    })
    expect(parsed.urlKey).toBe('url-key-1')
    expect(parsed.variantId).toBe('variant-1')
  })
})

const baseLedgerRow = {
  partitionKey: 'VENDOR/RANGE',
  rowKey: 'run-1:variant_extract:url-key-1',
  sourceGroupKey: 'VENDOR/RANGE',
  runId: 'run-1',
  generation: 1,
  stage: 'variant_extract' as const,
  targetJson: JSON.stringify({ kind: 'variant_page', key: 'url-key-1' }),
  state: 'running' as const,
  lastUpdatedAt: '2026-01-01T00:00:00.000Z'
}

describe('crawlStageLedgerTableSchema', () => {
  it('accepts a valid ledger row', () => {
    const parsed = crawlStageLedgerTableSchema.parse(baseLedgerRow)
    expect(parsed.attempt).toBe(0)
    expect(parsed.generation).toBe(1)
  })

  it('rejects a non-positive generation', () => {
    expect(crawlStageLedgerTableSchema.safeParse({ ...baseLedgerRow, generation: 0 }).success).toBe(false)
  })

  it('rejects an invalid stage', () => {
    expect(crawlStageLedgerTableSchema.safeParse({ ...baseLedgerRow, stage: 'render' }).success).toBe(false)
  })

  it('rejects an invalid state', () => {
    expect(crawlStageLedgerTableSchema.safeParse({ ...baseLedgerRow, state: 'done' }).success).toBe(false)
  })

  it('round-trips parentRunId and a higher generation', () => {
    const parsed = crawlStageLedgerTableSchema.parse({
      ...baseLedgerRow,
      parentRunId: 'run-0',
      generation: 2
    })
    expect(parsed.parentRunId).toBe('run-0')
    expect(parsed.generation).toBe(2)
  })
})

describe('crawlStageDispatchTableSchema', () => {
  const baseDispatchRow = {
    partitionKey: 'VENDOR/RANGE',
    rowKey: '_dispatch:run-1:variant_extract:url-key-1',
    sourceGroupKey: 'VENDOR/RANGE',
    runId: 'run-1',
    generation: 1,
    stageItemRowKey: 'run-1:variant_extract:url-key-1',
    queueName: 'crawl-extract-jobs',
    payloadJson: JSON.stringify({ urlKey: 'url-key-1' }),
    state: 'pending_outbound' as const,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  }

  it('accepts a valid dispatch row', () => {
    const parsed = crawlStageDispatchTableSchema.parse(baseDispatchRow)
    expect(parsed.attempt).toBe(0)
    expect(parsed.state).toBe('pending_outbound')
  })

  it('rejects an invalid dispatch state', () => {
    expect(crawlStageDispatchTableSchema.safeParse({ ...baseDispatchRow, state: 'sent' }).success).toBe(false)
  })

  it('rejects a non-positive generation', () => {
    expect(crawlStageDispatchTableSchema.safeParse({ ...baseDispatchRow, generation: -1 }).success).toBe(false)
  })
})

describe('stage ledger storage constants', () => {
  it('adds the new ledger and dispatch table names', () => {
    expect(STORAGE_TABLES.crawlStageLedger).toBe('webcrawlstageledger')
    expect(STORAGE_TABLES.crawlStageDispatch).toBe('webcrawlstagedispatch')
  })
})

describe('crawlRecoveryCheckpointSchema', () => {
  it.each([
    'render_source', 'extract_source', 'recover_missing_variants',
    'extract_variants', 'classify_images', 'compose', 'publish'
  ])('accepts %s', (checkpoint) => {
    expect(crawlRecoveryCheckpointSchema.parse(checkpoint)).toBe(checkpoint)
  })

  it('rejects an unknown checkpoint', () => {
    expect(crawlRecoveryCheckpointSchema.safeParse('restart').success).toBe(false)
  })
})

describe('crawlRecoveryRequestSchema', () => {
  it('accepts a minimal valid request and defaults actor to nuxt', () => {
    const parsed = crawlRecoveryRequestSchema.parse({
      sourceGroupKey: 'VENDOR/RANGE',
      checkpoint: 'recover_missing_variants'
    })
    expect(parsed.actor).toBe('nuxt')
  })

  it('rejects an empty sourceGroupKey', () => {
    expect(crawlRecoveryRequestSchema.safeParse({ sourceGroupKey: '', checkpoint: 'compose' }).success).toBe(false)
  })

  it('rejects an unbounded requestedVariantUrlKeys list', () => {
    const result = crawlRecoveryRequestSchema.safeParse({
      sourceGroupKey: 'VENDOR/RANGE',
      checkpoint: 'recover_missing_variants',
      requestedVariantUrlKeys: Array.from({ length: 501 }, (_, i) => `url-${i}`)
    })
    expect(result.success).toBe(false)
  })

  it('rejects an unknown checkpoint', () => {
    const result = crawlRecoveryRequestSchema.safeParse({
      sourceGroupKey: 'VENDOR/RANGE',
      checkpoint: 'restart'
    })
    expect(result.success).toBe(false)
  })

  it('has no force field in the parsed result even if supplied', () => {
    const parsed = crawlRecoveryRequestSchema.parse({
      sourceGroupKey: 'VENDOR/RANGE',
      checkpoint: 'publish',
      force: true
    } as never)
    expect((parsed as Record<string, unknown>).force).toBeUndefined()
  })

  it('round-trips parentRunId', () => {
    const parsed = crawlRecoveryRequestSchema.parse({
      sourceGroupKey: 'VENDOR/RANGE',
      checkpoint: 'compose',
      parentRunId: 'run-1'
    })
    expect(parsed.parentRunId).toBe('run-1')
  })
})

describe('crawlRecoveryPlanSchema', () => {
  it('accepts a plan with ledger-backed stage items and legal choices', () => {
    const parsed = crawlRecoveryPlanSchema.parse({
      sourceGroupKey: 'VENDOR/RANGE',
      activeRunId: 'run-1',
      activeGeneration: 1,
      stageItems: [baseLedgerRow],
      choices: [{
        checkpoint: 'extract_variants',
        enabled: true,
        preserved: ['source extraction'],
        invalidates: ['variant extraction onward'],
        targetUrlKeys: ['url-key-1']
      }]
    })

    expect(parsed.stageItems).toHaveLength(1)
    expect(parsed.choices[0]?.checkpoint).toBe('extract_variants')
  })

  it('rejects a plan that omits stageItems', () => {
    expect(crawlRecoveryPlanSchema.safeParse({
      sourceGroupKey: 'VENDOR/RANGE',
      activeGeneration: 1,
      choices: []
    }).success).toBe(false)
  })
})
