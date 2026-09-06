import { z } from 'zod'

export const promptContributionOriginSchema = z.enum([
  'generated-artifact',
  'cached-artifact',
  'deterministic-policy',
  'user-input',
  'omitted',
  'not-applicable',
  'blocked',
  'not-reached'
])

export const promptContributionSummaryItemSchema = z.object({
  key: z.string().trim().min(1),
  applied: z.boolean(),
  origin: promptContributionOriginSchema,
  warningCode: z.string().trim().min(1).optional(),
  reasonCode: z.string().trim().min(1).optional()
}).strict()

export const promptContributionSummarySchema = z.array(promptContributionSummaryItemSchema)

export const promptContributionPlanSchema = z.object({
  schemaVersion: z.literal(1),
  items: promptContributionSummarySchema
}).strict()

export type PromptContributionSummary = z.infer<typeof promptContributionSummarySchema>