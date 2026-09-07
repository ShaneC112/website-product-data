import { z } from 'zod'
import {
  aiImageGenerationRequestPolicySnapshotSchema,
  type AiImageGenerationRequestPolicySnapshot
} from './request.schema.js'
import { sha256 } from './sha256.js'

const requestPolicySnapshotInputSchema = aiImageGenerationRequestPolicySnapshotSchema.pick({
  room: true,
  aspectRatio: true,
  creativeDirection: true
})

export type ImageGenerationRequestPolicySnapshotInput = z.infer<typeof requestPolicySnapshotInputSchema>

export function hashImageGenerationRequestPolicySnapshot(input: ImageGenerationRequestPolicySnapshotInput): string {
  const normalized = requestPolicySnapshotInputSchema.parse(input)

  return sha256(JSON.stringify(normalized))
}

export function buildImageGenerationRequestPolicySnapshot(
  input: ImageGenerationRequestPolicySnapshotInput & { capturedAt: string }
): AiImageGenerationRequestPolicySnapshot {
  const stableInput = requestPolicySnapshotInputSchema.parse({
    room: input.room,
    aspectRatio: input.aspectRatio,
    creativeDirection: input.creativeDirection
  })

  return aiImageGenerationRequestPolicySnapshotSchema.parse({
    ...stableInput,
    policyHash: hashImageGenerationRequestPolicySnapshot(stableInput),
    capturedAt: input.capturedAt
  })
}

export const imageGenerationRequestPolicyRefreshDecisionSchema = z.object({
  outcome: z.enum(['noop', 'refresh-required']),
  policyHash: z.string().trim().min(1)
}).strict()

export type ImageGenerationRequestPolicyRefreshDecision = z.infer<typeof imageGenerationRequestPolicyRefreshDecisionSchema>

export function diffImageGenerationRequestPolicySnapshot(
  current: AiImageGenerationRequestPolicySnapshot,
  next: ImageGenerationRequestPolicySnapshotInput
): ImageGenerationRequestPolicyRefreshDecision {
  const policyHash = hashImageGenerationRequestPolicySnapshot(next)

  return imageGenerationRequestPolicyRefreshDecisionSchema.parse({
    outcome: current.policyHash === policyHash ? 'noop' : 'refresh-required',
    policyHash
  })
}