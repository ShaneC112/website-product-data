import { describe, expect, it } from 'vitest'
import {
  batchItemResultSchema,
  extractionBatchJobSchema,
  extractionBatchResultSchema
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
