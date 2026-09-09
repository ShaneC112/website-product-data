import {z} from 'zod'
import {SANITY_SUITABLE_ROOMS} from '../../registry/product-taxonomy.js'

export const normalizedRoomSchema = z.object({
  version: z.literal(1),
  documentKey: z.string().trim().min(1),
  roomKey: z.string().trim().min(1),
  roomCategory: z.enum(SANITY_SUITABLE_ROOMS),
  roomDescription: z.string().trim().min(1),
  roomSourceFingerprint: z.string().trim().min(1),
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

export function buildRoomKey(roomCategory: NormalizedRoom['roomCategory']): string {
  return roomCategory
}

export function buildRoomCacheKey(documentKey: string, roomKey: string, roomSourceFingerprint: string): string {
  return `product:room:${documentKey}:${roomKey}:${roomSourceFingerprint}`
}
