import { describe, expect, it } from 'vitest'
import {
  buildCanonicalVariantKey,
  decodeStorageKey,
  encodeStorageKey,
  normaliseVariantToken,
  normaliseWidth
} from '../src/storage/keys.js'

describe('storage key helpers', () => {
  it('round-trips reversible storage keys including percent and slash', () => {
    const raw = '50%/WOOL'
    expect(encodeStorageKey(raw)).toBe('50%25%2FWOOL')
    expect(decodeStorageKey(encodeStorageKey(raw))).toBe(raw)
    expect(decodeStorageKey(encodeStorageKey('ABINGDON/SFELEMENTS'))).toBe('ABINGDON/SFELEMENTS')
  })

  it('normalises width values to canonical centimetres', () => {
    expect(normaliseWidth('4m')).toBe('400')
    expect(normaliseWidth('400cm')).toBe('400')
    expect(normaliseWidth('400 cm')).toBe('400')
  })

  it('normalises variant tokens', () => {
    expect(normaliseVariantToken(' Storm Grey ')).toBe('storm-grey')
  })

  it('returns no variant for width-only differences', () => {
    expect(buildCanonicalVariantKey({ colourDesign: 'Captivation', width: '4m', distinctColourDesignCount: 1, distinctWidthsForColourDesign: 2 })).toEqual({ kind: 'none', reason: 'width-only' })
  })

  it('builds colour-only variant keys', () => {
    expect(buildCanonicalVariantKey({ colourDesign: 'Storm Grey', distinctColourDesignCount: 2, distinctWidthsForColourDesign: 1 })).toEqual({ kind: 'variant', key: 'v:storm-grey', token: 'storm-grey' })
  })

  it('builds colour and width variant keys when width distinguishes priced variants', () => {
    expect(buildCanonicalVariantKey({ colourDesign: 'Storm Grey', width: '5m', distinctColourDesignCount: 2, distinctWidthsForColourDesign: 2 })).toEqual({ kind: 'variant', key: 'v:storm-grey|w:500', token: 'storm-grey', widthToken: '500' })
  })

  it('flags missing colour/design evidence for review', () => {
    expect(buildCanonicalVariantKey({ colourDesign: '', width: '4m', distinctColourDesignCount: 2, distinctWidthsForColourDesign: 1 })).toEqual({ kind: 'review', reason: 'missing-colour-design' })
  })
})