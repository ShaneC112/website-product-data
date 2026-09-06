import { z } from 'zod'

export const imageGenerationDispatchIntentStateSchema = z.enum(['pending_outbound', 'dispatching', 'queued', 'failed'])

export const imageGenerationDispatchIntentSchema = z.object({
  schemaVersion: z.literal(1),
  partitionKey: z.string().trim().min(1),
  rowKey: z.string().trim().min(1),
  requestId: z.string().trim().min(1),
  runId: z.string().trim().min(1),
  runEpoch: z.number().int().nonnegative(),
  queueName: z.string().trim().min(1),
  payloadJson: z.string().trim().min(1),
  state: imageGenerationDispatchIntentStateSchema,
  attempt: z.number().int().nonnegative().default(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  leaseOwner: z.string().trim().min(1).optional(),
  leaseExpiresAt: z.string().datetime().optional(),
  queuedAt: z.string().datetime().optional(),
  failureMessage: z.string().trim().max(2000).optional()
}).strict()