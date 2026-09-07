import { z } from 'zod'

export const imageGenerationTemplateCreateRequestTypeSchema = z.literal('image_generation_template_create')

export const imageGenerationTemplateCreateRequestStatusSchema = z.enum([
  'pending',
  'queued',
  'processing',
  'completed',
  'failed'
])

export const imageGenerationTemplateCreateResultSchema = z.object({
  outcome: z.enum(['created', 'reused', 'failed']),
  templateId: z.string().trim().min(1).optional(),
  reasonCode: z.string().trim().min(1).optional(),
  message: z.string().trim().min(1),
  completedAt: z.string().datetime()
})

export const imageGenerationTemplateCreateRequestDocumentSchema = z.object({
  _id: z.string().trim().min(1).optional(),
  _type: z.literal('imageGenerationTemplateCreateRequest'),
  requestId: z.string().trim().min(1),
  requestType: imageGenerationTemplateCreateRequestTypeSchema,
  productId: z.string().trim().min(1),
  status: imageGenerationTemplateCreateRequestStatusSchema,
  progressMessages: z.array(z.string().trim().min(1)).default([]),
  result: imageGenerationTemplateCreateResultSchema.optional(),
  requestedAt: z.string().datetime()
})

export type ImageGenerationTemplateCreateResult = z.infer<typeof imageGenerationTemplateCreateResultSchema>
export type ImageGenerationTemplateCreateRequestDocument = z.infer<typeof imageGenerationTemplateCreateRequestDocumentSchema>
export type ImageGenerationTemplateCreateRequestStatus = z.infer<typeof imageGenerationTemplateCreateRequestStatusSchema>
