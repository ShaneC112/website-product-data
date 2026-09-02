export const SANITY_PRODUCT_TYPES = [
  'carpet',
  'carpet-tile',
  'laminate',
  'lvt',
  'vinyl',
  'engineered-wood',
  'rug',
  'matting',
  'artificial-grass'
] as const

export type SanityProductType = (typeof SANITY_PRODUCT_TYPES)[number]

// Developer-defined product types with an implemented website category. Category keys are derived
// output values, never independently extracted input: each map entry represents a product type for
// which developers have deliberately created the corresponding website/Sanity support. Types
// omitted from this map intentionally have no Sanity destination until that support is added.
export const SANITY_PRODUCT_TYPE_TO_CATEGORY_KEY = {
  carpet: 'carpets',
  'carpet-tile': 'carpets',
  laminate: 'wood-flooring',
  lvt: 'lvt',
  vinyl: 'vinyl',
  'engineered-wood': 'wood-flooring',
  rug: 'carpets',
} as const satisfies Partial<Record<SanityProductType, string>>

export type SanityCategoryKey = (typeof SANITY_PRODUCT_TYPE_TO_CATEGORY_KEY)[keyof typeof SANITY_PRODUCT_TYPE_TO_CATEGORY_KEY]

// Derived from the product types developers have explicitly mapped above; never add an option here
// independently, because it would be selectable in Studio without a corresponding bridge mapping.
export const SANITY_CATEGORY_KEYS: readonly SanityCategoryKey[] = [
  ...new Set(Object.values(SANITY_PRODUCT_TYPE_TO_CATEGORY_KEY)),
]

export const IMAGE_LAY_DIRECTIONS = [
  'lengthways',
  'widthways',
  'diagonal',
  'herringbone',
  'chevron',
  'basketweave',
  'parquet',
  'monolithic',
  'quarter-turn',
  'brick',
  'ashlar',
  'random',
  'toward-main-light',
  'custom'
] as const

export type ImageLayDirection = (typeof IMAGE_LAY_DIRECTIONS)[number]

export type ImageGenerationProductRegistryEntry = {
  application: 'wall-to-wall' | 'modular' | 'sheet' | 'loose-laid' | 'fitted'
  layDirectionOptions: readonly ImageLayDirection[]
  promptRequirements: readonly string[]
}

export const IMAGE_GENERATION_PRODUCT_REGISTRY = {
  carpet: {
    application: 'wall-to-wall',
    layDirectionOptions: ['lengthways', 'widthways', 'toward-main-light', 'custom'],
    promptRequirements: ['Show fitted wall-to-wall carpet at true physical scale.', 'Keep pile direction and texture consistent across the floor.']
  },
  'carpet-tile': {
    application: 'modular',
    layDirectionOptions: ['monolithic', 'quarter-turn', 'brick', 'ashlar', 'random', 'custom'],
    promptRequirements: ['Show modular carpet tiles at true physical scale.', 'Make tile joins subtle but physically credible for the selected installation pattern.']
  },
  laminate: {
    application: 'fitted',
    layDirectionOptions: ['lengthways', 'widthways', 'diagonal', 'herringbone', 'chevron', 'custom'],
    promptRequirements: ['Show fitted laminate flooring at true plank scale.', 'Preserve credible plank joins and the selected laying direction.']
  },
  lvt: {
    application: 'fitted',
    layDirectionOptions: ['lengthways', 'widthways', 'diagonal', 'herringbone', 'chevron', 'basketweave', 'parquet', 'custom'],
    promptRequirements: ['Show fitted luxury vinyl tile at true plank or tile scale.', 'Preserve credible joins and the selected laying direction.']
  },
  vinyl: {
    application: 'sheet',
    layDirectionOptions: ['lengthways', 'widthways', 'custom'],
    promptRequirements: ['Show fitted sheet vinyl at true pattern scale.', 'Avoid invented plank or tile joins unless they are visible in the product design.']
  },
  'engineered-wood': {
    application: 'fitted',
    layDirectionOptions: ['lengthways', 'widthways', 'diagonal', 'herringbone', 'chevron', 'basketweave', 'parquet', 'custom'],
    promptRequirements: ['Show fitted engineered wood at true board scale.', 'Preserve natural board variation, credible joins, and the selected laying direction.']
  },
  rug: {
    application: 'loose-laid',
    layDirectionOptions: [],
    promptRequirements: ['Show a complete loose-laid rug with visible edges at true physical scale.', 'Do not extend the rug wall-to-wall.']
  },
  matting: {
    application: 'fitted',
    layDirectionOptions: ['lengthways', 'widthways', 'toward-main-light', 'custom'],
    promptRequirements: ['Show fitted matting at true physical scale.', 'Keep the weave and laying direction consistent across the installed area.']
  },
  'artificial-grass': {
    application: 'fitted',
    layDirectionOptions: ['lengthways', 'widthways', 'toward-main-light', 'custom'],
    promptRequirements: ['Show fitted artificial grass at true pile scale.', 'Keep pile direction consistent and avoid visible repeating texture artifacts.']
  }
} as const satisfies Record<SanityProductType, ImageGenerationProductRegistryEntry>

export function isImageLayDirectionAllowed(productType: SanityProductType, layDirection: ImageLayDirection): boolean {
  return (IMAGE_GENERATION_PRODUCT_REGISTRY[productType].layDirectionOptions as readonly ImageLayDirection[]).includes(layDirection)
}

// shared by the bridge gate (Phase 03) and the Studio publish gate (Phase 05) so width/pack-info
// requirements are defined once, not independently duplicated/possibly-drifting between the two.
// rug/matting/artificial-grass borrow another trade's fields today and have no registry trade of
// their own yet, so both requirements are false for them for now - revisit once real per-trade
// data exists for those types.
export type SanityContentRequirements = {
  requiresWidth: boolean
  requiresPackInfo: boolean
}

export const SANITY_CONTENT_REQUIREMENTS = {
  carpet: {requiresWidth: true, requiresPackInfo: false},
  'carpet-tile': {requiresWidth: false, requiresPackInfo: true},
  laminate: {requiresWidth: false, requiresPackInfo: true},
  vinyl: {requiresWidth: false, requiresPackInfo: true},
  lvt: {requiresWidth: false, requiresPackInfo: true},
  'engineered-wood': {requiresWidth: false, requiresPackInfo: true},
  rug: {requiresWidth: false, requiresPackInfo: false},
  matting: {requiresWidth: false, requiresPackInfo: false},
  'artificial-grass': {requiresWidth: false, requiresPackInfo: false},
} as const satisfies Record<SanityProductType, SanityContentRequirements>

// reverse lookup used by the live registry-description component (Phase 04): productType is the
// trade aliased for ecommerce terminology, so a Studio component can map a document's productType
// back to its registry trade and look up a named spec/feature entry's description on demand.
export const SANITY_PRODUCT_TYPE_TO_TRADE = {
  carpet: 'Carpet',
  'carpet-tile': 'Carpet Tile',
  laminate: 'Laminate',
  vinyl: 'Vinyl',
  lvt: 'Vinyl',
  'engineered-wood': 'Engineered Wood',
  rug: 'Carpet',
  matting: undefined,
  'artificial-grass': undefined,
} as const satisfies Record<SanityProductType, string | undefined>

export const SANITY_SUITABLE_ROOMS = [
  'bedroom',
  'sitting-room',
  'living-room',
  'dining-room',
  'hallway',
  'landing',
  'stairs',
  'kitchen',
  'bathroom',
  'office',
  'playroom',
  'conservatory',
  'utility-room'
] as const

export type SanitySuitableRoom = (typeof SANITY_SUITABLE_ROOMS)[number]

const TRADE_TO_SANITY_PRODUCT_TYPE: Record<string, SanityProductType | undefined> = {
  carpet: 'carpet',
  'carpet tile': 'carpet-tile',
  laminate: 'laminate',
  vinyl: 'vinyl',
  'engineered wood': 'engineered-wood',
  hardwood: 'engineered-wood',
  rug: 'rug',
  matting: 'matting',
  'artificial grass': 'artificial-grass'
}

const SOURCE_PRODUCT_TYPE_TO_SANITY_PRODUCT_TYPE: Record<string, SanityProductType | undefined> = {
  carpet: 'carpet',
  rug: 'rug',
  matting: 'matting',
  'artificial grass': 'artificial-grass',
  'carpet tile': 'carpet-tile',
  'carpet tiles': 'carpet-tile',
  'modular carpet': 'carpet-tile',
  'modular tile': 'carpet-tile',
  laminate: 'laminate',
  'laminate flooring': 'laminate',
  lvt: 'lvt',
  'luxury vinyl': 'lvt',
  'luxury vinyl tile': 'lvt',
  'luxury vinyl plank': 'lvt',
  lvp: 'lvt',
  vinyl: 'vinyl',
  'sheet vinyl': 'vinyl',
  'vinyl flooring': 'vinyl',
  'engineered wood': 'engineered-wood',
  'engineered hardwood': 'engineered-wood',
  'wood flooring': 'engineered-wood',
  'hardwood flooring': 'engineered-wood'
}

export function mapTradeToSanityProductType(trade?: string, sourceProductType?: string): SanityProductType | undefined {
  const sourceType = sourceProductType
    ? SOURCE_PRODUCT_TYPE_TO_SANITY_PRODUCT_TYPE[sourceProductType.trim().toLowerCase()]
    : undefined
  if (sourceType) return sourceType
  return trade ? TRADE_TO_SANITY_PRODUCT_TYPE[trade.trim().toLowerCase()] : undefined
}

// This derived key chooses the website render template. Do not guess for a product type whose
// navigation/render category has not been created in Sanity: returning undefined keeps it from
// satisfying the bridge contract and therefore from being published.
export function mapSanityProductTypeToCategoryKey(productType: SanityProductType | undefined): SanityCategoryKey | undefined {
  const categoryKeysByProductType: Partial<Record<SanityProductType, SanityCategoryKey>> = SANITY_PRODUCT_TYPE_TO_CATEGORY_KEY
  return productType ? categoryKeysByProductType[productType] : undefined
}

export function isSanitySuitableRoom(value: string): value is SanitySuitableRoom {
  return (SANITY_SUITABLE_ROOMS as readonly string[]).includes(value)
}