import { z } from 'zod'

export const imageGenerationSubmissionClaimSchema = z.object({
  partitionKey: z.literal('image-generation-v2-submission'),
  rowKey: z.string().trim().min(1),
  schemaVersion: z.literal(1),
  submissionKind: z.enum(['request.enqueue', 'control.submit']),
  documentId: z.string().trim().min(1),
  requestedAt: z.string().datetime(),
  state: z.enum(['processing', 'completed', 'failed']),
  leaseOwner: z.string().trim().min(1),
  leaseExpiresAt: z.string().datetime(),
  resultJson: z.string().trim().min(1).optional(),
  errorCode: z.string().trim().min(1).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).strict()