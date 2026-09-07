import { z } from 'zod'
import { sha256 } from './sha256.js'

const templateArtifactFingerprintUseSchema = z.object({
  templateType: z.enum(['texture', 'pattern']),
  targetVariantIds: z.array(z.string().trim().min(1)).default([])
}).strict()

const templateArtifactFingerprintEvidenceSchema = z.object({
  assetId: z.string().trim().min(1),
  templateUses: z.array(templateArtifactFingerprintUseSchema).min(1)
}).strict()

const templateArtifactFingerprintScopeSchema = z.discriminatedUnion('level', [
  z.object({ level: z.literal('product') }).strict(),
  z.object({ level: z.literal('variant'), variantId: z.string().trim().min(1) }).strict()
])

const templateArtifactFingerprintBindingSchema = z.object({
  productId: z.string().trim().min(1),
  productType: z.string().trim().min(1),
  categoryKey: z.string().trim().min(1),
  selectedVariant: z.unknown()
}).strict()

export const templateArtifactFingerprintInputSchema = z.object({
  templateRevision: z.string().trim().min(1),
  evidence: z.array(templateArtifactFingerprintEvidenceSchema),
  binding: templateArtifactFingerprintBindingSchema,
  productFacts: z.unknown(),
  policyVersions: z.record(z.string(), z.union([z.string(), z.number().int()])),
  surfaceProfileVersion: z.string().trim().min(1).optional(),
  artifactKind: z.enum(['texture', 'pattern', 'scene', 'colour-design']),
  scope: templateArtifactFingerprintScopeSchema
}).strict()

export type TemplateArtifactFingerprintInput = z.infer<typeof templateArtifactFingerprintInputSchema>

function stableSortStrings(values: readonly string[]): string[] {
  return [...values].sort((left, right) => left.localeCompare(right))
}

function normalizeEvidenceForScope(input: TemplateArtifactFingerprintInput) {
  const seenAssetIds = new Set<string>()

  return input.evidence.map((entry) => {
    if (seenAssetIds.has(entry.assetId)) {
      throw new Error(`Duplicate template evidence assetId: ${entry.assetId}`)
    }
    seenAssetIds.add(entry.assetId)

    const normalizedUses = entry.templateUses
      .map((use) => ({
        templateType: use.templateType,
        targetVariantIds: stableSortStrings(use.targetVariantIds)
      }))
      .filter((use) => {
        if (input.scope.level !== 'variant') {
          return true
        }

        return use.targetVariantIds.length === 0 || use.targetVariantIds.includes(input.scope.variantId)
      })
      .sort((left, right) => {
        const typeCompare = left.templateType.localeCompare(right.templateType)
        if (typeCompare !== 0) {
          return typeCompare
        }

        return left.targetVariantIds.join('|').localeCompare(right.targetVariantIds.join('|'))
      })

    if (normalizedUses.length === 0) {
      return null
    }

    return {
      assetId: entry.assetId,
      templateUses: normalizedUses
    }
  }).filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .sort((left, right) => left.assetId.localeCompare(right.assetId))
}

function normalizePolicyVersions(policyVersions: TemplateArtifactFingerprintInput['policyVersions']) {
  return Object.fromEntries(
    Object.entries(policyVersions).sort(([left], [right]) => left.localeCompare(right))
  )
}

function normalizeUnknown(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => normalizeUnknown(entry))
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, normalizeUnknown(entry)])
    )
  }

  return value
}

export function normalizeTemplateArtifactFingerprintInput(input: TemplateArtifactFingerprintInput) {
  const parsed = templateArtifactFingerprintInputSchema.parse(input)

  return {
    templateRevision: parsed.templateRevision,
    artifactKind: parsed.artifactKind,
    scope: parsed.scope,
    evidence: normalizeEvidenceForScope(parsed),
    binding: {
      productId: parsed.binding.productId,
      productType: parsed.binding.productType,
      categoryKey: parsed.binding.categoryKey,
      selectedVariant: normalizeUnknown(parsed.binding.selectedVariant)
    },
    productFacts: normalizeUnknown(parsed.productFacts),
    policyVersions: normalizePolicyVersions(parsed.policyVersions),
    surfaceProfileVersion: parsed.surfaceProfileVersion
  }
}

export function computeTemplateArtifactFingerprint(input: TemplateArtifactFingerprintInput): string {
  return sha256(JSON.stringify(normalizeTemplateArtifactFingerprintInput(input)))
}