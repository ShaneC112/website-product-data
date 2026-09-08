import {z} from 'zod'

export const normalizedPlainCarpetSchema = z.object({
  version: z.literal(1),
  documentKey: z.string().trim().min(1),
  variantKey: z.string().trim().min(1),
  productType: z.literal('carpet'),
  colourName: z.string().trim().min(1),
  colourHex: z.string().regex(/^#[0-9a-f]{6}$/i).optional(),
  isPatterned: z.boolean(),
  patternClassification: z.enum(['plain', 'patterned', 'unknown']),
  installationMode: z.literal('wall-to-wall'),
  productFacts: z.object({
    name: z.string().trim().min(1).optional(),
    brand: z.string().trim().min(1).optional(),
    shortDescription: z.string().trim().min(1).optional(),
    suitableRooms: z.array(z.string()).default([])
  }).strict()
}).strict()

export const visualProductArtifactSchema = z.object({
  artifactVersion: z.literal(1),
  artifactKind: z.literal('visual-product'),
  scope: z.object({documentKey: z.string().trim().min(1), variantKey: z.string().trim().min(1)}).strict(),
  tradeProductType: z.literal('carpet'),
  promptContribution: z.string().trim().min(1),
  sourceIdentities: z.object({colourDesign: z.string().trim().min(1), texture: z.string().trim().min(1)}).strict(),
  semanticFingerprint: z.string().length(64)
}).strict()

export type NormalizedPlainCarpet = z.infer<typeof normalizedPlainCarpetSchema>
export type VisualProductArtifact = z.infer<typeof visualProductArtifactSchema>