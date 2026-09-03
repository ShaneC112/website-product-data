import { describe, expect, it, vi } from 'vitest'
import { buildSanityIngestionPlan } from '../src/sanity/ingestion.js'
import { publishProductDraft, type SanityPublisherClient } from '../src/sanity/publishDraft.js'
import type { ComposedProductDetailBlob, CrawlProductDetailTable } from '../src/storage/index.js'

function baseRow(overrides: Partial<CrawlProductDetailTable> = {}): CrawlProductDetailTable {
  return {
    partitionKey: 'group-1',
    rowKey: 'row-1',
    sourceGroupKey: 'group-1',
    styleCode: 'VICTORIA/BURFORDTWIST',
    trade: 'Carpet',
    vatRate: 0.23,
    ...overrides,
  }
}

function buildBlob(vendorProductPage: Record<string, unknown>): ComposedProductDetailBlob {
  return {
    summary: { url: 'https://example.com/range', pageRole: 'range', visibleTextLength: 1000, renderedAt: '2026-08-01T00:00:00.000Z' },
    source: { styleCode: 'VICTORIA/BURFORDTWIST' },
    extracted: {
      trade: 'Carpet',
      fields: [{ field: 'title', value: 'Burford Twist', confidence: 1 }],
      status: 'ready',
      vendorProductPage: {
        url: 'https://example.com/range',
        pageRole: 'range',
        rangeName: 'Burford Twist',
        features: [],
        specifications: [],
        widths: [],
        dynamicFields: [],
        variants: [],
        ...vendorProductPage,
      },
    },
    review: { knownSpecifications: [], knownFeatures: [], additionalSpecifications: [], additionalFeatures: [] },
    composition: { readinessReasons: [], hasExtractedDetail: true },
  } as unknown as ComposedProductDetailBlob
}

function fakeClient(overrides: Partial<SanityPublisherClient> = {}): SanityPublisherClient {
  return {
    fetch: vi.fn(async () => ({ drafts: [], published: [], aliasTargetIds: [] })),
    createIfNotExists: vi.fn(async (document) => ({ _id: document._id })),
    createOrReplace: vi.fn(async () => ({})),
    assets: { upload: vi.fn(async () => ({ _id: 'image-asset-1' })) },
    ...overrides,
  } as unknown as SanityPublisherClient
}

const fetchImageOk = vi.fn(async () => ({ ok: true, status: 200, blob: async () => new Blob() }) as unknown as Response)

// regression coverage for Phase 04 task 7/8: evaluateBridgeEligibility (Phase 03) replaces the old
// productImportCandidate branch entirely - an ineligible plan must never reach Sanity, and an
// already-published product must be left untouched (not deleted/unpublished/partially patched).
describe('publishProductDraft - held outcome', () => {
  it('holds (no Sanity call) and returns reasons when the plan fails bridge eligibility', async () => {
    const row = baseRow()
    // valid hex/colourFamily so the schema itself parses, but no swatch image asset and no width
    // anywhere - isolates the two business-rule reasons from generic schema-shape failures.
    const blob = buildBlob({ variants: [{ variantId: 'blue', colourName: 'Blue', swatchHex: '#1122ff' }] })
    const plan = buildSanityIngestionPlan(row, blob, { vendorId: 'victoria-carpets' })
    const client = fakeClient()

    const result = await publishProductDraft(client, plan, fetchImageOk)

    expect(result.outcome).toBe('held')
    if (result.outcome === 'held') {
      expect(result.reasons).toEqual(expect.arrayContaining(['missing_swatch_image', 'missing_required_width']))
    }
    expect(client.createIfNotExists).not.toHaveBeenCalled()
    expect(client.createOrReplace).not.toHaveBeenCalled()
  })

  it('leaves an existing Sanity product untouched when a re-crawl plan fails the bridge', async () => {
    const row = baseRow()
    const blob = buildBlob({ variants: [{ variantId: 'blue', colourName: 'Blue', swatchHex: '#1122ff' }] })
    const plan = buildSanityIngestionPlan(row, blob, { vendorId: 'victoria-carpets' })
    const existing = {
      _id: 'drafts.existing-product',
      _type: 'product',
      importMeta: { contentLocked: false },
      variants: [],
    }
    const client = fakeClient({
      fetch: vi.fn(async () => ({ drafts: [existing], published: [], aliasTargetIds: [] })),
    })

    const result = await publishProductDraft(client, plan, fetchImageOk)

    expect(result.outcome).toBe('held')
    expect(client.createOrReplace).not.toHaveBeenCalled()
    expect(client.createIfNotExists).not.toHaveBeenCalled()
  })

  it('holds with content_locked when the existing product has been locked by an editor, even if the plan is otherwise eligible', async () => {
    const row = baseRow()
    const blob = buildBlob({
      widths: [{ widthLabel: '4 m' }],
      variants: [{ variantId: 'blue', colourName: 'Blue', swatchHex: '#1122ff', swatchImageUrl: 'https://example.com/swatch-blue.jpg' }],
    })
    const plan = buildSanityIngestionPlan(row, blob, { vendorId: 'victoria-carpets' })
    const existing = {
      _id: 'drafts.existing-product',
      _type: 'product',
      importMeta: { contentLocked: true },
      variants: [],
    }
    const client = fakeClient({
      fetch: vi.fn(async () => ({ drafts: [existing], published: [], aliasTargetIds: [] })),
    })

    const result = await publishProductDraft(client, plan, fetchImageOk)

    expect(result.outcome).toBe('held')
    if (result.outcome === 'held') {
      expect(result.reasons).toContain('content_locked')
    }
    expect(client.createOrReplace).not.toHaveBeenCalled()
  })
})

describe('publishProductDraft - draft outcome', () => {
  it('reports the lifecycle of each uploaded source asset', async () => {
    const blob = buildBlob({
      widths: [{ widthLabel: '4 m' }],
      variants: [{ variantId: 'blue', colourName: 'Blue', swatchImageUrl: 'https://example.com/swatch-blue.jpg' }],
    })
    const events: string[] = []

    await publishProductDraft(
      fakeClient(),
      buildSanityIngestionPlan(baseRow(), blob, { vendorId: 'victoria-carpets' }),
      fetchImageOk,
      (event) => events.push(event.action),
    )

    expect(events).toEqual(['asset_fetch_started', 'asset_fetch_completed', 'asset_upload_completed', 'media_image_created'])
  })

  it('uses a stable media document identity for the same vendor source', async () => {
    const blob = buildBlob({
      widths: [{widthLabel: '4 m'}],
      variants: [{variantId: 'blue', colourName: 'Blue', swatchImageUrl: 'https://example.com/swatch-blue.jpg'}],
    })
    const client = fakeClient()

    await publishProductDraft(client, buildSanityIngestionPlan(baseRow(), blob, {vendorId: 'victoria-carpets'}), fetchImageOk)
    await publishProductDraft(client, buildSanityIngestionPlan(baseRow(), blob, {vendorId: 'victoria-carpets'}), fetchImageOk)

    const create = client.createIfNotExists as ReturnType<typeof vi.fn>
    expect(create).toHaveBeenCalledTimes(2)
    expect(create.mock.calls[0][0]._id).toBe(create.mock.calls[1][0]._id)
  })

  it('creates a draft when only optional registry recommendations are missing', async () => {
    const blob = buildBlob({
      widths: [{ widthLabel: '4 m' }],
      variants: [{ variantId: 'blue', colourName: 'Blue', swatchImageUrl: 'https://example.com/swatch-blue.jpg' }],
    })
    blob.composition.readinessReasons = ['recommended_missing_pileHeight', 'recommended_missing_pileWeight']
    const plan = buildSanityIngestionPlan(baseRow(), blob, { vendorId: 'victoria-carpets' })
    const client = fakeClient()

    const result = await publishProductDraft(client, plan, fetchImageOk)

    expect(result.outcome).toBe('draft')
    expect(client.createOrReplace).toHaveBeenCalledTimes(1)
  })

  it('creates a Sanity draft when the plan passes bridge eligibility', async () => {
    const row = baseRow({ price: 10000 })
    const blob = buildBlob({
      widths: [{ widthLabel: '4 m' }],
      variants: [{ variantId: 'blue', colourName: 'Blue', swatchHex: '#1122ff', swatchImageUrl: 'https://example.com/swatch-blue.jpg' }],
    })
    const plan = buildSanityIngestionPlan(row, blob, { vendorId: 'victoria-carpets' })
    const client = fakeClient()

    const result = await publishProductDraft(client, plan, fetchImageOk)

    expect(result.outcome).toBe('draft')
    expect(client.createOrReplace).toHaveBeenCalledTimes(1)
  })

  it('uses one deterministic draft identity for concurrent first publishes', async () => {
    const blob = buildBlob({
      widths: [{widthLabel: '4 m'}],
      variants: [{variantId: 'blue', colourName: 'Blue', swatchHex: '#1122ff', swatchImageUrl: 'https://example.com/swatch-blue.jpg'}],
    })
    const plan = buildSanityIngestionPlan(baseRow(), blob, {vendorId: 'victoria-carpets'})
    const client = fakeClient()

    const results = await Promise.all([
      publishProductDraft(client, plan, fetchImageOk),
      publishProductDraft(client, plan, fetchImageOk),
    ])

    expect(results).toEqual([
      expect.objectContaining({outcome: 'draft'}),
      expect.objectContaining({outcome: 'draft'}),
    ])
    const createOrReplace = client.createOrReplace as ReturnType<typeof vi.fn>
    expect(createOrReplace.mock.calls[0][0]._id).toBe(createOrReplace.mock.calls[1][0]._id)
    expect(createOrReplace.mock.calls[0][0]._id).toMatch(/^drafts\.product-[a-f0-9]{64}$/)
  })

  it('updates an existing draft by vendor and external identity when the source lacks a style code', async () => {
    const row = baseRow({sourceGroupKey: 'LANO/BASALTART', styleCode: undefined})
    const blob = buildBlob({
      widths: [{widthLabel: '4 m'}],
      variants: [{variantId: 'camel', colourName: 'Camel', swatchImageUrl: 'https://example.com/swatch-camel.jpg'}],
    })
    delete blob.source.styleCode
    const existing = {_id: 'drafts.existing-lano', _type: 'product', importMeta: {contentLocked: false}, variants: []}
    const client = fakeClient({fetch: vi.fn(async () => ({drafts: [existing], published: [], aliasTargetIds: []}))})

    const result = await publishProductDraft(client, buildSanityIngestionPlan(row, blob, {vendorId: 'lano-com'}), fetchImageOk)

    expect(result).toMatchObject({outcome: 'draft', draftId: 'drafts.existing-lano'})
    expect(client.fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({vendorId: 'lano-com', externalId: 'LANO/BASALTART'}), {perspective: 'raw'})
    expect(client.createOrReplace).toHaveBeenCalledWith(expect.objectContaining({_id: 'drafts.existing-lano'}))
  })

  it('updates a source-managed width when its stored measurement has a different property order', async () => {
    const row = baseRow({sourceGroupKey: 'LANO/BASALTART', styleCode: undefined, rawWidthHintJson: JSON.stringify([{value: 4, unit: 'm'}])})
    const blob = buildBlob({
      widths: [],
      variants: [{variantId: 'camel', colourName: 'Camel', swatchImageUrl: 'https://example.com/swatch-camel.jpg'}],
    })
    delete blob.source.styleCode
    const existing = {
      _id: 'drafts.existing-lano',
      _type: 'product',
      widths: [{_key: 'measurement-3-9878-m', _type: 'measurement', unit: 'm', value: 3.9878}],
      importMeta: {
        contentLocked: false,
        sourceFields: [{
          _key: 'widths',
          _type: 'sourceFieldState',
          path: 'widths',
          valueHash: 'legacy-property-order-hash',
          valueJson: '[{"value":3.9878,"unit":"m","_type":"measurement","_key":"measurement-3-9878-m"}]',
          importedAt: '2026-08-01T00:00:00.000Z',
        }],
      },
      variants: [],
    }
    const client = fakeClient({fetch: vi.fn(async () => ({drafts: [existing], published: [], aliasTargetIds: []}))})

    await publishProductDraft(client, buildSanityIngestionPlan(row, blob, {vendorId: 'lano-com'}), fetchImageOk)

    expect(client.createOrReplace).toHaveBeenCalledWith(expect.objectContaining({
      widths: [{_key: 'measurement-4-m', _type: 'measurement', value: 4, unit: 'm'}],
    }))
  })
})
