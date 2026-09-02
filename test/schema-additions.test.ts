import { describe, expect, it } from 'vitest'
import { crawlRequestMessageSchema, renderCompleteSchema, renderRequestSchema, renderResponseSchema } from '../src/queues/contracts.js'
import { IMAGE_GENERATION_PRODUCT_REGISTRY, IMAGE_GENERATION_PROFILE_ESTIMATES, estimateImageGenerationCostEur, getRegistryEntriesForTrade, mapTradeToSanityProductType, SANITY_CATEGORY_KEYS, SANITY_PRODUCT_TYPES, SANITY_SUITABLE_ROOMS } from '../src/registry/index.js'
import { mapSanityProductTypeToCategoryKey } from '../src/registry/index.js'
import { crawlPageTableSchema, parseCrawlPagePackInfoHint, stringifyCrawlPagePackInfoHint } from '../src/storage/page.schema.js'
import { crawlProductDetailTableSchema, parseRawWidthHint, stringifyRawWidthHint } from '../src/storage/product-detail.schema.js'
import { crawlRunSummaryTableSchema } from '../src/storage/run-summary.schema.js'
import { manualCrawlEnqueueSchema } from '../src/requests/contracts.js'

describe('Sanity ingestion run summary', () => {
  it('accepts a non-published outcome and document IDs', () => {
    const parsed = crawlRunSummaryTableSchema.parse({
      partitionKey: 'run-1',
      rowKey: 'run-1',
      runId: 'run-1',
      status: 'publish_deferred',
      sanityOutcome: 'mixed',
      sanityDocumentIds: '["drafts.product-1"]',
      sanityDraftCount: 1,
      sanityHeldCount: 1,
      sanityHeldReasonsJson: '["missing_swatch_image"]'
    })

    expect(parsed).toMatchObject({
      sanityOutcome: 'mixed',
      sanityDraftCount: 1,
      sanityHeldCount: 1,
      sanityHeldReasonsJson: '["missing_swatch_image"]'
    })
  })
})

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
      expect.objectContaining({
        field: 'suitableRooms',
        requiredLevel: 'optional',
        category: 'additional',
        valueType: 'text-list',
        allowedValues: SANITY_SUITABLE_ROOMS
      })
    ]))
  })

  // regression coverage for the width parent/child model (Phase 02a): allowVariantOverride is the
  // source of truth for which fields follow the product-default/child-overrides-only-if-different
  // model - it must be true on Carpet's width, and falsy on every other field (e.g. pileWeight).
  it('sets allowVariantOverride on Carpet width only', () => {
    const entries = getRegistryEntriesForTrade('Carpet')

    expect(entries).toContainEqual(expect.objectContaining({ field: 'width', allowVariantOverride: true }))
    expect(entries.find((entry) => entry.field === 'pileWeight')?.allowVariantOverride).toBeFalsy()
  })

  it('uses the canonical room list for every trade', () => {
    for (const trade of ['Carpet', 'Carpet Tile', 'Laminate', 'Vinyl', 'Engineered Wood', 'Unknown']) {
      expect(getRegistryEntriesForTrade(trade)).toContainEqual(expect.objectContaining({
        field: 'suitableRooms',
        valueType: 'text-list',
        allowedValues: SANITY_SUITABLE_ROOMS
      }))
    }
  })

  it('includes species and refinishable for Engineered Wood', () => {
    const entries = getRegistryEntriesForTrade('Engineered Wood')

    expect(entries).toEqual(expect.arrayContaining([
      expect.objectContaining({ field: 'species', requiredLevel: 'recommended', valueType: 'text', category: 'specifications' }),
      expect.objectContaining({ field: 'refinishable', requiredLevel: 'optional', valueType: 'boolean', category: 'features' })
    ]))
  })

  it('includes suitability for Vinyl, Laminate, Carpet Tile, and Engineered Wood', () => {
    for (const trade of ['Vinyl', 'Laminate', 'Carpet Tile', 'Engineered Wood']) {
      expect(getRegistryEntriesForTrade(trade)).toContainEqual(expect.objectContaining({
        field: 'suitability',
        requiredLevel: 'optional',
        valueType: 'text',
        category: 'specifications'
      }))
    }
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

describe('Sanity publication taxonomy', () => {
  it('maps source trades to the static Sanity product type list', () => {
    expect(mapTradeToSanityProductType('Carpet')).toBe('carpet')
    expect(mapTradeToSanityProductType('Carpet Tile')).toBe('carpet-tile')
    expect(mapTradeToSanityProductType('Engineered Wood')).toBe('engineered-wood')
    expect(mapTradeToSanityProductType('Vinyl', 'luxury vinyl tile')).toBe('lvt')
    expect(mapTradeToSanityProductType('Carpet', 'rug')).toBe('rug')
    expect(mapTradeToSanityProductType('Unknown')).toBeUndefined()
    expect(SANITY_PRODUCT_TYPES).toContain('vinyl')
    expect(Object.keys(IMAGE_GENERATION_PRODUCT_REGISTRY).sort()).toEqual([...SANITY_PRODUCT_TYPES].sort())
    expect(IMAGE_GENERATION_PRODUCT_REGISTRY['carpet-tile'].layDirectionOptions).toContain('quarter-turn')
    expect(IMAGE_GENERATION_PRODUCT_REGISTRY.rug.layDirectionOptions).toEqual([])
    expect(estimateImageGenerationCostEur('flux-roomshot-v1', 20)).toBe(0.78)
    expect(estimateImageGenerationCostEur('flux-kontext-pattern-v1', 20)).toBe(1.22)
    expect(IMAGE_GENERATION_PROFILE_ESTIMATES['flux-roomshot-v1'].pricingRevision).toBe('bfl-2026-08-31')
  })

  it('maps canonical product types to their website render category key', () => {
    expect(mapSanityProductTypeToCategoryKey('carpet')).toBe('carpets')
    expect(mapSanityProductTypeToCategoryKey('laminate')).toBe('wood-flooring')
    expect(mapSanityProductTypeToCategoryKey('lvt')).toBe('lvt')
    expect(mapSanityProductTypeToCategoryKey('vinyl')).toBe('vinyl')
    expect(mapSanityProductTypeToCategoryKey('matting')).toBeUndefined()
    expect(SANITY_CATEGORY_KEYS).toEqual(['carpets', 'wood-flooring', 'lvt', 'vinyl'])
    expect(SANITY_CATEGORY_KEYS).not.toContain('stair-runners')
  })

  it('defines one canonical suitable-room list for extraction and Sanity', () => {
    expect(SANITY_SUITABLE_ROOMS).toEqual(expect.arrayContaining([
      'bedroom',
      'living-room',
      'stairs',
      'kitchen',
      'bathroom',
      'utility-room'
    ]))
    expect(new Set(SANITY_SUITABLE_ROOMS).size).toBe(SANITY_SUITABLE_ROOMS.length)
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

// regression coverage for the m2crm box-price/pack-info wiring (Laminate/Vinyl/Engineered Wood):
// rawBoxPriceMinor/boxUnit are authoritative (same trust tier as rawPriceMinor), packInfoHint is
// a bias hint only (mirrors pileWeightHint). Each must survive both queue-boundary schemas plus
// the page/product-detail table schemas independently - missing any one silently drops the field.
describe('m2crm box price / pack info hint plumbing', () => {
  const packInfoHint = {
    length: {value: 1200, unit: 'mm'},
    width: {value: 190, unit: 'mm'},
    coverage: {value: 2.22, unit: 'm2'},
    piecesPerPack: 8
  }

  it('accepts rawBoxPriceMinor/boxUnit/packInfoHint on the crawl request message', () => {
    const parsed = crawlRequestMessageSchema.parse({
      source: 'manual',
      tableName: 'm2crmproducts',
      rowKey: '123',
      url: 'https://example.com/range',
      crawlType: 'Range',
      styleCode: 'PERGO/ORIGINAL',
      trade: 'Laminate',
      reason: 'new',
      requestedAt: '2026-01-01T00:00:00.000Z',
      rawBoxPriceMinor: 8999,
      boxUnit: 'box',
      packInfoHint
    })

    expect(parsed.rawBoxPriceMinor).toBe(8999)
    expect(parsed.boxUnit).toBe('box')
    expect(parsed.packInfoHint).toEqual(packInfoHint)
  })

  it('accepts the same fields at the manual HTTP boundary', () => {
    const parsed = manualCrawlEnqueueSchema.parse({
      tableName: 'm2crmproducts',
      rowKey: '123',
      url: 'https://example.com/range',
      crawlType: 'Range',
      styleCode: 'PERGO/ORIGINAL',
      trade: 'Laminate',
      rawBoxPriceMinor: 8999,
      boxUnit: 'box',
      packInfoHint
    })

    expect(parsed.rawBoxPriceMinor).toBe(8999)
    expect(parsed.boxUnit).toBe('box')
    expect(parsed.packInfoHint).toEqual(packInfoHint)
  })

  it('accepts rawBoxPriceMinor/boxUnit on the crawl page table row', () => {
    const parsed = crawlPageTableSchema.parse({
      partitionKey: 'p',
      rowKey: 'r',
      url: 'https://example.com',
      urlKey: 'url-key-1',
      rawBoxPriceMinor: 8999,
      boxUnit: 'box'
    })

    expect(parsed.rawBoxPriceMinor).toBe(8999)
    expect(parsed.boxUnit).toBe('box')
  })

  it('round-trips packInfoHint on the crawl page table row as a JSON-stringified column', () => {
    const packInfoHintJson = stringifyCrawlPagePackInfoHint(packInfoHint)
    const parsed = crawlPageTableSchema.parse({
      partitionKey: 'p',
      rowKey: 'r',
      url: 'https://example.com',
      urlKey: 'url-key-1',
      packInfoHintJson
    })

    expect(parseCrawlPagePackInfoHint(parsed.packInfoHintJson!)).toEqual(packInfoHint)
  })

  it('accepts rawBoxPriceMinor/boxUnit on the crawl product detail table row', () => {
    const parsed = crawlProductDetailTableSchema.parse({
      partitionKey: 'p',
      rowKey: 'r',
      rawBoxPriceMinor: 8999,
      boxUnit: 'box'
    })

    expect(parsed.rawBoxPriceMinor).toBe(8999)
    expect(parsed.boxUnit).toBe('box')
  })
})

// regression coverage for the m2crm per-SKU width-hint wiring (Phase 02a): rawWidthHint is
// authoritative business data (same trust tier as rawPriceMinor, confirmed live against m2crm's
// native `width` product field), not a bias hint like packInfoHint. Each schema boundary it
// crosses must round-trip it independently, same rationale as the box price/pack info block above.
describe('m2crm width hint plumbing', () => {
  const rawWidthHint = [{value: 4, unit: 'm'}, {value: 5, unit: 'm'}]

  it('accepts rawWidthHint on the crawl request message', () => {
    const parsed = crawlRequestMessageSchema.parse({
      source: 'manual',
      tableName: 'm2crmproducts',
      rowKey: '123',
      url: 'https://example.com/range',
      crawlType: 'Range',
      styleCode: 'VICTORIA/BURFORDTWIST/50OZ',
      trade: 'Carpet',
      reason: 'new',
      requestedAt: '2026-01-01T00:00:00.000Z',
      rawWidthHint
    })

    expect(parsed.rawWidthHint).toEqual(rawWidthHint)
  })

  it('accepts rawWidthHint at the manual HTTP boundary', () => {
    const parsed = manualCrawlEnqueueSchema.parse({
      tableName: 'm2crmproducts',
      rowKey: '123',
      url: 'https://example.com/range',
      crawlType: 'Range',
      styleCode: 'VICTORIA/BURFORDTWIST/50OZ',
      trade: 'Carpet',
      rawWidthHint
    })

    expect(parsed.rawWidthHint).toEqual(rawWidthHint)
  })

  it('round-trips rawWidthHint on the crawl product detail table row as a JSON-stringified column', () => {
    const rawWidthHintJson = stringifyRawWidthHint(rawWidthHint)
    const parsed = crawlProductDetailTableSchema.parse({
      partitionKey: 'p',
      rowKey: 'r',
      rawWidthHintJson
    })

    expect(parseRawWidthHint(parsed.rawWidthHintJson!)).toEqual(rawWidthHint)
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
