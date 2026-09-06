import { z } from 'zod'

export const patternClassificationSchema = z.enum(['plain', 'patterned', 'unknown'])
export const patternStrategySchema = z.enum(['vision-description', 'review-required'])

export const patternStrategyEntrySchema = z.object({
  classification: patternClassificationSchema,
  strategy: patternStrategySchema,
  requiresValidation: z.boolean()
}).strict()

export const PATTERN_STRATEGIES = {
  plain: { classification: 'plain', strategy: 'vision-description', requiresValidation: false },
  patterned: { classification: 'patterned', strategy: 'review-required', requiresValidation: true },
  unknown: { classification: 'unknown', strategy: 'review-required', requiresValidation: true }
} as const