// Ported from Ops-Hub's colour-secondary-name.ts (deterministic HSL-bucket "secondary colour
// name" - never an AI call). Buckets a swatch hex into a human name like "grey", "light blue",
// "dark brown", used to populate productVariant.colourFamily from variant.swatchHex.

const BASE_COLOURS = [
  'red',
  'orange',
  'yellow',
  'green',
  'teal',
  'blue',
  'purple',
  'pink',
  'brown',
  'grey',
] as const

type BaseColour = (typeof BASE_COLOURS)[number]

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value))

function parseHexToRgb(hex: string): {r: number; g: number; b: number} | null {
  const value = hex.trim().replace('#', '')
  if (!/^[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(value)) return null

  const full = value.length === 3 ? value.split('').map((c) => `${c}${c}`).join('') : value

  const num = Number.parseInt(full, 16)
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  return {r, g, b}
}

function rgbToHsl(r: number, g: number, b: number): {h: number; s: number; l: number} {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255

  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2

  if (max === min) {
    return {h: 0, s: 0, l}
  }

  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

  let h = 0
  switch (max) {
    case rn:
      h = (gn - bn) / d + (gn < bn ? 6 : 0)
      break
    case gn:
      h = (bn - rn) / d + 2
      break
    default:
      h = (rn - gn) / d + 4
      break
  }
  h /= 6

  return {h: clamp01(h), s: clamp01(s), l: clamp01(l)}
}

function inferBaseColour(h: number, s: number, l: number): BaseColour {
  if (s < 0.12) return 'grey'

  const hue = h * 360

  if (l < 0.2 && hue >= 15 && hue < 55) return 'brown'
  if (hue < 15 || hue >= 345) return 'red'
  if (hue < 45) return 'orange'
  if (hue < 70) return 'yellow'
  if (hue < 165) return 'green'
  if (hue < 195) return 'teal'
  if (hue < 255) return 'blue'
  if (hue < 300) return 'purple'
  return 'pink'
}

function inferPrefix(l: number): 'light' | 'dark' | '' {
  if (l >= 0.72) return 'light'
  if (l <= 0.34) return 'dark'
  return ''
}

function normaliseTokens(value: string): string {
  return value.toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim()
}

/**
 * Validates and normalises a pre-formed secondary colour name string (e.g. "light blue", "dark grey").
 * Returns null when the value does not match a known base colour with optional light/dark prefix.
 */
export function normaliseSecondaryColourName(value: string | null | undefined): string | null {
  if (!value) return null

  const normalized = normaliseTokens(value)
  const parts = normalized.split(' ')

  const maybePrefix = parts[0]
  const hasPrefix = maybePrefix === 'light' || maybePrefix === 'dark'
  const base = hasPrefix ? parts.slice(1).join(' ') : parts.join(' ')

  if (!BASE_COLOURS.includes(base as BaseColour)) return null
  return hasPrefix ? `${maybePrefix} ${base}` : base
}

/**
 * Derives a human-readable secondary colour name from a hex colour code using HSL mapping.
 * Returns a string like "blue", "light green", or "dark brown". Returns null on invalid input.
 */
export function deriveSecondaryColourNameFromHex(swatchHex: string | null | undefined): string | null {
  if (!swatchHex) return null
  const rgb = parseHexToRgb(swatchHex)
  if (!rgb) return null

  const {h, s, l} = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const base = inferBaseColour(h, s, l)
  const prefix = inferPrefix(l)

  return prefix ? `${prefix} ${base}` : base
}
