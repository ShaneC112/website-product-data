import { z } from 'zod'

export const fieldRequiredLevelSchema = z.enum(['required', 'recommended', 'optional'])
export const fieldValueTypeSchema = z.enum(['text', 'boolean', 'measurement', 'measurement-list', 'text-list'])
export const registryPageRoleSchema = z.enum(['range', 'variant', 'single'])
export const variantFieldRequiredLevelSchema = z.enum(['required', 'recommended', 'optional'])

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
  valueType: fieldValueTypeSchema
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
    valueType
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
  createEntry('Carpet', 'title', 'Primary product or range name shown in headings, titles, or hero content.', 'required', 'text'),
  createEntry('Carpet', 'description', 'Concise commercial description summarising the product from meta description, intro copy, or lead paragraph.', 'required', 'text'),
  createEntry('Carpet', 'productType', 'Concise flooring category such as carpet when explicitly stated.', 'required', 'text'),
  createEntry('Carpet', 'features', 'Performance or treatment claims evidenced in the page, such as Moth Resistant, Stain Resistant, Bleach Cleanable, or Family Friendly.', 'required', 'text-list'),
  createEntry('Carpet', 'pileHeight', 'Explicit pile height measurement for carpet products.', 'recommended', 'measurement'),
  createEntry('Carpet', 'pileWeight', 'Explicit pile weight text such as 1700 g/m2 when present in carpet specifications.', 'recommended', 'text'),
  createEntry('Carpet', 'backing', 'Backing material or construction when explicitly stated in carpet specifications.', 'recommended', 'text'),
  createEntry('Carpet', 'construction', 'Construction text such as gauge, pile style, and tufting method when explicitly stated.', 'recommended', 'text'),
  createEntry('Carpet', 'pileFibreComposition', 'Pile fibre composition text such as wool content, yarn ply, or dye treatment when explicitly stated.', 'recommended', 'text'),
  createEntry('Carpet', 'gauge', 'Gauge text such as 10-gauge when explicitly stated.', 'recommended', 'text'),
  createEntry('Carpet', 'stitchCount', 'Number of stitches per square metre when explicitly stated.', 'recommended', 'text'),
  createEntry('Carpet', 'width', 'Available roll width or width range text such as 400 - 500 cm when explicitly stated.', 'recommended', 'text'),
  createEntry('Carpet', 'totalWeight', 'Overall carpet weight including backing when explicitly stated.', 'recommended', 'text'),
  createEntry('Carpet', 'fireRating', 'Fire classification such as Cfl-s1 or Bfl-s1 when explicitly stated.', 'recommended', 'text'),
  createEntry('Carpet', 'totalHeight', 'Overall carpet height including backing when explicitly stated.', 'optional', 'measurement'),
  createEntry('Carpet', 'mothResistant', 'Boolean true when moth resistant or moth proofed is explicitly stated.', 'optional', 'boolean'),
  createEntry('Carpet', 'stainResistant', 'Boolean true when stain resistant or stain protection is explicitly stated.', 'optional', 'boolean'),
  createEntry('Carpet', 'antiStatic', 'Boolean true when anti-static or electrostatic protection is explicitly stated.', 'optional', 'boolean'),
  createEntry('Carpet', 'suitabilityUfH', 'Boolean true when suitable for underfloor heating is explicitly stated.', 'optional', 'boolean'),
  createEntry('Carpet', 'dimensions', 'Roll dimensions such as width and optional length when explicitly stated.', 'optional', 'text'),
  createEntry('Carpet', 'measurements', 'Other explicit measurements such as roll width or length.', 'optional', 'measurement-list'),
  createEntry('Carpet', 'additionalSpecifications', 'Catch-all extra specification rows that are clearly important on the vendor page but do not map to a named registry field.', 'optional', 'text'),
  createEntry('Carpet', 'additionalFeatures', 'Catch-all extra feature rows that are clearly important on the vendor page but do not map to a named registry field.', 'optional', 'text'),
  createEntry('Carpet', 'patternEvidence', 'Pattern repeat or drop evidence when explicitly stated.', 'optional', 'text'),
  createEntry('Carpet', 'variantCaptureCount', 'Count of captured vendor variants when evidenced by the capture manifest.', 'optional', 'text'),

  createEntry('Carpet Tile', 'title', 'Primary product or range name shown in headings, titles, or hero content.', 'required', 'text'),
  createEntry('Carpet Tile', 'description', 'Concise commercial description summarising the product from meta description, intro copy, or lead paragraph.', 'required', 'text'),
  createEntry('Carpet Tile', 'productType', 'Concise flooring category such as carpet tile when explicitly stated.', 'required', 'text'),
  createEntry('Carpet Tile', 'features', 'Performance or treatment claims evidenced in the page, such as Moth Resistant, Stain Resistant, or Anti-static.', 'required', 'text-list'),
  createEntry('Carpet Tile', 'pileHeight', 'Explicit pile height measurement for carpet tile products.', 'recommended', 'measurement'),
  createEntry('Carpet Tile', 'backing', 'Backing material or construction when explicitly stated in carpet tile specifications.', 'recommended', 'text'),
  createEntry('Carpet Tile', 'gauge', 'Gauge text such as 1/10 gauge when explicitly stated.', 'recommended', 'text'),
  createEntry('Carpet Tile', 'dimensions', 'Tile dimensions when explicitly stated.', 'recommended', 'text'),
  createEntry('Carpet Tile', 'totalWeight', 'Overall carpet tile weight including backing when explicitly stated.', 'recommended', 'text'),
  createEntry('Carpet Tile', 'fireRating', 'Fire classification such as Cfl-s1 or Bfl-s1 when explicitly stated.', 'recommended', 'text'),
  createEntry('Carpet Tile', 'totalHeight', 'Overall carpet tile height including backing when explicitly stated.', 'optional', 'measurement'),
  createEntry('Carpet Tile', 'mothResistant', 'Boolean true when moth resistant or moth proofed is explicitly stated.', 'optional', 'boolean'),
  createEntry('Carpet Tile', 'stainResistant', 'Boolean true when stain resistant or stain protection is explicitly stated.', 'optional', 'boolean'),
  createEntry('Carpet Tile', 'antiStatic', 'Boolean true when anti-static or electrostatic protection is explicitly stated.', 'optional', 'boolean'),
  createEntry('Carpet Tile', 'suitabilityUfH', 'Boolean true when suitable for underfloor heating is explicitly stated.', 'optional', 'boolean'),
  createEntry('Carpet Tile', 'measurements', 'Other explicit measurements such as tile size or pack dimensions.', 'optional', 'measurement-list'),
  createEntry('Carpet Tile', 'additionalSpecifications', 'Catch-all extra specification rows that are clearly important on the vendor page but do not map to a named registry field.', 'optional', 'text'),
  createEntry('Carpet Tile', 'additionalFeatures', 'Catch-all extra feature rows that are clearly important on the vendor page but do not map to a named registry field.', 'optional', 'text'),
  createEntry('Carpet Tile', 'patternEvidence', 'Pattern repeat or drop evidence when explicitly stated.', 'optional', 'text'),
  createEntry('Carpet Tile', 'variantCaptureCount', 'Count of captured vendor variants when evidenced by the capture manifest.', 'optional', 'text'),

  createEntry('Laminate', 'title', 'Primary product or range name shown in headings, titles, or hero content.', 'required', 'text'),
  createEntry('Laminate', 'description', 'Concise commercial description summarising the product from meta description, intro copy, or lead paragraph.', 'required', 'text'),
  createEntry('Laminate', 'productType', 'Concise flooring category such as laminate when explicitly stated.', 'required', 'text'),
  createEntry('Laminate', 'thickness', 'Explicit laminate thickness measurement.', 'required', 'measurement'),
  createEntry('Laminate', 'dimensions', 'Plank dimensions when explicitly present.', 'required', 'text'),
  createEntry('Laminate', 'packInfo', 'Canonical pack details including coverage, pieces per pack, and pack dimensions when explicitly present.', 'recommended', 'text'),
  createEntry('Laminate', 'waterResistant', 'Boolean true when water resistant or waterproof laminate performance is explicitly stated.', 'recommended', 'boolean'),
  createEntry('Laminate', 'suitabilityUfH', 'Boolean true when suitable for underfloor heating is explicitly stated.', 'recommended', 'boolean'),
  createEntry('Laminate', 'measurements', 'Other explicit measurements such as plank width, plank length, or pack dimensions.', 'optional', 'measurement-list'),
  createEntry('Laminate', 'additionalSpecifications', 'Catch-all extra specification rows that are clearly important on the vendor page but do not map to a named registry field.', 'optional', 'text'),
  createEntry('Laminate', 'additionalFeatures', 'Catch-all extra feature rows that are clearly important on the vendor page but do not map to a named registry field.', 'optional', 'text'),
  createEntry('Laminate', 'variantCaptureCount', 'Count of captured vendor variants when evidenced by the capture manifest.', 'optional', 'text'),

  createEntry('Vinyl', 'title', 'Primary product or range name shown in headings, titles, or hero content.', 'required', 'text'),
  createEntry('Vinyl', 'description', 'Concise commercial description summarising the product from meta description, intro copy, or lead paragraph.', 'required', 'text'),
  createEntry('Vinyl', 'productType', 'Concise flooring category such as sheet vinyl or vinyl tile when explicitly stated.', 'required', 'text'),
  createEntry('Vinyl', 'thickness', 'Explicit vinyl thickness measurement.', 'required', 'measurement'),
  createEntry('Vinyl', 'dimensions', 'Roll or tile dimensions when explicitly stated.', 'required', 'text'),
  createEntry('Vinyl', 'look', 'Visual layout or style such as plank, herringbone, or chevron when explicitly stated.', 'recommended', 'text'),
  createEntry('Vinyl', 'waterResistant', 'Boolean true when water resistant or waterproof performance is explicitly stated.', 'recommended', 'boolean'),
  createEntry('Vinyl', 'measurements', 'Other explicit measurements such as plank width, tile size, or roll width.', 'optional', 'measurement-list'),
  createEntry('Vinyl', 'additionalSpecifications', 'Catch-all extra specification rows that are clearly important on the vendor page but do not map to a named registry field.', 'optional', 'text'),
  createEntry('Vinyl', 'additionalFeatures', 'Catch-all extra feature rows that are clearly important on the vendor page but do not map to a named registry field.', 'optional', 'text'),
  createEntry('Vinyl', 'variantCaptureCount', 'Count of captured vendor variants when evidenced by the capture manifest.', 'optional', 'text'),

  createEntry('Unknown', 'title', 'Primary product or range name shown in headings, titles, or hero content.', 'required', 'text'),
  createEntry('Unknown', 'description', 'Concise commercial description summarising the product from meta description, intro copy, or lead paragraph.', 'required', 'text'),
  createEntry('Unknown', 'productType', 'Concise flooring category when explicitly stated.', 'optional', 'text'),
  createEntry('Unknown', 'measurements', 'Explicit measurements found in the page.', 'optional', 'measurement-list'),
  createEntry('Unknown', 'pileHeight', 'Explicit pile height measurement when present.', 'optional', 'measurement'),
  createEntry('Unknown', 'thickness', 'Explicit thickness measurement when present.', 'optional', 'measurement'),
  createEntry('Unknown', 'packInfo', 'Canonical pack details when present.', 'optional', 'text'),
  createEntry('Unknown', 'dimensions', 'Structured product dimensions when present.', 'optional', 'text'),
  createEntry('Unknown', 'look', 'Visual layout or style when present.', 'optional', 'text'),
  createEntry('Unknown', 'additionalSpecifications', 'Catch-all extra specification rows that are clearly important on the vendor page but do not map to a named registry field.', 'optional', 'text'),
  createEntry('Unknown', 'additionalFeatures', 'Catch-all extra feature rows that are clearly important on the vendor page but do not map to a named registry field.', 'optional', 'text'),
  createEntry('Unknown', 'patternEvidence', 'Pattern repeat or drop evidence when explicitly stated.', 'optional', 'text'),
  createEntry('Unknown', 'variantCaptureCount', 'Count of captured vendor variants when evidenced by the capture manifest.', 'optional', 'text')
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
      return `- ${entry.field} (${label}): ${entry.description}`
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

    if (entry.publishBlockOnLowConfidence && match.confidence < entry.confidenceThreshold) {
      reasons.push(`low_confidence_${entry.field}`)
    }
  }

  return reasons
}