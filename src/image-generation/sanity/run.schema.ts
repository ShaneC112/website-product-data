import { z } from 'zod'
import { imageGenerationStatusSchema } from '../contracts/status.js'

export const aiImageGenerationRunSchema = z.object({
  _id: z.string().trim().min(1),
  _type: z.literal('aiImageGenerationRun'),
  runId: z.string().trim().min(1),
  requestId: z.string().trim().min(1),
  status: imageGenerationStatusSchema,
  attachmentCommitToken: z.string().trim().min(1).optional()
}).strict()