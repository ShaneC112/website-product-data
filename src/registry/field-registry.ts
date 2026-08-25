import { z } from 'zod'

export const fieldRequiredLevelSchema = z.enum(['required', 'recommended', 'optional'])
export const fieldValueTypeSchema = z.enum(['text', 'boolean', 'measurement', 'measurement-list', 'text-list'])
export const registryPageRoleSchema = z.enum(['range', 'variant', 'single'])
export const variantFieldRequiredLevelSchema = z.enum(['required', 'recommended', 'optional'])
export const fieldCategorySchema = z.enum(['identity', 'specifications', 'features', 'additional', 'meta'])

const registryJsonPrimitiveSchema = z.union([z.string(), z.number(), z.boolean(), z.null()])
export const registryJsonValueSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    registryJsonPrimitiveSchema,
    z.array(registryJsonValueSchema),
    z.record(z.string(), registryJsonValueSchema)
  ])
)

export const registryFieldValueSchema = z.object({
  field: z.string().trim().min(1),
  value: registryJsonValueSchema,
  confidence: z.number().min(0).max(1)
})

export const variantRegistryFieldValueSchema = z.object({
  field: z.string().trim().min(1),
  value: registryJsonValueSchema,
  confidence: z.number().min(0).max(1)
})

export const fieldRegistryEntrySchema = z.object({
  field: z.string().trim().min(1),
  trade: z.string().trim().min(1),
  description: z.string().trim().min(1),
  requiredLevel: fieldRequiredLevelSchema,
  applicableTo: z.array(registryPageRoleSchema).min(1),
  confidenceThreshold: z.number().min(0).max(1),
  publishBlockOnLowConfidence: z.boolean(),
  valueType: fieldValueTypeSchema,
  category: fieldCategorySchema,
  publishable: z.boolean(),
  exampleValue: z.string().trim().min(1).optional(),
  promptHint: z.string().trim().min(1).optional(),
  allowedValues: z.array(z.string().trim().min(1)).optional()
})

export const variantFieldRegistryEntrySchema = z.object({
  field: z.string().trim().min(1),
  description: z.string().trim().min(1),
  requiredLevel: variantFieldRequiredLevelSchema,
  confidenceThreshold: z.number().min(0).max(1),
  publishBlockOnLowConfidence: z.boolean(),
  valueType: fieldValueTypeSchema
})

export type FieldRequiredLevel = z.infer<typeof fieldRequiredLevelSchema>
export type FieldValueType = z.infer<typeof fieldValueTypeSchema>
export type RegistryPageRole = z.infer<typeof registryPageRoleSchema>
export type FieldCategory = z.infer<typeof fieldCategorySchema>
export type RegistryFieldValue = z.infer<typeof registryFieldValueSchema>
export type FieldRegistryEntry = z.infer<typeof fieldRegistryEntrySchema>
export type VariantFieldRequiredLevel = z.infer<typeof variantFieldRequiredLevelSchema>
export type VariantRegistryFieldValue = z.infer<typeof variantRegistryFieldValueSchema>
export type VariantFieldRegistryEntry = z.infer<typeof variantFieldRegistryEntrySchema>

const ALL_PAGE_ROLES: RegistryPageRole[] = ['range', 'variant', 'single']

function createEntry(
  trade: string,
  field: string,
  description: string,
  requiredLevel: FieldRequiredLevel,
  valueType: FieldValueType,
  options?: {
    applicableTo?: RegistryPageRole[]
    confidenceThreshold?: number
    publishBlockOnLowConfidence?: boolean
    category?: FieldCategory
    publishable?: boolean
    exampleValue?: string
    promptHint?: string
    allowedValues?: string[]
  }
): FieldRegistryEntry {
  return {
    trade,
    field,
    description,
    requiredLevel,
    applicableTo: options?.applicableTo ?? ALL_PAGE_ROLES,
    confidenceThreshold: options?.confidenceThreshold ?? 0.7,
    publishBlockOnLowConfidence:
      options?.publishBlockOnLowConfidence ?? requiredLevel === 'required',
    valueType,
    category: options?.category ?? 'specifications',
    publishable: options?.publishable ?? true,
    exampleValue: options?.exampleValue,
    promptHint: options?.promptHint,
    allowedValues: options?.allowedValues
  }
}

function createVariantEntry(
  field: string,
  description: string,
  requiredLevel: VariantFieldRequiredLevel,
  valueType: FieldValueType,
  options?: {
    confidenceThreshold?: number
    publishBlockOnLowConfidence?: boolean
  }
): VariantFieldRegistryEntry {
  return {
    field,
    description,
    requiredLevel,
    confidenceThreshold: options?.confidenceThreshold ?? 0.7,
    publishBlockOnLowConfidence:
      options?.publishBlockOnLowConfidence ?? requiredLevel === 'required',
    valueType
  }
}

export const fieldRegistry: FieldRegistryEntry[] = [
  // ── Carpet ──────────────────────────────────────────────────────────────────
  createEntry('Carpet', 'title', 'Primary product or range name shown in headings, titles, or hero content.', 'required', 'text', { category: 'identity', exampleValue: 'Royal Twist 40oz' }),
  createEntry('Carpet', 'description', 'Concise commercial description summarising the product from meta description, intro copy, or lead paragraph.', 'required', 'text', { category: 'identity' }),
  createEntry('Carpet', 'productType', 'Concise flooring category such as carpet when explicitly stated.', 'required', 'text', { category: 'identity', exampleValue: 'carpet', allowedValues: ['carpet', 'rug', 'matting', 'artificial grass'] }),
  createEntry('Carpet', 'features', 'Performance or treatment claims evidenced in the page, such as Moth Resistant, Stain Resistant, Bleach Cleanable, or Family Friendly.', 'required', 'text-list', { category: 'features' }),
  createEntry('Carpet', 'pileHeight', 'Explicit pile height measurement for carpet products.', 'recommended', 'measurement', { exampleValue: '8 mm' }),
  createEntry('Carpet', 'pileWeight', 'Explicit pile weight text when present in carpet specifications.', 'recommended', 'text', { exampleValue: '1700 g/m²', promptHint: 'Look for values in g/m² or g/m2 in specification tables. May be labelled pile weight g/m² or pile weight g/m2.' }),
  createEntry('Carpet', 'backing', 'Backing material or construction when explicitly stated in carpet specifications.', 'recommended', 'text', { exampleValue: 'Action Back', promptHint: 'Common values: Action Back, Hessian Back, Felt Back, Latex Back, Synthetic Back. Usually found in a specification table.' }),
  createEntry('Carpet', 'construction', 'Construction text such as pile style and tufting method when explicitly stated.', 'recommended', 'text', { exampleValue: 'Loop Pile', promptHint: 'Common values: Loop Pile, Cut Pile, Cut and Loop, Tufted, Woven, Flatwoven. May appear in a spec table or product description.' }),
  createEntry('Carpet', 'pileFibreComposition', 'Pile fibre composition text such as wool content, yarn ply, or dye treatment when explicitly stated.', 'recommended', 'text', { exampleValue: '100% Pure New Wool' }),
  createEntry('Carpet', 'gauge', 'Gauge text when explicitly stated.', 'recommended', 'text', { exampleValue: '10 gauge', promptHint: 'May appear as a standalone gauge value, as part of construction (e.g. 1/10 gauge), or labelled Gauge in a spec table.' }),
  createEntry('Carpet', 'stitchCount', 'Number of stitches per square metre when explicitly stated.', 'recommended', 'text', { exampleValue: '252,000 per m²' }),
  createEntry('Carpet', 'width', 'Available roll width or width range text when explicitly stated.', 'recommended', 'text', { exampleValue: '400 cm', promptHint: 'Prefer standalone roll width statements. Return the raw width value only, not a full dimension set. May be labelled Width in cm or Available widths.' }),
  createEntry('Carpet', 'totalWeight', 'Overall carpet weight including backing when explicitly stated.', 'recommended', 'text', { exampleValue: '2320 g/m²' }),
  createEntry('Carpet', 'fireRating', 'Fire classification when explicitly stated.', 'recommended', 'text', { exampleValue: 'Cfl-s1', promptHint: 'European fire classification codes. Common values: Bfl-s1, Bfl-s2, Cfl-s1, Cfl-s2, Dfl-s1. May appear in a spec table or accreditation section.' }),
  createEntry('Carpet', 'totalHeight', 'Overall carpet height including backing when explicitly stated.', 'optional', 'measurement', { exampleValue: '9 mm' }),
  createEntry('Carpet', 'mothResistant', 'Boolean true when moth resistant or moth proofed is explicitly stated.', 'optional', 'boolean', { category: 'features' }),
  createEntry('Carpet', 'stainResistant', 'Boolean true when stain resistant or stain protection is explicitly stated.', 'optional', 'boolean', { category: 'features' }),
  createEntry('Carpet', 'antiStatic', 'Boolean true when anti-static or electrostatic protection is explicitly stated.', 'optional', 'boolean', { category: 'features' }),
  createEntry('Carpet', 'suitabilityUfH', 'Boolean true when suitable for underfloor heating is explicitly stated.', 'optional', 'boolean', { category: 'features' }),
  createEntry('Carpet', 'dimensions', 'Roll dimensions such as width and optional length when explicitly stated.', 'optional', 'text'),
  createEntry('Carpet', 'measurements', 'Other explicit measurements such as roll width or length.', 'optional', 'measurement-list'),
  createEntry('Carpet', 'additionalSpecifications', 'Catch-all extra specification rows clearly evidenced on the vendor page that do not map to any named registry field. Do not include values already captured in named fields such as pileHeight, backing, construction, gauge, or width.', 'optional', 'text', { category: 'additional' }),
  createEntry('Carpet', 'additionalFeatures', 'Catch-all extra feature rows clearly evidenced on the vendor page that do not map to any named registry field. Do not include values already captured in named fields such as features, mothResistant, or stainResistant.', 'optional', 'text', { category: 'additional' }),
  createEntry('Carpet', 'patternEvidence', 'Pattern repeat or drop evidence when explicitly stated.', 'optional', 'text', { promptHint: 'Look for pattern repeat or drop values often labelled Horizontal Repeat, Vertical Repeat, Pattern Drop, or Horizontal Drop.' }),
  createEntry('Carpet', 'variantCaptureCount', 'Count of captured vendor variants when evidenced by the capture manifest.', 'optional', 'text', { category: 'meta', publishable: false }),

  // ── Carpet Tile ─────────────────────────────────────────────────────────────
  createEntry('Carpet Tile', 'title', 'Primary product or range name shown in headings, titles, or hero content.', 'required', 'text', { category: 'identity', exampleValue: 'Tessera Create Space' }),
  createEntry('Carpet Tile', 'description', 'Concise commercial description summarising the product from meta description, intro copy, or lead paragraph.', 'required', 'text', { category: 'identity' }),
  createEntry('Carpet Tile', 'productType', 'Concise flooring category such as carpet tile when explicitly stated.', 'required', 'text', { category: 'identity', exampleValue: 'carpet tile', allowedValues: ['carpet tile', 'carpet tiles', 'modular carpet', 'modular tile'] }),
  createEntry('Carpet Tile', 'features', 'Performance or treatment claims evidenced in the page, such as Moth Resistant, Stain Resistant, or Anti-static.', 'required', 'text-list', { category: 'features' }),
  createEntry('Carpet Tile', 'pileHeight', 'Explicit pile height measurement for carpet tile products.', 'recommended', 'measurement', { exampleValue: '4.5 mm' }),
  createEntry('Carpet Tile', 'backing', 'Backing material or construction when explicitly stated in carpet tile specifications.', 'recommended', 'text', { exampleValue: 'Bitumen', promptHint: 'Common values: Bitumen, PVC, Cushioned, Hardback. Usually found in a specification table.' }),
  createEntry('Carpet Tile', 'gauge', 'Gauge text when explicitly stated.', 'recommended', 'text', { exampleValue: '1/10 gauge', promptHint: 'May appear as gauge, 1/10 gauge, or inline with construction details in a spec table.' }),
  createEntry('Carpet Tile', 'dimensions', 'Tile dimensions when explicitly stated.', 'recommended', 'text', { exampleValue: '500 x 500 mm', promptHint: 'Return the full tile dimensions including both length and width.' }),
  createEntry('Carpet Tile', 'totalWeight', 'Overall carpet tile weight including backing when explicitly stated.', 'recommended', 'text', { exampleValue: '5000 g/m²' }),
  createEntry('Carpet Tile', 'fireRating', 'Fire classification when explicitly stated.', 'recommended', 'text', { exampleValue: 'Bfl-s1', promptHint: 'European fire classification codes. Common values: Bfl-s1, Cfl-s1, Cfl-s2. May appear in a spec table or accreditation section.' }),
  createEntry('Carpet Tile', 'totalHeight', 'Overall carpet tile height including backing when explicitly stated.', 'optional', 'measurement', { exampleValue: '7 mm' }),
  createEntry('Carpet Tile', 'mothResistant', 'Boolean true when moth resistant or moth proofed is explicitly stated.', 'optional', 'boolean', { category: 'features' }),
  createEntry('Carpet Tile', 'stainResistant', 'Boolean true when stain resistant or stain protection is explicitly stated.', 'optional', 'boolean', { category: 'features' }),
  createEntry('Carpet Tile', 'antiStatic', 'Boolean true when anti-static or electrostatic protection is explicitly stated.', 'optional', 'boolean', { category: 'features' }),
  createEntry('Carpet Tile', 'suitabilityUfH', 'Boolean true when suitable for underfloor heating is explicitly stated.', 'optional', 'boolean', { category: 'features' }),
  createEntry('Carpet Tile', 'measurements', 'Other explicit measurements such as tile size or pack dimensions.', 'optional', 'measurement-list'),
  createEntry('Carpet Tile', 'additionalSpecifications', 'Catch-all extra specification rows clearly evidenced on the vendor page that do not map to any named registry field. Do not include values already captured in named fields such as pileHeight, backing, gauge, or dimensions.', 'optional', 'text', { category: 'additional' }),
  createEntry('Carpet Tile', 'additionalFeatures', 'Catch-all extra feature rows clearly evidenced on the vendor page that do not map to any named registry field. Do not include values already captured in named fields such as features, mothResistant, or antiStatic.', 'optional', 'text', { category: 'additional' }),
  createEntry('Carpet Tile', 'patternEvidence', 'Pattern repeat or drop evidence when explicitly stated.', 'optional', 'text', { promptHint: 'Look for pattern repeat or drop values often labelled Horizontal Repeat, Vertical Repeat, or Pattern Drop.' }),
  createEntry('Carpet Tile', 'variantCaptureCount', 'Count of captured vendor variants when evidenced by the capture manifest.', 'optional', 'text', { category: 'meta', publishable: false }),

  // ── Laminate ─────────────────────────────────────────────────────────────────
  createEntry('Laminate', 'title', 'Primary product or range name shown in headings, titles, or hero content.', 'required', 'text', { category: 'identity', exampleValue: 'Pergo Original Excellence' }),
  createEntry('Laminate', 'description', 'Concise commercial description summarising the product from meta description, intro copy, or lead paragraph.', 'required', 'text', { category: 'identity' }),
  createEntry('Laminate', 'productType', 'Concise flooring category such as laminate when explicitly stated.', 'required', 'text', { category: 'identity', exampleValue: 'laminate', allowedValues: ['laminate', 'laminate flooring', 'laminate floor', 'laminate wood'] }),
  createEntry('Laminate', 'thickness', 'Explicit laminate thickness measurement.', 'required', 'measurement', { exampleValue: '12 mm' }),
  createEntry('Laminate', 'dimensions', 'Plank dimensions when explicitly present.', 'required', 'text', { exampleValue: '1200 x 190 mm', promptHint: 'Return the full plank dimensions including both length and width.' }),
  createEntry('Laminate', 'packInfo', 'Canonical pack details including coverage, pieces per pack, and pack dimensions when explicitly present.', 'recommended', 'text', { exampleValue: '8 planks, 2.22 m² per pack', promptHint: 'Look for coverage per pack (m²), number of planks per pack, and pack dimensions. May appear as a table or inline text.' }),
  createEntry('Laminate', 'waterResistant', 'Boolean true when water resistant or waterproof laminate performance is explicitly stated.', 'recommended', 'boolean', { category: 'features' }),
  createEntry('Laminate', 'suitabilityUfH', 'Boolean true when suitable for underfloor heating is explicitly stated.', 'recommended', 'boolean', { category: 'features' }),
  createEntry('Laminate', 'measurements', 'Other explicit measurements such as plank width, plank length, or pack dimensions.', 'optional', 'measurement-list'),
  createEntry('Laminate', 'additionalSpecifications', 'Catch-all extra specification rows clearly evidenced on the vendor page that do not map to any named registry field. Do not include values already captured in named fields such as thickness or dimensions.', 'optional', 'text', { category: 'additional' }),
  createEntry('Laminate', 'additionalFeatures', 'Catch-all extra feature rows clearly evidenced on the vendor page that do not map to any named registry field. Do not include values already captured in named fields such as waterResistant or suitabilityUfH.', 'optional', 'text', { category: 'additional' }),
  createEntry('Laminate', 'variantCaptureCount', 'Count of captured vendor variants when evidenced by the capture manifest.', 'optional', 'text', { category: 'meta', publishable: false }),

  // ── Vinyl ────────────────────────────────────────────────────────────────────
  createEntry('Vinyl', 'title', 'Primary product or range name shown in headings, titles, or hero content.', 'required', 'text', { category: 'identity', exampleValue: 'Karndean Knight Tile' }),
  createEntry('Vinyl', 'description', 'Concise commercial description summarising the product from meta description, intro copy, or lead paragraph.', 'required', 'text', { category: 'identity' }),
  createEntry('Vinyl', 'productType', 'Concise flooring category such as sheet vinyl or vinyl tile when explicitly stated.', 'required', 'text', { category: 'identity', exampleValue: 'luxury vinyl tile', allowedValues: ['vinyl', 'sheet vinyl', 'vinyl tile', 'vinyl plank', 'lvt', 'luxury vinyl tile', 'luxury vinyl plank', 'luxury vinyl', 'vinyl flooring', 'lvp'] }),
  createEntry('Vinyl', 'thickness', 'Explicit vinyl thickness measurement.', 'required', 'measurement', { exampleValue: '2.5 mm' }),
  createEntry('Vinyl', 'dimensions', 'Roll or tile dimensions when explicitly stated.', 'required', 'text', { exampleValue: '457 x 457 mm', promptHint: 'Return the full dimensions including both length and width. For rolls, return the roll width.' }),
  createEntry('Vinyl', 'look', 'Visual layout or style when explicitly stated.', 'recommended', 'text', { exampleValue: 'plank', promptHint: 'Common values: plank, tile, herringbone, chevron, large format, stone effect, wood effect, parquet.', allowedValues: ['plank', 'tile', 'herringbone', 'chevron', 'large format', 'stone', 'stone effect', 'wood', 'wood effect', 'parquet'] }),
  createEntry('Vinyl', 'waterResistant', 'Boolean true when water resistant or waterproof performance is explicitly stated.', 'recommended', 'boolean', { category: 'features' }),
  createEntry('Vinyl', 'measurements', 'Other explicit measurements such as plank width, tile size, or roll width.', 'optional', 'measurement-list'),
  createEntry('Vinyl', 'additionalSpecifications', 'Catch-all extra specification rows clearly evidenced on the vendor page that do not map to any named registry field. Do not include values already captured in named fields such as thickness, dimensions, or look.', 'optional', 'text', { category: 'additional' }),
  createEntry('Vinyl', 'additionalFeatures', 'Catch-all extra feature rows clearly evidenced on the vendor page that do not map to any named registry field. Do not include values already captured in named fields such as waterResistant.', 'optional', 'text', { category: 'additional' }),
  createEntry('Vinyl', 'variantCaptureCount', 'Count of captured vendor variants when evidenced by the capture manifest.', 'optional', 'text', { category: 'meta', publishable: false }),

  // ── Unknown ──────────────────────────────────────────────────────────────────
  createEntry('Unknown', 'title', 'Primary product or range name shown in headings, titles, or hero content.', 'required', 'text', { category: 'identity' }),
  createEntry('Unknown', 'description', 'Concise commercial description summarising the product from meta description, intro copy, or lead paragraph.', 'required', 'text', { category: 'identity' }),
  createEntry('Unknown', 'productType', 'Concise flooring category when explicitly stated.', 'optional', 'text', { category: 'identity' }),
  createEntry('Unknown', 'measurements', 'Explicit measurements found in the page.', 'optional', 'measurement-list'),
  createEntry('Unknown', 'pileHeight', 'Explicit pile height measurement when present.', 'optional', 'measurement', { exampleValue: '8 mm' }),
  createEntry('Unknown', 'thickness', 'Explicit thickness measurement when present.', 'optional', 'measurement', { exampleValue: '12 mm' }),
  createEntry('Unknown', 'packInfo', 'Canonical pack details when present.', 'optional', 'text'),
  createEntry('Unknown', 'dimensions', 'Structured product dimensions when present.', 'optional', 'text'),
  createEntry('Unknown', 'look', 'Visual layout or style when present.', 'optional', 'text'),
  createEntry('Unknown', 'additionalSpecifications', 'Catch-all extra specification rows clearly evidenced on the vendor page that do not map to any named registry field. Do not include values already captured in named fields.', 'optional', 'text', { category: 'additional' }),
  createEntry('Unknown', 'additionalFeatures', 'Catch-all extra feature rows clearly evidenced on the vendor page that do not map to any named registry field. Do not include values already captured in named fields.', 'optional', 'text', { category: 'additional' }),
  createEntry('Unknown', 'patternEvidence', 'Pattern repeat or drop evidence when explicitly stated.', 'optional', 'text', { promptHint: 'Look for pattern repeat or drop values often labelled Horizontal Repeat, Vertical Repeat, or Pattern Drop.' }),
  createEntry('Unknown', 'variantCaptureCount', 'Count of captured vendor variants when evidenced by the capture manifest.', 'optional', 'text', { category: 'meta', publishable: false })
]

export const variantFieldRegistry: VariantFieldRegistryEntry[] = [
  createVariantEntry('dynamicFields', 'Catch-all variant-specific inferred content fields. Use this array for factual variant content such as specifications, suitability, or other materially useful variant-only facts that are explicitly evidenced and do not belong in the variant identity/display fields.', 'optional', 'text')
]

export function getRegistryEntriesForTrade(trade?: string, pageRole?: RegistryPageRole): FieldRegistryEntry[] {
  const normalizedTrade = (trade ?? 'Unknown').trim().toLowerCase()
  return fieldRegistry.filter((entry) => {
    const tradeMatches = normalizedTrade === 'unknown'
      ? entry.trade.trim().toLowerCase() === 'unknown'
      : entry.trade.trim().toLowerCase() === normalizedTrade
    const pageRoleMatches = pageRole ? entry.applicableTo.includes(pageRole) : true
    return tradeMatches && pageRoleMatches
  })
}

export function buildPromptFieldGuidance(entries: FieldRegistryEntry[]): string {
  return entries
    .map((entry) => {
      const label =
        entry.requiredLevel === 'required'
          ? 'required when evidenced'
          : entry.requiredLevel === 'recommended'
            ? 'recommended'
            : 'optional'
      const example = entry.exampleValue ? ` Example: ${entry.exampleValue}.` : ''
      const hint = entry.promptHint ? ` ${entry.promptHint}` : ''
      const allowed = entry.allowedValues?.length
        ? ` Allowed values: ${entry.allowedValues.join(', ')}.`
        : ''
      return `- ${entry.field} (${label}): ${entry.description}${example}${hint}${allowed}`
    })
    .join(' ')
}

export function buildVariantPromptFieldGuidance(entries: VariantFieldRegistryEntry[]): string {
  return entries
    .map((entry) => {
      const label =
        entry.requiredLevel === 'required'
          ? 'required when evidenced'
          : entry.requiredLevel === 'recommended'
            ? 'recommended'
            : 'optional'
      return `- ${entry.field} (${label}): ${entry.description}`
    })
    .join(' ')
}

export function getVariantRegistryEntries(): VariantFieldRegistryEntry[] {
  return [...variantFieldRegistry]
}

export function evaluateRegistryGating(
  entries: FieldRegistryEntry[],
  fields: RegistryFieldValue[]
): string[] {
  const reasons: string[] = []

  for (const entry of entries) {
    const match = fields.find((field) => field.field === entry.field)
    if (!match) {
      if (entry.requiredLevel === 'required') {
        reasons.push(`missing_${entry.field}`)
      } else if (entry.requiredLevel === 'recommended') {
        reasons.push(`recommended_missing_${entry.field}`)
      }
      continue
    }

    // treat empty string as missing for required/recommended fields
    if (typeof match.value === 'string' && match.value.trim().length === 0) {
      if (entry.requiredLevel === 'required') {
        reasons.push(`missing_${entry.field}`)
      } else if (entry.requiredLevel === 'recommended') {
        reasons.push(`recommended_missing_${entry.field}`)
      }
      continue
    }

    if (entry.publishBlockOnLowConfidence && match.confidence < entry.confidenceThreshold) {
      reasons.push(`low_confidence_${entry.field}`)
    }

    // flag unexpected values for review without blocking publish
    if (
      entry.allowedValues &&
      entry.allowedValues.length > 0 &&
      typeof match.value === 'string'
    ) {
      const normalized = match.value.trim().toLowerCase()
      if (!entry.allowedValues.some((v) => v.toLowerCase() === normalized)) {
        reasons.push(`unexpected_value_${entry.field}`)
      }
    }
  }

  return reasons
}