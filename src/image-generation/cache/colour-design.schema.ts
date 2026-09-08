import {z} from 'zod'
import {sha256} from '../sanity/sha256.js'

const colourHexSchema = z.string().regex(/^#[0-9a-f]{6}$/i).optional()

export const normalizedColourDesignSchema = z.object({
  version: z.literal(1),
  documentKey: z.string().trim().min(1),
  variantKey: z.string().trim().min(1),
  colourName: z.string().trim().min(1),
  colourHex: colourHexSchema,
  fashion: z.string().trim().min(1),
  tone: z.string().trim().min(1),
  furnitureTier: z.string().trim().min(1),
  lighting: z.string().trim().min(1),
  semanticFingerprint: z.string().length(64)
}).strict()

export const colourDesignArtifactSchema = z.object({
  artifactVersion: z.literal(1),
  artifactKind: z.literal('colour-design'),
  scope: z.object({
    documentKey: z.string().trim().min(1),
    variantKey: z.string().trim().min(1)
  }).strict(),
  value: normalizedColourDesignSchema
}).strict()

export type NormalizedColourDesign = z.infer<typeof normalizedColourDesignSchema>
export type ColourDesignArtifact = z.infer<typeof colourDesignArtifactSchema>

export function buildColourDesignVariantKey(documentKey: string, variantKey: string): string {
  return `variant:${documentKey}:${variantKey}`
}

export function computeColourDesignFingerprint(input: Omit<NormalizedColourDesign, 'version' | 'semanticFingerprint'> & {
  templateId: string
  templateRevision: string
  policyVersions?: Record<string, string | number>
}): string {
  return sha256(JSON.stringify({
    documentKey: input.documentKey,
    variantKey: input.variantKey,
    templateId: input.templateId,
    templateRevision: input.templateRevision,
    colourName: input.colourName,
    colourHex: input.colourHex,
    fashion: input.fashion,
    tone: input.tone,
    furnitureTier: input.furnitureTier,
    lighting: input.lighting,
    policyVersions: Object.fromEntries(Object.entries(input.policyVersions ?? {}).sort(([left], [right]) => left.localeCompare(right)))
  }))
}