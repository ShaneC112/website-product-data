import { describe, expect, it } from 'vitest'
import { renderCompleteSchema, renderResponseSchema } from '../src/queues/contracts.js'
import { getRegistryEntriesForTrade } from '../src/registry/index.js'
import { crawlPageTableSchema } from '../src/storage/page.schema.js'

// regression coverage for the visible-text plumbing added alongside the render pipeline: render
// uploads a hidden-aware, tag-free rendering of the page (previously only its length was kept),
// and azure's extraction prefers it over a fixed-size raw HTML excerpt. All three of these schemas
// must agree on the optional `visibleText`/`blobVisibleTextPath` field or the path silently breaks
// at whichever layer forgot it.
describe('visible-text schema plumbing', () => {
  it('accepts an optional visibleText blob path on the render response', () => {
    const parsed = renderResponseSchema.parse({
      runId: 'run-1',
      startedAt: '2026-01-01T00:00:00.000Z',
      completedAt: '2026-01-01T00:00:01.000Z',
      status: 'ok',
      blobPaths: {
        html: 'x/page.html',
        screenshot: 'x/page.jpg',
        elements: ['x/elements.json'],
        visibleText: 'x/visible-text.txt'
      },
      contentHash: 'hash-1',
      visibleTextLength: 9
    })

    expect(parsed.blobPaths.visibleText).toBe('x/visible-text.txt')
  })

  it('accepts an optional visibleText blob path on the render-complete message', () => {
    const parsed = renderCompleteSchema.parse({
      runId: 'run-1',
      urlKey: 'url-key-1',
      status: 'ok',
      contentHash: 'hash-1',
      url: 'https://example.com',
      blobPaths: {
        html: 'x/page.html',
        screenshot: 'x/page.jpg',
        elements: ['x/elements.json'],
        visibleText: 'x/visible-text.txt'
      },
      visibleTextLength: 9
    })

    expect(parsed.blobPaths.visibleText).toBe('x/visible-text.txt')
  })

  it('accepts an optional blobVisibleTextPath on the crawl page table row', () => {
    const parsed = crawlPageTableSchema.parse({
      partitionKey: 'p',
      rowKey: 'r',
      url: 'https://example.com',
      urlKey: 'url-key-1',
      blobVisibleTextPath: 'x/visible-text.txt'
    })

    expect(parsed.blobVisibleTextPath).toBe('x/visible-text.txt')
  })
})

describe('carpet registry additions', () => {
  it('includes the new optional Carpet fields with the expected categories', () => {
    const entries = getRegistryEntriesForTrade('Carpet')

    expect(entries).toEqual(expect.arrayContaining([
      expect.objectContaining({ field: 'togRating', requiredLevel: 'optional', category: 'specifications' }),
      expect.objectContaining({ field: 'suitability', requiredLevel: 'optional', category: 'specifications' }),
      expect.objectContaining({ field: 'warranty', requiredLevel: 'optional', category: 'specifications' }),
      expect.objectContaining({ field: 'areaRoom', requiredLevel: 'optional', category: 'additional' })
    ]))
  })
})
