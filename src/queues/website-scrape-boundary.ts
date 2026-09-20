import { z } from 'zod'

const pageRoleSchema = z.enum(['range', 'variant', 'single'])
const scrapeOutcomeSchema = z.enum(['ok', 'empty', 'error'])
const identityEchoSchema = z.object({
  sourceGroupKey: z.string().trim().min(1),
  urlKey: z.string().trim().min(1),
  pageRole: pageRoleSchema
}).strict()

export const websiteScrapeRequestSchema = z.object({
  schemaVersion: z.literal(1),
  operationId: z.string().trim().min(1),
  runId: z.string().trim().min(1),
  epoch: z.number().int().positive(),
  sourceGroupKey: z.string().trim().min(1),
  urlKey: z.string().trim().min(1),
  pageRole: pageRoleSchema,
  evidenceVersion: z.string().trim().min(1),
  url: z.string().url().startsWith('https://'),
  scrapeConfigReference: z.string().trim().min(1),
  blobPrefix: z.string().trim().min(1)
}).strict()

export type WebsiteScrapeRequestType = z.infer<typeof websiteScrapeRequestSchema>

export const websiteScrapeCompletionSchema = z.object({
  schemaVersion: z.literal(1),
  operationId: z.string().trim().min(1),
  runId: z.string().trim().min(1),
  epoch: z.number().int().positive(),
  identity: identityEchoSchema,
  evidenceVersion: z.string().trim().min(1),
  resultReference: z.string().trim().min(1),
  evidenceReference: z.string().trim().min(1),
  contentHash: z.string().trim().min(1),
  outcome: scrapeOutcomeSchema,
  completedAt: z.string().trim().min(1)
}).strict()

export type WebsiteScrapeCompletionType = z.infer<typeof websiteScrapeCompletionSchema>