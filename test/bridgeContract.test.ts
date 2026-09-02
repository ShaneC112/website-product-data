import {describe, expect, it} from 'vitest'
import {evaluateBridgeEligibility, sanityBridgeProductSchema} from '../src/sanity/bridgeContract.schema.js'
import {SANITY_CONTENT_REQUIREMENTS, SANITY_PRODUCT_TYPE_TO_TRADE, SANITY_PRODUCT_TYPES} from '../src/registry/product-taxonomy.js'

function baseVariant(overrides: Record<string, unknown> = {}) {
  return {
    variantId: 'blue',
    colourName: 'Blue',
    colourFamily: 'blue',
    hex: '#1122ff',
    overrides: {price: false, packPrice: false, packInfo: false, widths: false, suitableRooms: false, pattern: false, specs: false},
    swatchImage: {asset: {_type: 'reference', _ref: 'image-abc'}},
    ...overrides,
  }
}

function baseDraft(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Burford Twist',
    slug: {current: 'burford-twist'},
    productType: 'carpet',
    categoryKey: 'carpets',
    variants: [baseVariant()],
    widths: [{value: 4, unit: 'm'}],
    importMeta: {
      externalId: 'ext-1',
      vendorId: 'victoria-carpets',
      sourceUrl: 'https://example.com/range',
      importedAt: '2026-08-01T00:00:00.000Z',
    },
    ...overrides,
  }
}

describe('evaluateBridgeEligibility', () => {
  it('passes a fully-valid draft', () => {
    expect(evaluateBridgeEligibility(baseDraft())).toEqual({eligible: true, reasons: []})
  })

  it('fails with the swatch reason when no variant has a swatch image source', () => {
    const draft = baseDraft({variants: [baseVariant({swatchImage: undefined})]})
    const result = evaluateBridgeEligibility(draft)
    expect(result.eligible).toBe(false)
    expect(result.reasons).toContain('missing_swatch_image')
  })

  it('fails with the trade reason when productType is not a mapped SanityProductType', () => {
    const draft = baseDraft({productType: 'not-a-real-type'})
    const result = evaluateBridgeEligibility(draft)
    expect(result.eligible).toBe(false)
    expect(result.reasons).toContain('trade_unmapped')
  })

  it('fails with the width reason for a carpet product with no width anywhere', () => {
    const draft = baseDraft({widths: [], variants: [baseVariant()]})
    const result = evaluateBridgeEligibility(draft)
    expect(result.eligible).toBe(false)
    expect(result.reasons).toContain('missing_required_width')
  })

  it('passes a non-carpet product with no width when pack data is present', () => {
    const draft = baseDraft({
      productType: 'lvt',
      widths: [],
      variants: [baseVariant({overrides: {price: false, packPrice: false, packInfo: true, widths: false, suitableRooms: false, pattern: false, specs: false}, packInfo: {coverage: {value: 2.2, unit: 'm2'}}})],
    })
    expect(evaluateBridgeEligibility(draft)).toEqual({eligible: true, reasons: []})
  })

  it.each(['carpet-tile', 'laminate', 'vinyl', 'lvt', 'engineered-wood'])(
    'fails with the pack reason for %s when no variant has pack data',
    (productType) => {
      const result = evaluateBridgeEligibility(baseDraft({productType, widths: []}))
      expect(result.eligible).toBe(false)
      expect(result.reasons).toContain('missing_required_pack_info')
    },
  )

  it('accepts pack price as sufficient pack data', () => {
    const packPrice = {currency: 'GBP', unit: 'pack', retailExVat: 10, vatRate: 0.2, retailIncVat: 12}
    expect(evaluateBridgeEligibility(baseDraft({
      productType: 'laminate',
      widths: [],
      variants: [baseVariant({overrides: {price: false, packPrice: true, packInfo: false, widths: false, suitableRooms: false, pattern: false, specs: false}, packPrice})],
    }))).toEqual({eligible: true, reasons: []})
  })
})

describe('sanityBridgeProductSchema', () => {
  it('accepts a minimal valid draft with only required fields', () => {
    const minimal = {
      name: 'Minimal',
      slug: {current: 'minimal'},
      productType: 'carpet',
      categoryKey: 'carpets',
      variants: [baseVariant({swatchImage: undefined})],
      importMeta: {
        externalId: 'ext-1',
        vendorId: 'vendor',
        sourceUrl: 'https://example.com',
        importedAt: '2026-08-01T00:00:00.000Z',
      },
    }
    expect(sanityBridgeProductSchema.safeParse(minimal).success).toBe(true)
  })

  it('requires at least one variant', () => {
    const draft = baseDraft({variants: []})
    expect(sanityBridgeProductSchema.safeParse(draft).success).toBe(false)
  })
})

// exhaustiveness is also enforced at compile time via `satisfies Record<SanityProductType, ...>`
// on both tables - this is the runtime companion so a missing entry fails a test, not just a build.
describe('SANITY_CONTENT_REQUIREMENTS / SANITY_PRODUCT_TYPE_TO_TRADE exhaustiveness', () => {
  it('has an entry for every SanityProductType', () => {
    for (const productType of SANITY_PRODUCT_TYPES) {
      expect(SANITY_CONTENT_REQUIREMENTS[productType]).toBeDefined()
      expect(SANITY_PRODUCT_TYPE_TO_TRADE).toHaveProperty(productType)
    }
  })

  it('only requires width for carpet', () => {
    for (const productType of SANITY_PRODUCT_TYPES) {
      expect(SANITY_CONTENT_REQUIREMENTS[productType].requiresWidth).toBe(productType === 'carpet')
    }
  })

  it('requires pack info for carpet-tile/laminate/vinyl/lvt/engineered-wood only', () => {
    const requiresPackInfoTypes = ['carpet-tile', 'laminate', 'vinyl', 'lvt', 'engineered-wood']
    for (const productType of SANITY_PRODUCT_TYPES) {
      expect(SANITY_CONTENT_REQUIREMENTS[productType].requiresPackInfo).toBe(requiresPackInfoTypes.includes(productType))
    }
  })
})
