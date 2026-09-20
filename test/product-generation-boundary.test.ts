import { describe, expect, it } from 'vitest'
import {
  productGenerationRecoverySchema,
  productGenerationSanityActionReferenceSchema,
  productGenerationStatusProjectionSchema,
  productGenerationSubmissionReferenceSchema
} from '../src/requests/product-generation-boundary.js'
import {
  websiteScrapeCompletionSchema,
  websiteScrapeRequestSchema
} from '../src/queues/website-scrape-boundary.js'
import { STORAGE_QUEUES } from '../src/storage/constants.js'

const request = {
  schemaVersion: 1 as const,
  operationId: 'op-1',
  runId: 'run-1',
  epoch: 1,
  sourceGroupKey: 'VENDOR/RANGE',
  urlKey: 'url-1',
  pageRole: 'range' as const,
  evidenceVersion: 'render-v1',
  url: 'https://vendor.example/range',
  scrapeConfigReference: 'config-v1',
  blobPrefix: 'runs/run-1/op-1'
}

describe('product-generation boundary contracts', () => {
  it('accepts authoritative submission and action references', () => {
    expect(productGenerationSubmissionReferenceSchema.parse({
      schemaVersion: 1,
      submissionId: 'submission-1',
      sourceGroupKey: 'VENDOR/RANGE',
      sourceRecord: { tableName: 'm2crmproducts', rowKey: 'row-1' },
      requestedAt: '2026-09-20T00:00:00.000Z'
    }).submissionId).toBe('submission-1')
    expect(productGenerationSanityActionReferenceSchema.parse({
      schemaVersion: 1,
      actionId: 'action-1',
      requestDocumentId: 'request-1',
      requestId: 'request-id-1',
      action: 'crawl',
      requestedAt: '2026-09-20T00:00:00.000Z'
    }).action).toBe('crawl')
  })

  it('rejects rich business payloads at the submission boundary', () => {
    expect(productGenerationSubmissionReferenceSchema.safeParse({
      schemaVersion: 1,
      submissionId: 'submission-1',
      sourceGroupKey: 'VENDOR/RANGE',
      sourceRecord: { tableName: 'm2crmproducts', rowKey: 'row-1' },
      requestedAt: '2026-09-20T00:00:00.000Z',
      html: '<html />'
    }).success).toBe(false)
  })

  it('accepts recovery and compatible status projection values', () => {
    expect(productGenerationRecoverySchema.parse({
      schemaVersion: 1,
      sourceGroupKey: 'VENDOR/RANGE',
      epoch: 2,
      startAt: 'compose',
      requestedAt: '2026-09-20T00:00:00.000Z'
    }).epoch).toBe(2)
    expect(productGenerationStatusProjectionSchema.parse({
      schemaVersion: 1,
      sourceGroupKey: 'VENDOR/RANGE',
      runId: 'run-1',
      epoch: 1,
      status: 'running',
      stage: 'source_render',
      updatedAt: '2026-09-20T00:00:00.000Z'
    }).status).toBe('running')
  })
})

describe('website scraping boundary contracts', () => {
  it('accepts deterministic request and identity-echoed completion references', () => {
    expect(websiteScrapeRequestSchema.parse(request).operationId).toBe('op-1')
    expect(websiteScrapeCompletionSchema.parse({
      schemaVersion: 1,
      operationId: 'op-1',
      runId: 'run-1',
      epoch: 1,
      identity: { sourceGroupKey: 'VENDOR/RANGE', urlKey: 'url-1', pageRole: 'range' },
      evidenceVersion: 'render-v1',
      resultReference: 'results/op-1.json',
      evidenceReference: 'evidence/op-1',
      contentHash: 'hash-1',
      outcome: 'ok',
      completedAt: '2026-09-20T00:00:00.000Z'
    }).identity.urlKey).toBe('url-1')
  })

  it('rejects payloads containing HTML or extracted facts', () => {
    expect(websiteScrapeRequestSchema.safeParse({ ...request, html: '<html />' }).success).toBe(false)
    expect(websiteScrapeCompletionSchema.safeParse({
      schemaVersion: 1,
      operationId: 'op-1',
      runId: 'run-1',
      epoch: 1,
      identity: { sourceGroupKey: 'VENDOR/RANGE', urlKey: 'url-1', pageRole: 'range' },
      evidenceVersion: 'render-v1',
      resultReference: 'results/op-1.json',
      evidenceReference: 'evidence/op-1',
      contentHash: 'hash-1',
      outcome: 'ok',
      completedAt: '2026-09-20T00:00:00.000Z',
      extractedFacts: []
    }).success).toBe(false)
  })

  it('uses distinct versioned queue names', () => {
    expect(STORAGE_QUEUES.productGenerationSubmissions).toBe('product-generation-submissions-v1')
    expect(STORAGE_QUEUES.productGenerationSanityActions).toBe('product-generation-sanity-actions-v1')
    expect(STORAGE_QUEUES.websiteScrapeRequests).toBe('website-scrape-requests-v1')
    expect(STORAGE_QUEUES.websiteScrapeCompletions).toBe('website-scrape-completions-v1')
  })
})