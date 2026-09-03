import { createHash } from 'crypto'

const KEY_ILLEGAL = /[\u0000-\u001F\u007F-\u009F/\\#?%]/g

export function computeHash(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

export function encodeStorageKey(raw: string): string {
  return raw.replace(KEY_ILLEGAL, (ch) => `%${ch.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`)
}

export function decodeStorageKey(encoded: string): string {
  return encoded.replace(/%([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
}

export function normaliseVariantToken(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function normalizeStyleCode(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '-')
}

export function normaliseWidth(value: string): string {
  const text = value.toLowerCase().replace(/\s+/g, '')
  const match = text.match(/^(\d+(?:\.\d+)?)(mm|cm|m)?$/)
  if (!match) {
    return normaliseVariantToken(value)
  }

  const amount = parseFloat(match[1])
  const unit = match[2]
  const centimetres = unit === 'mm' ? amount / 10 : unit === 'm' ? amount * 100 : amount
  return String(Math.round(centimetres))
}

export function buildStyleCodeStorageKey(styleCodeRaw: string): string {
  return encodeStorageKey(styleCodeRaw)
}

export function buildCrawlProductDetailPartitionKey(sourceGroupKey: string): string {
  return buildSourceGroupStorageKey(sourceGroupKey)
}

export function buildSourceGroupStorageKey(sourceGroupKey: string): string {
  return encodeStorageKey(sourceGroupKey)
}

export function buildCanonicalSourceRowKey(m2crmUuid: string): string {
  return m2crmUuid.trim()
}

export type CanonicalVariantKeyResult =
  | { kind: 'none'; reason: 'width-only' }
  | { kind: 'review'; reason: 'missing-colour-design' }
  | { kind: 'variant'; key: string; token: string; widthToken?: string }

export function buildCanonicalVariantKey(input: {
  colourDesign?: string | null
  width?: string | null
  distinctColourDesignCount: number
  distinctWidthsForColourDesign?: number
}): CanonicalVariantKeyResult {
  if (input.distinctColourDesignCount <= 1) {
    return { kind: 'none', reason: 'width-only' }
  }

  const token = normaliseVariantToken(input.colourDesign ?? '')
  if (!token) {
    return { kind: 'review', reason: 'missing-colour-design' }
  }

  const widthCount = input.distinctWidthsForColourDesign ?? 0
  if (widthCount > 1) {
    const widthToken = normaliseWidth(input.width ?? '')
    return { kind: 'variant', key: `v:${token}|w:${widthToken}`, token, widthToken }
  }

  return { kind: 'variant', key: `v:${token}`, token }
}

export function escapeODataString(value: string): string {
  return value.replace(/'/g, "''")
}
