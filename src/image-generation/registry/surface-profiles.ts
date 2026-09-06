import { z } from 'zod'
import { SANITY_PRODUCT_TYPES, type SanityProductType } from '../../registry/product-taxonomy.js'

export const surfaceProfileSchema = z.object({
  key: z.string().trim().min(1),
  version: z.number().int().positive(),
  semanticFingerprint: z.string().trim().min(1),
  productType: z.enum(SANITY_PRODUCT_TYPES),
  materialClass: z.string().trim().min(1),
  surfaceScale: z.string().trim().min(1),
  relief: z.array(z.string().trim().min(1)).default([]),
  sheen: z.array(z.string().trim().min(1)).default([]),
  directionality: z.array(z.string().trim().min(1)).default([]),
  installedVariation: z.array(z.string().trim().min(1)).default([]),
  prohibitedTraits: z.array(z.string().trim().min(1)).default([])
}).strict()

export const surfaceProfileRendererIdentitySchema = z.object({
  key: z.string().trim().min(1),
  version: z.number().int().positive(),
  rendererFingerprint: z.string().trim().min(1)
}).strict()

export const SURFACE_PROFILES = {
  carpet: {
    key: 'carpet-installed-surface',
    version: 1,
    semanticFingerprint: 'surface:carpet-installed-surface:v1',
    productType: 'carpet',
    materialClass: 'textile',
    surfaceScale: 'broadloom',
    relief: ['soft-pile'],
    sheen: ['restrained'],
    directionality: ['pile-direction'],
    installedVariation: ['seam-minimized'],
    prohibitedTraits: ['tile-grid']
  },
  'carpet-tile': {
    key: 'carpet-tile-installed-surface',
    version: 1,
    semanticFingerprint: 'surface:carpet-tile-installed-surface:v1',
    productType: 'carpet-tile',
    materialClass: 'textile',
    surfaceScale: 'modular-tile',
    relief: ['low-pile'],
    sheen: ['restrained'],
    directionality: ['tile-orientation'],
    installedVariation: ['module-repeat'],
    prohibitedTraits: ['broadloom-seam']
  },
  laminate: {
    key: 'laminate-installed-surface',
    version: 1,
    semanticFingerprint: 'surface:laminate-installed-surface:v1',
    productType: 'laminate',
    materialClass: 'hard-surface',
    surfaceScale: 'plank',
    relief: ['subtle-grain'],
    sheen: ['low-sheen'],
    directionality: ['board-direction'],
    installedVariation: ['board-variation'],
    prohibitedTraits: ['sheet-surface']
  },
  lvt: {
    key: 'lvt-installed-surface',
    version: 1,
    semanticFingerprint: 'surface:lvt-installed-surface:v1',
    productType: 'lvt',
    materialClass: 'hard-surface',
    surfaceScale: 'plank-or-tile',
    relief: ['embossed-detail'],
    sheen: ['controlled-sheen'],
    directionality: ['layout-direction'],
    installedVariation: ['repeat-controlled'],
    prohibitedTraits: ['broadloom-seam']
  },
  vinyl: {
    key: 'vinyl-installed-surface',
    version: 1,
    semanticFingerprint: 'surface:vinyl-installed-surface:v1',
    productType: 'vinyl',
    materialClass: 'sheet-surface',
    surfaceScale: 'sheet',
    relief: ['printed-detail'],
    sheen: ['controlled-sheen'],
    directionality: ['roll-direction'],
    installedVariation: ['repeat-controlled'],
    prohibitedTraits: ['invented-plank-joins']
  },
  'engineered-wood': {
    key: 'engineered-wood-installed-surface',
    version: 1,
    semanticFingerprint: 'surface:engineered-wood-installed-surface:v1',
    productType: 'engineered-wood',
    materialClass: 'hard-surface',
    surfaceScale: 'board',
    relief: ['grain-detail'],
    sheen: ['natural-sheen'],
    directionality: ['board-direction'],
    installedVariation: ['board-variation'],
    prohibitedTraits: ['sheet-surface']
  }
} as const satisfies Partial<Record<SanityProductType, z.infer<typeof surfaceProfileSchema>>>

export const SURFACE_PROFILE_RENDERERS = {
  default: {
    key: 'surface-profile-renderer',
    version: 1,
    rendererFingerprint: 'surface-profile-renderer:v1'
  }
} as const