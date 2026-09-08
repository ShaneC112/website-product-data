import { z } from 'zod'
import { imageGenerationQueueEnvelopeSchema } from '../contracts/queue.js'
import { imageGenerationOrchestrationLedgerSchema } from '../storage/orchestration-ledger.schema.js'
import { imageGenerationArtifactLedgerSchema } from '../storage/artifact-ledger.schema.js'
import { imageGenerationDispatchIntentSchema } from '../storage/dispatch-intent.schema.js'
import { imageGenerationRunContentClaimSchema, imageGenerationRunContentRowSchema } from '../storage/run-content.schema.js'
import { imageGenerationRunSnapshotSchema } from '../storage/run-snapshot.schema.js'
import { imageGenerationSubmissionClaimSchema } from '../storage/submission-claim.schema.js'

export const imageGenerationQuarantineSchema = z.object({
  status: z.literal('quarantined'),
  reason: z.string().trim().min(1)
}).strict()

export function upcastImageGenerationQueueEnvelope(input: unknown) {
  const parsed = z.object({ schemaVersion: z.number().int().nonnegative() }).passthrough().safeParse(input)
  if (!parsed.success) {
    return imageGenerationQuarantineSchema.parse({ status: 'quarantined', reason: 'missing-schema-version' })
  }
  if (parsed.data.schemaVersion !== 1) {
    return imageGenerationQuarantineSchema.parse({ status: 'quarantined', reason: `unsupported-schema-version:${parsed.data.schemaVersion}` })
  }
  return imageGenerationQueueEnvelopeSchema.parse(input)
}

function upcastVersionOneRow(input: unknown, schema: z.ZodTypeAny) {
  const marker = z.object({ schemaVersion: z.number().int().nonnegative() }).passthrough().safeParse(input)
  if (!marker.success) return imageGenerationQuarantineSchema.parse({status: 'quarantined', reason: 'missing-schema-version'})
  if (marker.data.schemaVersion !== 1) return imageGenerationQuarantineSchema.parse({status: 'quarantined', reason: `unsupported-schema-version:${marker.data.schemaVersion}`})
  const parsed = schema.safeParse(input)
  return parsed.success ? parsed.data : imageGenerationQuarantineSchema.parse({status: 'quarantined', reason: 'malformed-version-1-row'})
}

export function upcastImageGenerationOrchestrationLedger(input: unknown) {
  return upcastVersionOneRow(input, imageGenerationOrchestrationLedgerSchema)
}

export function upcastImageGenerationArtifactLedger(input: unknown) {
  return upcastVersionOneRow(input, imageGenerationArtifactLedgerSchema)
}

export function upcastImageGenerationDispatchIntent(input: unknown) {
  return upcastVersionOneRow(input, imageGenerationDispatchIntentSchema)
}

export function upcastImageGenerationRunSnapshot(input: unknown) {
  return upcastVersionOneRow(input, imageGenerationRunSnapshotSchema)
}

export function upcastImageGenerationRunContentRow(input: unknown) {
  return upcastVersionOneRow(input, imageGenerationRunContentRowSchema)
}

export function upcastImageGenerationRunContentClaim(input: unknown) {
  return upcastVersionOneRow(input, imageGenerationRunContentClaimSchema)
}

export function upcastImageGenerationSubmissionClaim(input: unknown) {
  return upcastVersionOneRow(input, imageGenerationSubmissionClaimSchema)
}