import { z } from 'zod'

export const aiInputPartSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('text'), text: z.string().trim().min(1) }).strict(),
  z.object({ kind: z.literal('image-reference'), assetRef: z.string().trim().min(1), role: z.string().trim().min(1) }).strict()
])

export const aiReferenceImageSchema = z.object({
  assetRef: z.string().trim().min(1),
  role: z.string().trim().min(1),
  detail: z.enum(['low', 'high']).optional()
}).strict()

export const aiImageOutputSchema = z.object({
  aspectRatio: z.enum(['1:1', '3:2', '4:3', '16:9']),
  count: z.number().int().positive().max(4),
  format: z.enum(['png', 'jpeg', 'webp'])
}).strict()

export const canonicalStructuredTextOperationSchema = z.object({
  kind: z.literal('structured-text'),
  version: z.literal(1),
  parts: z.array(aiInputPartSchema).min(1),
  outputSchemaKey: z.string().trim().min(1)
}).strict()

export const canonicalImageGenerationOperationSchema = z.object({
  kind: z.literal('image-generation'),
  version: z.literal(1),
  prompt: z.string().trim().min(1),
  references: z.array(aiReferenceImageSchema),
  output: aiImageOutputSchema
}).strict()

export const canonicalImageEditOperationSchema = z.object({
  kind: z.literal('image-edit'),
  version: z.literal(1),
  prompt: z.string().trim().min(1),
  inputs: z.array(aiReferenceImageSchema).min(1),
  output: aiImageOutputSchema
}).strict()

export const canonicalAiOperationSchema = z.discriminatedUnion('kind', [
  canonicalStructuredTextOperationSchema,
  canonicalImageGenerationOperationSchema,
  canonicalImageEditOperationSchema
])

export const aiUsageSchema = z.object({
  inputTokens: z.number().int().nonnegative().optional(),
  outputTokens: z.number().int().nonnegative().optional(),
  images: z.number().int().nonnegative().optional()
}).strict()

export const stagedAiImageSchema = z.object({
  container: z.string().trim().min(1),
  path: z.string().trim().min(1),
  contentType: z.enum(['image/png', 'image/jpeg', 'image/webp']),
  byteLength: z.number().int().positive(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/)
}).strict()

export const stagedAiImageOutputSchema = z.array(stagedAiImageSchema).min(1).max(4)

export const aiErrorSchema = z.object({
  code: z.string().trim().min(1),
  message: z.string().trim().min(1).max(500),
  retryAfterSeconds: z.number().int().positive().optional(),
  retryable: z.boolean()
}).strict()

export const normalizedAiResultSchema = z.object({
  providerOperationId: z.string().trim().min(1).optional(),
  usage: aiUsageSchema.optional(),
  output: z.unknown().optional(),
  error: aiErrorSchema.optional()
}).strict()

export type CanonicalAiOperation = z.infer<typeof canonicalAiOperationSchema>
export type StagedAiImage = z.infer<typeof stagedAiImageSchema>