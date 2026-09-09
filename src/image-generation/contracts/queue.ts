import { z } from 'zod'

export const imageGenerationStepSchema = z.enum(['resolve', 'generate', 'assemble', 'render', 'persist'])

export const imageGenerationWorkKindSchema = z.enum([
  'resolve.request',
  'generate.texture',
  'generate.pattern',
  'generate.room',
  'generate.scene',
  'generate.colour-design',
  'assemble.direct',
  'assemble.base-scene',
  'assemble.pattern-refinement',
  'render.direct',
  'render.base-scene',
  'render.pattern-refinement',
  'persist.media'
])

export const imageGenerationQueueEnvelopeSchema = z.object({
  schemaVersion: z.literal(1),
  requestId: z.string().trim().min(1),
  runId: z.string().trim().min(1),
  runEpoch: z.number().int().nonnegative(),
  step: imageGenerationStepSchema,
  workKind: imageGenerationWorkKindSchema,
  workKey: z.string().trim().min(1),
  dispatchToken: z.string().trim().min(1)
}).strict()

export const imageGenerationSanitySubmissionSchema = z.discriminatedUnion('submissionKind', [
  z.object({
    schemaVersion: z.literal(1),
    submissionKind: z.literal('product.request.enqueue'),
    submissionId: z.string().trim().min(1),
    documentId: z.string().trim().min(1),
    productId: z.string().trim().min(1),
    payloadKey: z.string().trim().min(1),
    requestId: z.string().trim().min(1),
    requestedAt: z.string().datetime()
  }).strict(),
  z.object({
    schemaVersion: z.literal(1),
    submissionKind: z.literal('request.enqueue'),
    submissionId: z.string().trim().min(1),
    documentId: z.string().trim().min(1),
    requestId: z.string().trim().min(1),
    requestedAt: z.string().datetime()
  }).strict(),
  z.object({
    schemaVersion: z.literal(1),
    submissionKind: z.literal('control.submit'),
    submissionId: z.string().trim().min(1),
    documentId: z.string().trim().min(1),
    controlId: z.string().trim().min(1),
    requestedAt: z.string().datetime()
  }).strict(),
  z.object({
    schemaVersion: z.literal(1),
    submissionKind: z.literal('template.delete'),
    submissionId: z.string().trim().min(1),
    documentId: z.string().trim().min(1),
    templateId: z.string().trim().min(1),
    requestedAt: z.string().datetime()
  }).strict()
]).superRefine((value, context) => {
  const intentId = value.submissionKind === 'product.request.enqueue'
    ? value.requestId
    : value.submissionKind === 'request.enqueue'
    ? value.requestId
    : value.submissionKind === 'control.submit'
      ? value.controlId
      : value.templateId

  const documentIdMatches = value.submissionKind === 'product.request.enqueue'
    ? value.documentId === value.productId
    : value.documentId === intentId

  if (value.submissionId !== intentId || !documentIdMatches) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: value.submissionKind === 'product.request.enqueue'
          ? 'product.request.enqueue submissionId must match requestId and documentId must match productId'
          : `${value.submissionKind} submissionId, documentId, and intent ID must match`
      })
  }
})

export type ImageGenerationQueueEnvelope = z.infer<typeof imageGenerationQueueEnvelopeSchema>
export type ImageGenerationSanitySubmission = z.infer<typeof imageGenerationSanitySubmissionSchema>
export type ImageGenerationSanitySubmissionReference = ImageGenerationSanitySubmission