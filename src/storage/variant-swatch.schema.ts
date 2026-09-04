import { z } from 'zod'

export const crawlVariantSwatchSourceSchema = z.enum([
  'selector',
  'ai',
  'primary_fallback',
  'operator_url',
  'operator_upload'
])

export const crawlVariantSwatchStatusSchema = z.enum([
  'found',
  'review',
  'missing',
  'override_pending',
  'approved'
])

export const crawlVariantSwatchReviewStateSchema = z.enum([
  'pending',
  'approved',
  'rejected'
])