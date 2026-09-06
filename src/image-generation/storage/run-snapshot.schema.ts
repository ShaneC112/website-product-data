import { z } from 'zod'
import { promptContributionPlanSchema, promptContributionSummarySchema } from '../contracts/prompt-generation.js'

export const imageGenerationRunSnapshotSchema = z.object({
  schemaVersion: z.literal(1),
  requestId: z.string().trim().min(1),
  runId: z.string().trim().min(1),
  runEpoch: z.number().int().nonnegative(),
  workflowVersion: z.number().int().positive(),
  childRegistryVersion: z.number().int().positive(),
  contributionPlan: promptContributionPlanSchema,
  terminalContributionSummary: promptContributionSummarySchema.optional()
}).strict()