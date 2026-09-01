import {describe, expect, it} from 'vitest'
import {evaluateStudioPublishReadiness} from '../src/sanity/publicationGate.js'

function baseVariant(overrides: Record<string, unknown> = {}) {
  return {
    colourName: 'Blue',
    colourFamily: 'blue',
    hex: '#1122ff',
    swatchImage: {asset: {_type: 'reference', _ref: 'image-abc'}},
    ...overrides,
  }
}

function baseProduct(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Burford Twist',
    shortDescription: 'A soft twist carpet.',
    productType: 'carpet',
    widths: [{value: 4, unit: 'm'}],
    variants: [baseVariant()],
    ...overrides,
  }
}

describe('evaluateStudioPublishReadiness', () => {
  it('passes a fully-valid product', () => {
    expect(evaluateStudioPublishReadiness(baseProduct())).toEqual([])
  })

  it('never references gateStatus/detailScore/accuracyScore/blockingReasons/needsReview', () => {
    const reasons = evaluateStudioPublishReadiness({})
    expect(reasons.join(' ')).not.toMatch(/gate status|detail score|accuracy score|pipeline/i)
  })

  it('flags a missing name, shortDescription, and productType', () => {
    const reasons = evaluateStudioPublishReadiness(baseProduct({name: undefined, shortDescription: undefined, productType: undefined}))
    expect(reasons).toEqual(expect.arrayContaining([
      'A product name is required.',
      'A short description is required.',
      'A product type is required.',
    ]))
  })

  it('flags a variant missing colourName, hex, colourFamily, or an image', () => {
    const reasons = evaluateStudioPublishReadiness(baseProduct({
      variants: [baseVariant({colourName: undefined, hex: undefined, colourFamily: undefined, swatchImage: undefined, primaryImage: undefined})],
    }))
    expect(reasons).toEqual(expect.arrayContaining([
      'Every variant requires a colour name.',
      'Every variant requires a hex colour.',
      'Every variant requires a colour family.',
      'Every variant requires a product image or swatch.',
    ]))
  })

  it('accepts a variant with only a primaryImage (no swatch)', () => {
    const reasons = evaluateStudioPublishReadiness(baseProduct({
      variants: [baseVariant({swatchImage: undefined, primaryImage: {asset: {_type: 'reference', _ref: 'image-def'}}})],
    }))
    expect(reasons).toEqual([])
  })

  it('fails a Carpet product with no width', () => {
    const reasons = evaluateStudioPublishReadiness(baseProduct({widths: []}))
    expect(reasons).toContain('At least one available width is required for this product type.')
  })

  it('fails a Carpet Tile/Laminate/Vinyl/Engineered Wood product with no packInfo/packPrice', () => {
    for (const productType of ['carpet-tile', 'laminate', 'vinyl', 'engineered-wood']) {
      const reasons = evaluateStudioPublishReadiness(baseProduct({productType, widths: [], variants: [baseVariant()]}))
      expect(reasons).toContain('At least one variant requires pack/box info for this product type.')
    }
  })

  it('passes a Carpet Tile product once a variant has packInfo', () => {
    const reasons = evaluateStudioPublishReadiness(baseProduct({
      productType: 'carpet-tile',
      widths: [],
      variants: [baseVariant({packInfo: {coverage: {value: 20, unit: 'm2'}}})],
    }))
    expect(reasons).toEqual([])
  })

  it('passes an LVT product with no width - width is not required for LVT', () => {
    const reasons = evaluateStudioPublishReadiness(baseProduct({
      productType: 'lvt',
      widths: [],
      variants: [baseVariant({packInfo: {coverage: {value: 20, unit: 'm2'}}})],
    }))
    expect(reasons).toEqual([])
  })
})
