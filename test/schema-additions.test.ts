import { describe, expect, it } from 'vitest'
import { crawlRequestMessageSchema, renderCompleteSchema, renderRequestSchema, renderResponseSchema } from '../src/queues/contracts.js'
import { getRegistryEntriesForTrade } from '../src/registry/index.js'
import { crawlPageTableSchema } from '../src/storage/page.schema.js'
import { manualCrawlEnqueueSchema } from '../src/requests/contracts.js'

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

  // regression test: pileWeight used to be free 'text' (e.g. "40oz and 50oz" for a multi-weight
  // range), which can't be compared/filtered/displayed consistently. It must be a structured
  // 'measurement' field like pileHeight/thickness/totalHeight, not text.
  it('registers pileWeight as a structured measurement, not free text', () => {
    const entries = getRegistryEntriesForTrade('Carpet')

    expect(entries).toEqual(expect.arrayContaining([
      expect.objectContaining({ field: 'pileWeight', valueType: 'measurement' })
    ]))
  })

  it('registers additional fields as shaped attribute lists', () => {
    const entries = getRegistryEntriesForTrade('Carpet')

    expect(entries).toEqual(expect.arrayContaining([
      expect.objectContaining({ field: 'additionalSpecifications', valueType: 'attribute-list' }),
      expect.objectContaining({ field: 'additionalFeatures', valueType: 'attribute-list' })
    ]))
  })
})

describe('hard-flooring registry additions', () => {
  it('models Capture performance and construction fields instead of requiring additionalFeatures', () => {
    const entries = getRegistryEntriesForTrade('Laminate')

    expect(entries).toEqual(expect.arrayContaining([
      expect.objectContaining({ field: 'look', requiredLevel: 'recommended' }),
      expect.objectContaining({ field: 'wearRating', requiredLevel: 'optional' }),
      expect.objectContaining({ field: 'lockingSystem', requiredLevel: 'optional' }),
      expect.objectContaining({ field: 'fireRating', requiredLevel: 'optional' }),
      expect.objectContaining({ field: 'antiStatic', valueType: 'boolean' })
    ]))
  })

  it('models LVT wear layer and installation separately from the generic Vinyl fields', () => {
    const entries = getRegistryEntriesForTrade('Vinyl')

    expect(entries).toEqual(expect.arrayContaining([
      expect.objectContaining({ field: 'wearLayer', requiredLevel: 'recommended', valueType: 'measurement' }),
      expect.objectContaining({ field: 'installationMethod', requiredLevel: 'recommended' }),
      expect.objectContaining({ field: 'suitabilityUfH', requiredLevel: 'recommended', valueType: 'boolean' })
    ]))
  })

  it('provides a dedicated Engineered Wood registry with board construction and layout fields', () => {
    const entries = getRegistryEntriesForTrade('Engineered Wood')

    expect(entries).toEqual(expect.arrayContaining([
      expect.objectContaining({ field: 'thickness', requiredLevel: 'required', valueType: 'measurement' }),
      expect.objectContaining({ field: 'dimensions', requiredLevel: 'required' }),
      expect.objectContaining({ field: 'topLayerThickness', requiredLevel: 'recommended', valueType: 'measurement' }),
      expect.objectContaining({ field: 'finish', requiredLevel: 'recommended' }),
      expect.objectContaining({ field: 'look', allowedValues: expect.arrayContaining(['chevron', 'herringbone']) })
    ]))
  })
})

describe('pileWeightHint plumbing (multi-weight product disambiguation)', () => {
  const baseMessage = {
    source: 'manual' as const,
    tableName: 'm2crmproducts',
    rowKey: '123',
    url: 'https://example.com/range',
    crawlType: 'Range' as const,
    styleCode: 'VICTORIA/BURFORDTWIST/40OZ',
    trade: 'Carpet',
    reason: 'new' as const,
    requestedAt: '2026-01-01T00:00:00.000Z'
  }

  it('accepts an optional pileWeightHint on the crawl request message', () => {
    const parsed = crawlRequestMessageSchema.parse({ ...baseMessage, pileWeightHint: '40oz' })

    expect(parsed.pileWeightHint).toBe('40oz')
  })

  it('omits pileWeightHint by default for single-weight products', () => {
    const parsed = crawlRequestMessageSchema.parse(baseMessage)

    expect(parsed.pileWeightHint).toBeUndefined()
  })

  it('accepts an optional pileWeightHint on the crawl page table row', () => {
    const parsed = crawlPageTableSchema.parse({
      partitionKey: 'p',
      rowKey: 'r',
      url: 'https://example.com',
      urlKey: 'url-key-1',
      pileWeightHint: '40oz'
    })

    expect(parsed.pileWeightHint).toBe('40oz')
  })

  // this is a separate schema from crawlRequestMessageSchema above (the manual HTTP enqueue path
  // vs. the sync-triggered queue path) - missed here once already, so it needs its own test.
  it('accepts an optional pileWeightHint on the manual crawl-enqueue HTTP request', () => {
    const parsed = manualCrawlEnqueueSchema.parse({
      tableName: 'm2crmproducts',
      rowKey: '123',
      url: 'https://example.com/range',
      crawlType: 'Range',
      styleCode: 'VICTORIA/BURFORDTWIST/40OZ',
      trade: 'Carpet',
      pileWeightHint: '40oz'
    })

    expect(parsed.pileWeightHint).toBe('40oz')
  })
})

describe('SpecifiedUrls crawl requests', () => {
  const baseRequest = {
    source: 'manual' as const,
    tableName: 'm2crmproducts',
    rowKey: 'source-123',
    crawlType: 'SpecifiedUrls' as const,
    styleCode: 'SISAL',
    trade: 'Carpet',
    reason: 'manual' as const,
    requestedAt: '2026-01-01T00:00:00.000Z'
  }

  it('accepts explicit HTTPS variant URLs without requiring a parent URL', () => {
    const parsed = crawlRequestMessageSchema.parse({
      ...baseRequest,
      specifiedUrls: ['https://example.com/product/one', 'https://example.com/product/two']
    })

    expect(parsed.specifiedUrls).toHaveLength(2)
    expect(parsed.url).toBeUndefined()
  })

  it('rejects an explicit URL request with no variant URLs', () => {
    expect(crawlRequestMessageSchema.safeParse(baseRequest).success).toBe(false)
  })

  it('rejects non-https specified URLs at the queue boundary', () => {
    expect(crawlRequestMessageSchema.safeParse({
      ...baseRequest,
      specifiedUrls: ['http://example.com/product/one']
    }).success).toBe(false)
  })

  it('accepts the same shape at the manual HTTP boundary', () => {
    const parsed = manualCrawlEnqueueSchema.parse({
      tableName: 'm2crmproducts',
      rowKey: 'source-123',
      crawlType: 'SpecifiedUrls',
      specifiedUrls: ['https://example.com/product/one'],
      styleCode: 'SISAL',
      trade: 'Carpet'
    })

    expect(parsed.specifiedUrls).toEqual(['https://example.com/product/one'])
  })
})

describe('productOnlinePdfUrl plumbing (curated upstream PDF evidence)', () => {
  const baseMessage = {
    source: 'manual' as const,
    tableName: 'm2crmproducts',
    rowKey: '123',
    url: 'https://example.com/range',
    crawlType: 'Range' as const,
    styleCode: 'VICTORIA/BURFORDTWIST/40OZ',
    trade: 'Carpet',
    reason: 'manual' as const,
    requestedAt: '2026-01-01T00:00:00.000Z'
  }

  it('accepts an optional productOnlinePdfUrl on the crawl request message', () => {
    const parsed = crawlRequestMessageSchema.parse({
      ...baseMessage,
      productOnlinePdfUrl: 'https://cdn.example.com/spec.pdf'
    })

    expect(parsed.productOnlinePdfUrl).toBe('https://cdn.example.com/spec.pdf')
  })

  it('accepts an optional productOnlinePdfUrl on the manual crawl-enqueue HTTP request', () => {
    const parsed = manualCrawlEnqueueSchema.parse({
      tableName: 'm2crmproducts',
      rowKey: '123',
      url: 'https://example.com/range',
      crawlType: 'Range',
      styleCode: 'VICTORIA/BURFORDTWIST/40OZ',
      trade: 'Carpet',
      productOnlinePdfUrl: 'https://cdn.example.com/spec.pdf'
    })

    expect(parsed.productOnlinePdfUrl).toBe('https://cdn.example.com/spec.pdf')
  })

  it('rejects a non-https productOnlinePdfUrl on the manual crawl-enqueue HTTP request', () => {
    const result = manualCrawlEnqueueSchema.safeParse({
      tableName: 'm2crmproducts',
      rowKey: '123',
      url: 'https://example.com/range',
      crawlType: 'Range',
      styleCode: 'VICTORIA/BURFORDTWIST/40OZ',
      trade: 'Carpet',
      productOnlinePdfUrl: 'http://cdn.example.com/spec.pdf'
    })

    expect(result.success).toBe(false)
  })

  it('rejects a non-https productOnlinePdfUrl on the queue message', () => {
    expect(crawlRequestMessageSchema.safeParse({
      ...baseMessage,
      productOnlinePdfUrl: 'http://cdn.example.com/spec.pdf'
    }).success).toBe(false)
  })
})

describe('render request contract additions', () => {
  it('accepts an optional productOnlinePdfUrl on the render request', () => {
    const parsed = renderRequestSchema.safeParse({
      runId: 'run-1',
      urlKey: 'url-key-1',
      url: 'https://example.com/range',
      blobPrefix: 'runs/run-1/url-key-1',
      pageRole: 'range',
      productOnlinePdfUrl: 'https://cdn.example.com/spec.pdf'
    })

    expect(parsed.success).toBe(true)
  })

  it('rejects non-https page and curated PDF URLs at the render boundary', () => {
    expect(renderRequestSchema.safeParse({
      urlKey: 'url-key-1',
      url: 'http://example.com/range',
      blobPrefix: 'runs/run-1/url-key-1'
    }).success).toBe(false)
    expect(renderRequestSchema.safeParse({
      urlKey: 'url-key-1',
      url: 'https://example.com/range',
      blobPrefix: 'runs/run-1/url-key-1',
      productOnlinePdfUrl: 'http://cdn.example.com/spec.pdf'
    }).success).toBe(false)
  })
})
