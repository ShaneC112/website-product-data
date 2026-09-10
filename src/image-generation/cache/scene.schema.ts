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
  designBrief: z.string().trim().min(100).default('Use the approved room, product, flooring, and creative direction without changing protected facts. Furnish the room completely while preserving all approved architecture and directional placements.'),
  renderDirectives: z.array(z.string().trim().min(10).max(400)).min(1).max(16).default(['Fully furnish the room with the approved design choices.']),
  lockedSections: z.object({
    architecture: z.array(z.string().trim().min(10).max(400)).min(1).max(16),
    camera: z.array(z.string().trim().min(10).max(300)).min(1).max(12),
    flooring: z.array(z.string().trim().min(10).max(400)).min(1).max(16),
    lighting: z.string().trim().min(10).max(300)
  }).strict(),
  variableSections: z.object({
    primaryFocalPoints: z.array(z.string().trim().min(10).max(400)).min(1).max(8),
    secondaryFurniture: z.array(z.string().trim().min(10).max(400)).max(16),
    windowTreatments: z.array(z.string().trim().min(10).max(300)).max(8),
    lighting: z.array(z.string().trim().min(10).max(300)).max(8),
    accessories: z.array(z.string().trim().min(10).max(300)).max(12),
    visibilityChecklist: z.array(z.string().trim().min(5).max(200)).min(1).max(20)
  }).strict(),
  styleSections: z.object({
    concept: z.string().trim().min(10).max(300),
    palette: z.array(z.string().trim().min(3).max(200)).max(12),
    materials: z.array(z.string().trim().min(3).max(200)).max(12),
    tone: z.string().trim().min(3).max(100),
    fashion: z.string().trim().min(3).max(100)
  }).strict(),
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

export const sceneStructuredSectionsSchema = z.object({
  lockedSections: z.object({
    architecture: z.array(z.string().trim().min(10)).min(1),
    camera: z.array(z.string().trim().min(10)).min(1),
    flooring: z.array(z.string().trim().min(10)).min(1),
    lighting: z.string().trim().min(10)
  }).strict(),
  variableSections: z.object({
    primaryFocalPoints: z.array(z.string().trim().min(10)).min(1),
    secondaryFurniture: z.array(z.string().trim().min(10)),
    windowTreatments: z.array(z.string().trim().min(10)),
    lighting: z.array(z.string().trim().min(10)),
    accessories: z.array(z.string().trim().min(10)),
    visibilityChecklist: z.array(z.string().trim().min(5)).min(1)
  }).strict(),
  styleSections: z.object({
    concept: z.string().trim().min(10),
    palette: z.array(z.string().trim().min(3)),
    materials: z.array(z.string().trim().min(3)),
    tone: z.string().trim().min(3),
    fashion: z.string().trim().min(3)
  }).strict()
}).strict()

export const sceneArtifactSchema = z.object({
  artifactVersion: z.literal(1),
  artifactKind: z.literal('scene'),
  scope: z.object({documentKey: z.string().trim().min(1), sceneKey: z.string().trim().min(1)}).strict(),
  roomDependency: z.object({roomKey: z.string().trim().min(1), roomFingerprint: z.string().length(64)}).strict(),
    composition: z.object({shell: z.string().trim().min(1), product: z.string().trim().min(1), furnishings: z.string().trim().min(1), paletteStrategy: z.string().trim().min(1), lighting: z.string().trim().min(1), renderDirectives: z.array(z.string().trim().min(10).max(400)).min(1).max(16), lockedSections: z.object({architecture: z.array(z.string().trim().min(10)), camera: z.array(z.string().trim().min(10)), flooring: z.array(z.string().trim().min(10)), lighting: z.string().trim().min(10)}).strict(), variableSections: z.object({primaryFocalPoints: z.array(z.string().trim().min(10)).min(1), secondaryFurniture: z.array(z.string().trim().min(10)), windowTreatments: z.array(z.string().trim().min(10)), lighting: z.array(z.string().trim().min(10)), accessories: z.array(z.string().trim().min(10)), visibilityChecklist: z.array(z.string().trim().min(5)).min(1)}).strict(), styleSections: z.object({concept: z.string().trim().min(10), palette: z.array(z.string().trim().min(3)), materials: z.array(z.string().trim().min(3)), tone: z.string().trim().min(3), fashion: z.string().trim().min(3)}).strict(), designBrief: z.string().trim().min(100)}).strict(),
  exclusions: z.array(z.string().trim().min(1)).min(1),
  semanticFingerprint: z.string().length(64)
}).strict()

export type NormalizedScene = z.infer<typeof normalizedSceneSchema>
export type SceneArtifact = z.infer<typeof sceneArtifactSchema>

export function buildSceneKey(input: Pick<NormalizedScene, 'roomKey' | 'roomFingerprint' | 'productFingerprint' | 'tradeProductType' | 'colourDesignFingerprint' | 'lighting' | 'fashion' | 'tone' | 'furnitureTier' | 'sceneGenerationVersion'>): string {
  return sha256(JSON.stringify(input))
}

export function buildSceneCacheKey(documentKey: string, sceneKey: string): string {
  return `product:scene:${documentKey}:${sceneKey}`
}
