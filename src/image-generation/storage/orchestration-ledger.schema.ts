import { z } from 'zod'
import { imageGenerationStepSchema, imageGenerationWorkKindSchema } from '../contracts/queue.js'
import { imageGenerationRecoveryDispositionSchema } from '../contracts/status.js'

export const imageGenerationOrchestrationStateSchema = z.enum([
  'planned',
  'pending_outbound',
  'queued',
  'running',
  'waiting',
  'completed',
  'failed',
  'blocked',
  'cancelled',
  'abandoned',
  'skipped',
  'quarantined'
])

export const imageGenerationOrchestrationLedgerSchema = z.object({
  schemaVersion: z.literal(1),
  partitionKey: z.string().trim().min(1),
  rowKey: z.string().trim().min(1),
  requestId: z.string().trim().min(1),
  runId: z.string().trim().min(1),
  runEpoch: z.number().int().nonnegative(),
  step: imageGenerationStepSchema,
  workKind: imageGenerationWorkKindSchema,
  workKey: z.string().trim().min(1),
  state: imageGenerationOrchestrationStateSchema,
  attempt: z.number().int().nonnegative().default(0),
  ownerToken: z.string().trim().min(1).optional(),
  leaseExpiresAt: z.string().datetime().optional(),
  inputReference: z.string().trim().min(1).optional(),
  outputReference: z.string().trim().min(1).optional(),
  dependencyManifestJson: z.string().trim().min(1).optional(),
  failureHistoryJson: z.string().trim().min(1).optional(),
  recoveryDisposition: imageGenerationRecoveryDispositionSchema,
  updatedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional()
}).strict()