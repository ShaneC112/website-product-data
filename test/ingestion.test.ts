import { describe, expect, it } from 'vitest'
import { areMeasurementSetsEquivalent, buildSanityIngestionPlan } from '../src/sanity/ingestion.js'
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
      fields: [],
      status: 'ready',
      vendorProductPage: {
        url: 'https://example.com/range',
        pageRole: 'range',
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

// regression coverage for the pre-existing per-colour pricing bug (Phase 02a): buildVariant used to
// apply one row-level price to every colour, even when the match ledger had already resolved
// distinct prices per colour via variantOverrides.
describe('per-colour price resolution', () => {
  it('marks a product as price on request only when neither the product nor any colour has a price', () => {
    const noPrices = buildSanityIngestionPlan(baseRow(), buildBlob({
      variants: [{variantId: 'blue', colourName: 'Blue'}],
    }), {vendorId: 'example'})
    const variantPrice = buildSanityIngestionPlan(baseRow(), buildBlob({
      variants: [{variantId: 'blue', colourName: 'Blue'}],
    }), {
      vendorId: 'example',
      variantOverrides: {blue: {rawPriceMinor: 10000}},
    })

    expect(noPrices.document.priceOnRequest).toBe(true)
    expect(variantPrice.document.priceOnRequest).toBe(false)
  })

  it('resolves distinct prices per colour from variantOverrides instead of the row-level default', () => {
    const row = baseRow({ rawPriceMinor: 9999 })
    const blob = buildBlob({
      variants: [
        { variantId: 'blue', label: 'Blue', colourName: 'Blue' },
        { variantId: 'green', label: 'Green', colourName: 'Green' },
      ],
    })

    const plan = buildSanityIngestionPlan(row, blob, {
      vendorId: 'victoria-carpets',
      variantOverrides: {
        blue: { rawPriceMinor: 10000 },
        green: { rawPriceMinor: 12000 },
      },
    })

    expect(plan.document.variants[0]).toMatchObject({overrides: {price: true}, price: {retailExVat: 100}})
    expect(plan.document.variants[1]).toMatchObject({overrides: {price: true}, price: {retailExVat: 120}})
  })

  it('resolves distinct pack metadata from each matched source row', () => {
    const plan = buildSanityIngestionPlan(baseRow({trade: 'Laminate'}), buildBlob({
      productType: 'Laminate',
      variants: [
        {variantId: 'small-pack', colourName: 'Small pack'},
        {variantId: 'large-pack', colourName: 'Large pack'},
      ],
    }), {
      vendorId: 'example',
      variantOverrides: {
        'small-pack': {packInfoHint: {coverage: {value: 1.8, unit: 'm2'}, piecesPerPack: 8}},
        'large-pack': {packInfoHint: {coverage: {value: 2.4, unit: 'm2'}, piecesPerPack: 10}},
      },
    })

    expect(plan.document.variants.map((variant) => variant.overrides.packInfo)).toEqual([true, true])
    expect(plan.document.variants.map((variant) => variant.packInfo)).toEqual([
      {_type: 'packInfo', coverage: {_type: 'measurement', value: 1.8, unit: 'm2'}, piecesPerPack: 8},
      {_type: 'packInfo', coverage: {_type: 'measurement', value: 2.4, unit: 'm2'}, piecesPerPack: 10},
    ])
  })
})

describe('width parent/child inheritance model', () => {
  it('leaves an identical variant width empty, and populates superset/subset variants with their full resolved set', () => {
    const row = baseRow()
    const blob = buildBlob({
      widths: [{ widthLabel: '2 m' }, { widthLabel: '3 m' }, { widthLabel: '4 m' }],
      variants: [
        { variantId: 'identical', colourName: 'Identical', widths: [{ widthLabel: '2 m' }, { widthLabel: '3 m' }, { widthLabel: '4 m' }] },
        { variantId: 'superset', colourName: 'Superset', widths: [{ widthLabel: '1 m' }, { widthLabel: '2 m' }, { widthLabel: '3 m' }, { widthLabel: '4 m' }] },
        { variantId: 'subset', colourName: 'Subset', widths: [{ widthLabel: '3 m' }, { widthLabel: '4 m' }] },
      ],
    })

    const plan = buildSanityIngestionPlan(row, blob, { vendorId: 'victoria-carpets' })
    const byId = Object.fromEntries(plan.document.variants.map((variant) => [variant.variantId, variant]))

    expect(byId.identical).toMatchObject({overrides: {widths: false}, widths: undefined})
    expect(byId.superset.overrides.widths).toBe(true)
    expect(byId.subset.overrides.widths).toBe(true)
    expect(byId.superset.widths).toEqual([
      { _type: 'measurement', _key: 'measurement-1-m', value: 1, unit: 'm' },
      { _type: 'measurement', _key: 'measurement-2-m', value: 2, unit: 'm' },
      { _type: 'measurement', _key: 'measurement-3-m', value: 3, unit: 'm' },
      { _type: 'measurement', _key: 'measurement-4-m', value: 4, unit: 'm' },
    ])
    expect(byId.subset.widths).toEqual([
      { _type: 'measurement', _key: 'measurement-3-m', value: 3, unit: 'm' },
      { _type: 'measurement', _key: 'measurement-4-m', value: 4, unit: 'm' },
    ])
  })

  // regression coverage for the m2crm width-hint half (Phase 02a task 5): a colour with no
  // page-extracted variant.widths at all must still resolve its own width from rawWidthHint.
  it('treats a unit-normalized-equal rawWidthHint as identical to the range default (stays empty)', () => {
    const row = baseRow()
    const blob = buildBlob({
      widths: [{ widthLabel: '4 m' }],
      variants: [{ variantId: 'natureborn', colourName: 'Natureborn' }],
    })

    const plan = buildSanityIngestionPlan(row, blob, {
      vendorId: 'victoria-carpets',
      variantOverrides: { natureborn: { rawWidthHint: [{ value: 400, unit: 'cm' }] } },
    })

    expect(plan.document.variants[0]).toMatchObject({overrides: {widths: false}, widths: undefined})
  })

  it('populates a variant width from rawWidthHint when it genuinely differs from the range default', () => {
    const row = baseRow()
    const blob = buildBlob({
      widths: [{ widthLabel: '4 m' }],
      variants: [{ variantId: 'natureborn', colourName: 'Natureborn' }],
    })

    const plan = buildSanityIngestionPlan(row, blob, {
      vendorId: 'victoria-carpets',
      variantOverrides: { natureborn: { rawWidthHint: [{ value: 500, unit: 'cm' }] } },
    })

    expect(plan.document.variants[0]).toMatchObject({overrides: {widths: true}, widths: [{ _type: 'measurement', _key: 'measurement-500-cm', value: 500, unit: 'cm' }]})
  })

  it('falls back product.widths to the union of variants own resolved widths when no range-level width is present', () => {
    const row = baseRow()
    const blob = buildBlob({
      widths: [],
      variants: [
        { variantId: 'a', colourName: 'A', widths: [{ widthLabel: '4 m' }] },
        { variantId: 'b', colourName: 'B', widths: [{ widthLabel: '5 m' }] },
      ],
    })

    const plan = buildSanityIngestionPlan(row, blob, { vendorId: 'victoria-carpets' })
    const byId = Object.fromEntries(plan.document.variants.map((variant) => [variant.variantId, variant]))

    expect(plan.document.widths).toEqual([
      { _type: 'measurement', _key: 'measurement-4-m', value: 4, unit: 'm' },
      { _type: 'measurement', _key: 'measurement-5-m', value: 5, unit: 'm' },
    ])
    expect(byId.a.widths).toEqual([{ _type: 'measurement', _key: 'measurement-4-m', value: 4, unit: 'm' }])
    expect(byId.b.widths).toEqual([{ _type: 'measurement', _key: 'measurement-5-m', value: 5, unit: 'm' }])
  })
})

describe('areMeasurementSetsEquivalent', () => {
  it('treats unit-normalized equal sets as equivalent regardless of literal unit', () => {
    expect(areMeasurementSetsEquivalent(
      [{ _type: 'measurement', value: 4, unit: 'm' }],
      [{ _type: 'measurement', value: 400, unit: 'cm' }],
    )).toBe(true)
  })

  it('treats different-length sets as not equivalent', () => {
    expect(areMeasurementSetsEquivalent(
      [{ _type: 'measurement', value: 4, unit: 'm' }],
      [{ _type: 'measurement', value: 4, unit: 'm' }, { _type: 'measurement', value: 5, unit: 'm' }],
    )).toBe(false)
  })
})

// regression coverage for Phase 04's review-model rewrite: buildSanityIngestionPlan must consume
// blob.review's included flags (not rebuild specs/features from a raw dump of every registry
// field), and features must be structured productFeature entries, not plain strings.
describe('specs/features from the review model', () => {
  it('includes only included known/catch-all specifications and features, structured per entry', () => {
    const row = baseRow()
    const blob = buildBlob({ variants: [{ variantId: 'blue', colourName: 'Blue' }] })
    blob.extracted.fields = [
      { field: 'pileWeight', value: { value: 40, unit: 'oz' }, confidence: 0.9 },
      { field: 'waterResistant', value: true, confidence: 0.95 },
      { field: 'additionalSpecifications', value: [], confidence: 0.8 },
      { field: 'additionalFeatures', value: [], confidence: 0.7 },
    ]
    blob.review = {
      knownSpecifications: [
        { key: 'pileWeight', value: { value: 40, unit: 'oz' }, required: true, included: true },
        { key: 'construction', value: 'Woven', required: false, included: false },
      ],
      knownFeatures: [
        { key: 'waterResistant', value: true, required: false, included: true },
        { key: 'antiStatic', value: true, required: false, included: false },
      ],
      additionalSpecifications: [
        { description: 'Backing', value: 'Action Back', included: true },
        { description: 'Ignored extra', value: 'x', included: false },
      ],
      additionalFeatures: [
        { description: 'Acoustic benefit', value: 'Reduces impact noise by 19 dB', included: true },
      ],
    }

    const plan = buildSanityIngestionPlan(row, blob, { vendorId: 'victoria-carpets' })

    expect(plan.document.specs).toEqual([
      expect.objectContaining({ key: 'pileWeight', label: 'Pile Weight', value: '40 oz', source: 'vendor' }),
      expect.objectContaining({ key: 'backing', label: 'Backing', value: 'Action Back', source: 'ai_discovered' }),
    ])
    expect(plan.document.features).toEqual([
      expect.objectContaining({ _type: 'productFeature', key: 'waterResistant', label: 'Water Resistant', source: 'vendor' }),
      expect.objectContaining({
        _type: 'productFeature',
        key: 'acoustic-benefit',
        label: 'Acoustic benefit \u2014 Reduces impact noise by 19 dB',
        source: 'ai_discovered',
      }),
    ])
    expect(plan.document.specs[0]).toMatchObject({key: 'pileWeight', label: 'Pile Weight'})
    expect(plan.document.features[0]).toMatchObject({key: 'waterResistant', label: 'Water Resistant'})
  })

  it('produces an empty specs/features array when the review model has nothing included', () => {
    const row = baseRow()
    const blob = buildBlob({ variants: [{ variantId: 'blue', colourName: 'Blue' }] })

    const plan = buildSanityIngestionPlan(row, blob, { vendorId: 'victoria-carpets' })

    expect(plan.document.specs).toEqual([])
    expect(plan.document.features).toEqual([])
  })

  it('does not duplicate direct Sanity fields in specs or features', () => {
    const blob = buildBlob({variants: [{variantId: 'blue', colourName: 'Blue'}]})
    blob.review = {
      knownSpecifications: [
        {key: 'packInfo', value: '2.2 m2 per pack', required: false, included: true},
        {key: 'dimensions', value: '1200 x 190 mm', required: false, included: true},
      ],
      knownFeatures: [
        {key: 'suitableRooms', value: true, required: false, included: true},
        {key: 'waterResistant', value: true, required: false, included: true},
      ],
      additionalSpecifications: [],
      additionalFeatures: [],
    }

    const plan = buildSanityIngestionPlan(baseRow(), blob, {vendorId: 'victoria-carpets'})

    expect(plan.document.specs).toEqual([expect.objectContaining({key: 'dimensions'})])
    expect(plan.document.features).toEqual([expect.objectContaining({key: 'waterResistant'})])
  })
})

describe('colourFamily derivation', () => {
  it('derives colourFamily deterministically from swatchHex', () => {
    const row = baseRow()
    const blob = buildBlob({ variants: [{ variantId: 'blue', colourName: 'Blue', swatchHex: '#1122ff' }] })

    const plan = buildSanityIngestionPlan(row, blob, { vendorId: 'victoria-carpets' })

    expect(plan.document.variants[0].colourFamily).toBe('blue')
  })

  it('leaves colourFamily undefined when no swatchHex is present', () => {
    const row = baseRow()
    const blob = buildBlob({ variants: [{ variantId: 'blue', colourName: 'Blue' }] })

    const plan = buildSanityIngestionPlan(row, blob, { vendorId: 'victoria-carpets' })

    expect(plan.document.variants[0].colourFamily).toBeUndefined()
  })
})

// regression coverage for Phase 04 task 6: importMeta must never carry gateStatus/detailScore/
// accuracyScore/blockingReasons/needsReview - only a single bucketed importAiConfidence hint.
describe('importAiConfidence bucketing', () => {
  it.each([
    [0.9, 'high'],
    [0.85, 'high'],
    [0.7, 'medium'],
    [0.6, 'medium'],
    [0.5, 'low'],
    [0, 'low'],
  ])('buckets an average field confidence of %s as %s', (confidence, expected) => {
    const row = baseRow()
    const blob = buildBlob({ variants: [{ variantId: 'blue', colourName: 'Blue' }] })
    blob.extracted.fields = [{ field: 'pileWeight', value: 'x', confidence: confidence as number }]

    const plan = buildSanityIngestionPlan(row, blob, { vendorId: 'victoria-carpets' })

    expect(plan.document.importMeta.importAiConfidence).toBe(expected)
  })

  it('never writes gateStatus/detailScore/accuracyScore/blockingReasons/needsReview to the document', () => {
    const row = baseRow()
    const blob = buildBlob({ variants: [{ variantId: 'blue', colourName: 'Blue' }] })

    const plan = buildSanityIngestionPlan(row, blob, { vendorId: 'victoria-carpets' })

    expect(plan.document.importMeta).not.toHaveProperty('gateStatus')
    expect(plan.document.importMeta).not.toHaveProperty('detailScore')
    expect(plan.document.importMeta).not.toHaveProperty('accuracyScore')
    expect(plan.document.importMeta).not.toHaveProperty('blockingReasons')
    expect(plan.document.importMeta).not.toHaveProperty('needsReview')
  })
})

// Phase 09 task 3 scenario (b): a carpet range with swatch + width + mapped trade, exercised
// together end to end (rather than only via the individual unit tests above), producing a
// Sanity draft with colourFamily and product.widths populated, specs/features filtered by
// review.included, and importAiConfidence set to a plausible label.
describe('scenario (b): carpet range with swatch + width + mapped trade produces a full draft', () => {
  it('populates colourFamily, product.widths, review-filtered specs/features, and importAiConfidence together', () => {
    const row = baseRow({ rawPriceMinor: 9999 })
    const blob = buildBlob({
      widths: [{ widthLabel: '4 m' }],
      variants: [{ variantId: 'blue', colourName: 'Blue', swatchHex: '#1122ff', swatchImageUrl: 'https://example.com/swatch-blue.jpg' }],
    })
    blob.extracted.fields = [
      { field: 'pileWeight', value: { value: 40, unit: 'oz' }, confidence: 0.9 },
      { field: 'waterResistant', value: true, confidence: 0.95 },
    ]
    blob.review = {
      knownSpecifications: [{ key: 'pileWeight', value: { value: 40, unit: 'oz' }, required: true, included: true }],
      knownFeatures: [{ key: 'waterResistant', value: true, required: false, included: true }, { key: 'antiStatic', value: true, required: false, included: false }],
      additionalSpecifications: [],
      additionalFeatures: [],
    }

    const plan = buildSanityIngestionPlan(row, blob, { vendorId: 'victoria-carpets' })

    expect(plan.document.productType).toBe('carpet')
    expect(plan.document.variants[0].colourFamily).toBe('blue')
    expect(plan.document.widths).toEqual([{ _type: 'measurement', _key: expect.any(String), value: 4, unit: 'm' }])
    expect(plan.document.specs).toEqual([expect.objectContaining({ key: 'pileWeight', source: 'vendor' })])
    expect(plan.document.features).toEqual([expect.objectContaining({ key: 'waterResistant', source: 'vendor' })])
    expect(['high', 'medium', 'low']).toContain(plan.document.importMeta.importAiConfidence)
  })
})

// Phase 09 task 3 scenario (c): a Laminate/Engineered Wood/LVT range with m2crm box price and
// pack data produces product defaults for both `price` (m2) and `packPrice` (box), plus
// `packInfo` (coverage/pieces/dimensions) from the AI-extracted value - not the m2crm bias hint.
describe('scenario (c): hard-flooring variant carries both price and packPrice plus AI-extracted packInfo', () => {
  it('stores price, packPrice, and packInfo as Laminate defaults when every variant inherits them', () => {
    const row = baseRow({ trade: 'Laminate', rawPriceMinor: 2500, rawBoxPriceMinor: 8999 })
    const blob = buildBlob({ variants: [{ variantId: 'oak', colourName: 'Oak' }] })
    blob.extracted.trade = 'Laminate'
    blob.extracted.fields = [
      { field: 'packInfo', value: { coverage: { value: 2.22, unit: 'm2' }, piecesPerPack: 8 }, confidence: 0.9 },
    ]

    const plan = buildSanityIngestionPlan(row, blob, { vendorId: 'some-vendor' })
    const variant = plan.document.variants[0]

    expect(plan.document.productType).toBe('laminate')
    expect(variant.overrides.price).toBe(false)
    expect(variant.price).toBeUndefined()
    expect(variant.overrides.packPrice).toBe(false)
    expect(variant.overrides.packInfo).toBe(false)
    expect(variant.packPrice).toBeUndefined()
    expect(variant.packInfo).toBeUndefined()
    expect(plan.document.packPrice).toEqual(expect.objectContaining({ unit: 'pack', retailExVat: 89.99 }))
    expect(plan.document.packInfo).toEqual(expect.objectContaining({
      coverage: { _type: 'measurement', value: 2.22, unit: 'm2' },
      piecesPerPack: 8,
    }))
  })
})
