import {z} from 'zod'
import {sha256} from '../sanity/sha256.js'
import {SANITY_PRODUCT_TYPES, SANITY_SUITABLE_ROOMS} from '../../registry/product-taxonomy.js'

export const normalizedSceneSchema = z.object({
  version: z.literal(1),
  documentKey: z.string().trim().min(1),
  sceneKey: z.string().trim().min(1),
  roomKey: z.string().trim().min(1),
  roomFingerprint: z.string().length(64),
  productFingerprint: z.string().length(64),
  productContribution: z.string().trim().min(1),
  sceneDesignBrief: z.string().trim().min(20).default('Use the approved room, product, flooring, and creative direction without changing protected facts.'),
  roomCategory: z.enum(SANITY_SUITABLE_ROOMS),
  tradeProductType: z.enum(SANITY_PRODUCT_TYPES),
  colourDesignFingerprint: z.string().length(64),
  lighting: z.string().trim().min(1),
  fashion: z.string().trim().min(1),
  tone: z.string().trim().min(1),
  furnitureTier: z.string().trim().min(1),
  sceneGenerationVersion: z.literal(1),
  semanticFingerprint: z.string().length(64)
}).strict()

export const sceneArtifactSchema = z.object({
  artifactVersion: z.literal(1),
  artifactKind: z.literal('scene'),
  scope: z.object({documentKey: z.string().trim().min(1), sceneKey: z.string().trim().min(1)}).strict(),
  roomDependency: z.object({roomKey: z.string().trim().min(1), roomFingerprint: z.string().length(64)}).strict(),
  composition: z.object({shell: z.string().trim().min(1), product: z.string().trim().min(1), furnishings: z.string().trim().min(1), paletteStrategy: z.string().trim().min(1), lighting: z.string().trim().min(1), stylingNotes: z.string().trim().min(1)}).strict(),
  exclusions: z.array(z.string().trim().min(1)).min(1),
  semanticFingerprint: z.string().length(64)
}).strict()

export type NormalizedScene = z.infer<typeof normalizedSceneSchema>
export type SceneArtifact = z.infer<typeof sceneArtifactSchema>

export function buildSceneKey(input: Pick<NormalizedScene, 'roomKey' | 'roomFingerprint' | 'productFingerprint' | 'sceneDesignBrief' | 'tradeProductType' | 'colourDesignFingerprint' | 'lighting' | 'fashion' | 'tone' | 'furnitureTier' | 'sceneGenerationVersion'>): string {
  return sha256(JSON.stringify(input))
}

export function buildSceneCacheKey(documentKey: string, sceneKey: string): string {
  return `product:scene:${documentKey}:${sceneKey}`
}
