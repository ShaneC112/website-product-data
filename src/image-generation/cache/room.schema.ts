import {z} from 'zod'
import {sha256} from '../sanity/sha256.js'
import {SANITY_SUITABLE_ROOMS} from '../../registry/product-taxonomy.js'

const architecturalInputsSchema = z.object({
  approximateScale: z.string().trim().min(1),
  ceilingHeight: z.string().trim().min(1),
  doorPlacement: z.string().trim().min(1),
  windowPlacement: z.string().trim().min(1),
  fireplace: z.object({present: z.boolean(), placement: z.string().trim().min(1).optional()}).strict().optional(),
  fixedArchitecturalAnchors: z.array(z.string().trim().min(1)).default([])
}).strict()

export const normalizedRoomSchema = z.object({
  version: z.literal(1),
  documentKey: z.string().trim().min(1),
  roomKey: z.string().trim().min(1),
  roomCategory: z.enum(SANITY_SUITABLE_ROOMS),
  architecturalInputs: architecturalInputsSchema,
  cameraOverlap: z.object({targetFloorSharePercent: z.tuple([z.number().int().min(1).max(100), z.number().int().min(1).max(100)]).optional(), cropSafeFloorMinimumPercent: z.literal(33).optional()}).strict(),
  roomGenerationVersion: z.literal(1),
  semanticFingerprint: z.string().length(64)
}).strict()

export const roomArtifactSchema = z.object({
  artifactVersion: z.literal(1),
  artifactKind: z.literal('room'),
  scope: z.object({documentKey: z.string().trim().min(1), roomKey: z.string().trim().min(1)}).strict(),
  roomShell: z.string().trim().min(1),
  architecturalAnchors: z.array(z.string().trim().min(1)),
  guardrails: z.object({colourNeutral: z.boolean(), stylingNeutral: z.boolean()}).strict(),
  semanticFingerprint: z.string().length(64)
}).strict()

export type NormalizedRoom = z.infer<typeof normalizedRoomSchema>
export type RoomArtifact = z.infer<typeof roomArtifactSchema>

export function buildRoomKey(input: Pick<NormalizedRoom, 'roomCategory' | 'architecturalInputs' | 'roomGenerationVersion'>): string {
  return sha256(JSON.stringify(input))
}

export function buildRoomCacheKey(documentKey: string, roomKey: string): string {
  return `product:room:${documentKey}:${roomKey}`
}
