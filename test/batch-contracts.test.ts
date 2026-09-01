import { describe, expect, it } from 'vitest'
import {
  batchItemResultSchema,
  extractionBatchJobSchema,
  extractionBatchResultSchema,
  imageJobSchema,
  sanityImageCommandSchema
} from '../src/queues/contracts.js'
import { crawlExtractBatchTableSchema } from '../src/storage/extract-batch.schema.js'
import { STORAGE_QUEUES, STORAGE_TABLES } from '../src/storage/constants.js'

const baseItem = {
  urlKey: 'url-key-1',
  url: 'https://example.com/variant-1',
  pageRole: 'variant' as const
}

const baseJob = {
  batchId: 'batch-1',
  sourceGroupKey: 'VENDOR/RANGE',
  operation: 'product_extraction' as const,
  items: [baseItem],
  estimatedPromptTokens: 1000,
  createdAt: '2026-01-01T00:00:00.000Z'
}

describe('extractionBatchJobSchema', () => {
  it('accepts a valid batch job', () => {
    const parsed = extractionBatchJobSchema.parse(baseJob)
    expect(parsed.items).toHaveLength(1)
    expect(parsed.attempt).toBe(0)
  })

  it('rejects an empty items array', () => {
    const result = extractionBatchJobSchema.safeParse({ ...baseJob, items: [] })
    expect(result.success).toBe(false)
  })

  it('rejects duplicate urlKey (+ variantId) within a job', () => {
    const result = extractionBatchJobSchema.safeParse({
      ...baseJob,
      items: [baseItem, { ...baseItem }]
    })
    expect(result.success).toBe(false)
  })

  it('allows the same urlKey with different variantId values', () => {
    const result = extractionBatchJobSchema.safeParse({
      ...baseJob,
      items: [
        { ...baseItem, variantId: 'a' },
        { ...baseItem, variantId: 'b' }
      ]
    })
    expect(result.success).toBe(true)
  })
})

describe('extractionBatchResultSchema', () => {
  it('supports partial success: one succeeded item alongside one failed item', () => {
    const parsed = extractionBatchResultSchema.parse({
      batchId: 'batch-1',
      operation: 'product_extraction',
      attempt: 0,
      results: [
        { urlKey: 'url-key-1', status: 'succeeded', fields: [], confidence: 0.9 },
        { urlKey: 'url-key-2', status: 'failed', error: 'malformed field payload' }
      ]
    })
    expect(parsed.results).toHaveLength(2)
    expect(parsed.results[0].status).toBe('succeeded')
    expect(parsed.results[1].status).toBe('failed')
  })

  it('bounds the per-item error message length', () => {
    const result = batchItemResultSchema.safeParse({
      urlKey: 'url-key-1',
      status: 'failed',
      error: 'x'.repeat(501)
    })
    expect(result.success).toBe(false)
  })

  it('accepts a literal null error (models omit the key inconsistently, sometimes returning null instead)', () => {
    const result = batchItemResultSchema.safeParse({
      urlKey: 'url-key-1',
      status: 'succeeded',
      fields: [],
      error: null
    })
    expect(result.success).toBe(true)
  })
})

describe('crawlExtractBatchTableSchema', () => {
  it('accepts a valid ledger row', () => {
    const parsed = crawlExtractBatchTableSchema.parse({
      partitionKey: 'VENDOR/RANGE',
      rowKey: 'product_extraction:url-key-1',
      sourceGroupKey: 'VENDOR/RANGE',
      operation: 'product_extraction',
      runId: 'run-1',
      urlKey: 'url-key-1',
      url: 'https://example.com/variant-1',
      pageRole: 'variant',
      status: 'pending',
      firstSeenAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z'
    })
    expect(parsed.status).toBe('pending')
    expect(parsed.attempt).toBe(0)
    expect(parsed.runId).toBe('run-1')
  })
})

describe('batch storage constants', () => {
  it('adds the new ledger table and batch queue, and keeps the migrated queue names', () => {
    expect(STORAGE_TABLES.crawlExtractBatch).toBe('webcrawlextractbatch')
    expect(STORAGE_QUEUES.crawlExtractBatchJobs).toBe('crawl-extract-batch-jobs')
    expect(STORAGE_QUEUES.crawlRenderComplete).toBe('crawl-render-complete')
    expect(STORAGE_QUEUES.crawlExtractJobs).toBe('crawl-extract-jobs')
    expect(STORAGE_QUEUES.crawlVariantJobs).toBe('crawl-variant-jobs')
  })
})

describe('imageJobSchema', () => {
  it('keeps batch processing enabled when bypassBatch is omitted', () => {
    expect(imageJobSchema.parse({ urlKey: 'url-key-1', runId: 'run-1' })).toEqual({
      urlKey: 'url-key-1',
      runId: 'run-1'
    })
  })

  it('preserves an explicit single-item fallback', () => {
    expect(imageJobSchema.parse({ urlKey: 'url-key-1', bypassBatch: true }).bypassBatch).toBe(true)
  })

  it('rejects non-boolean fallback flags', () => {
    expect(imageJobSchema.safeParse({ urlKey: 'url-key-1', bypassBatch: 'true' }).success).toBe(false)
  })
})

describe('sanityImageCommandSchema', () => {
  const base = {
    commandId: 'request-1:prepare',
    requestId: 'request-1',
    sanityProjectId: 'project',
    sanityDataset: 'production',
    sanityDocumentId: 'drafts.product-1',
    requestKey: 'request-key',
    totalRuns: 1,
    requestedAt: '2026-09-01T00:00:00.000Z'
  }

  it('validates a prompt preparation snapshot', () => {
    const command = sanityImageCommandSchema.parse({
      ...base,
      phase: 'prepare',
      autoCreate: true,
      product: { name: 'Range', productType: 'carpet' },
      variants: [{ variantId: 'v1', colourName: 'Cloud', swatchUrl: 'https://cdn.sanity.io/swatch.png' }],
      rooms: ['bedroom'],
      layDirection: 'toward-main-light',
      design: {
        selectionKey: 'design-1',
        furnitureStyle: 'boconcept',
        interiorFashion: '1980s-postmodern',
        statementTone: 'bold',
        lighting: 'afternoon',
        pipeline: 'direct',
        generationProfile: 'flux-roomshot-v1',
        presetId: 'preset-1',
        presetKey: 'mid-market',
        presetTitle: 'Mid market',
        presetVersion: 1
      }
    })
    expect(command.phase).toBe('prepare')
    expect(command.autoCreate).toBe(true)
  })

  it('enforces product-specific lay direction choices', () => {
    const result = sanityImageCommandSchema.safeParse({
      commandId: 'prepare-2', requestId: 'request-2', sanityProjectId: 'project', sanityDataset: 'production', sanityDocumentId: 'product-1', requestKey: 'request-key', totalRuns: 1, phase: 'prepare', requestedAt: '2026-08-31T12:00:00.000Z',
      product: {name: 'Oak', productType: 'engineered-wood'},
      variants: [{variantId: 'v1', colourName: 'Oak', swatchUrl: 'https://cdn.sanity.io/swatch.png'}],
      rooms: ['bedroom'], layDirection: 'quarter-turn',
      design: {selectionKey: 'design-1', furnitureStyle: 'boconcept', interiorFashion: 'contemporary', statementTone: 'balanced', lighting: 'afternoon', pipeline: 'direct', generationProfile: 'flux-roomshot-v1', presetId: 'preset-1', presetKey: 'key', presetTitle: 'Title', presetVersion: 1},
    })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues.some((issue) => issue.path.join('.') === 'layDirection')).toBe(true)
  })

  it('rejects duplicate generation run IDs and insecure swatch URLs', () => {
    const result = sanityImageCommandSchema.safeParse({
      ...base,
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
      ...base,
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
})
