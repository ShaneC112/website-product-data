import { z } from 'zod'
import { imageGenerationSubmissionOutcomeSchema, imageGenerationSubmissionStateSchema } from '../sanity/request.schema.js'
import {
  imageGenerationV3RecoveryAcceptedResultSchema,
  imageGenerationV3RecoveryBlockedResultSchema,
  imageGenerationV3RecoveryConflictResultSchema,
  imageGenerationV3RecoveryControlSchema,
  imageGenerationV3RecoveryFailedResultSchema
} from '../../image-generation-v3/contracts/recovery.schema.js'

const guardedControlOperationSchema = z.enum([
  'pattern.validate',
  'request.duplicate',
  'template.delete',
  'template.reset',
  'template.rebind',
  'request.refreshPolicy',
  'product.delete',
  'request.recover'
])

const guardedControlBaseSchema = z.object({
  controlId: z.string().trim().min(1),
  operation: guardedControlOperationSchema,
  requestedAt: z.string().datetime()
})

export const imageGenerationPatternValidateControlSchema = guardedControlBaseSchema.extend({
  operation: z.literal('pattern.validate'),
  requestId: z.string().trim().min(1),
  runId: z.string().trim().min(1),
  runEpoch: z.number().int().nonnegative(),
  artifactId: z.string().trim().min(1),
  expectedArtifactHash: z.string().trim().min(1),
  expectedRequestRevision: z.string().trim().min(1),
  validationDecision: z.enum(['validated', 'failed'])
}).strict()

export const imageGenerationRequestDuplicateControlSchema = guardedControlBaseSchema.extend({
  operation: z.literal('request.duplicate'),
  sourceRequestId: z.string().trim().min(1),
  sourceRequestRevision: z.string().trim().min(1),
  templateId: z.string().trim().min(1)
}).strict()

const imageGenerationTemplateResetControlBaseSchema = guardedControlBaseSchema.extend({
  operation: z.literal('template.reset'),
  templateId: z.string().trim().min(1),
  expectedTemplateRevision: z.string().trim().min(1),
  targetRunId: z.string().trim().min(1).optional(),
  targetRunEpoch: z.number().int().nonnegative().optional()
}).strict()

export const imageGenerationTemplateDeleteControlSchema = guardedControlBaseSchema.extend({
  operation: z.literal('template.delete'),
  templateId: z.string().trim().min(1),
  expectedTemplateRevision: z.string().trim().min(1)
}).strict()

export const imageGenerationTemplateResetControlSchema = imageGenerationTemplateResetControlBaseSchema.superRefine((value, context) => {
  const hasRunId = typeof value.targetRunId === 'string'
  const hasRunEpoch = typeof value.targetRunEpoch === 'number'

  if (hasRunId !== hasRunEpoch) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'targetRunId and targetRunEpoch must either both be present or both be absent'
    })
  }
})

export const imageGenerationTemplateRebindControlSchema = guardedControlBaseSchema.extend({
  operation: z.literal('template.rebind'),
  templateId: z.string().trim().min(1),
  expectedTemplateRevision: z.string().trim().min(1),
  targetProductId: z.string().trim().min(1),
  targetVariantIds: z.array(z.string().trim().min(1)).min(1)
}).strict()

export const imageGenerationRequestRefreshPolicyControlSchema = guardedControlBaseSchema.extend({
  operation: z.literal('request.refreshPolicy'),
  requestId: z.string().trim().min(1),
  expectedRequestRevision: z.string().trim().min(1),
  expectedPolicyHash: z.string().trim().min(1),
  currentRunId: z.string().trim().min(1),
  currentRunEpoch: z.number().int().nonnegative()
}).strict()

const expectedProductDocumentRevisionSchema = z.object({
  documentId: z.string().trim().min(1),
  revision: z.string().trim().min(1)
}).strict()

const blockedActiveWorkItemSchema = z.object({
  requestId: z.string().trim().min(1),
  durableKind: z.enum([
    'submission-claim',
    'orchestration',
    'dispatch-intent',
    'run-snapshot',
    'run-content',
    'run-content-claim'
  ]),
  reasonCode: z.string().trim().min(1)
}).strict()

const imageGenerationProductDeleteControlBaseSchema = guardedControlBaseSchema.extend({
  operation: z.literal('product.delete'),
  productId: z.string().trim().min(1),
  styleCode: z.string().trim().min(1),
  expectedProductDocuments: z.tuple([
    expectedProductDocumentRevisionSchema,
    expectedProductDocumentRevisionSchema
  ])
}).strict()

export const imageGenerationProductDeleteControlSchema = imageGenerationProductDeleteControlBaseSchema.superRefine((value, context) => {
  const expectedIds = new Set([value.productId, `drafts.${value.productId}`])
  const seen = new Set<string>()

  for (const [index, document] of value.expectedProductDocuments.entries()) {
    if (!expectedIds.has(document.documentId)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['expectedProductDocuments', index, 'documentId'],
        message: 'expectedProductDocuments must contain exactly the published and draft product document IDs'
      })
    }
    if (seen.has(document.documentId)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['expectedProductDocuments', index, 'documentId'],
        message: 'expectedProductDocuments cannot contain duplicate document IDs'
      })
    }
    seen.add(document.documentId)
  }

  if (seen.size !== expectedIds.size || ![...expectedIds].every((documentId) => seen.has(documentId))) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['expectedProductDocuments'],
      message: 'expectedProductDocuments must include both the published and draft product document revisions'
    })
  }
})

export const imageGenerationGuardedControlRequestSchema = z.discriminatedUnion('operation', [
  imageGenerationPatternValidateControlSchema,
  imageGenerationRequestDuplicateControlSchema,
  imageGenerationTemplateDeleteControlSchema,
  imageGenerationTemplateResetControlBaseSchema,
  imageGenerationTemplateRebindControlSchema,
  imageGenerationRequestRefreshPolicyControlSchema,
  imageGenerationProductDeleteControlBaseSchema,
  imageGenerationV3RecoveryControlSchema
])

export const imageGenerationGuardedControlResultSchema = z.discriminatedUnion('outcome', [
  z.object({ outcome: z.literal('accepted'), controlId: z.string().trim().min(1) }).strict(),
  z.object({ outcome: z.literal('duplicate'), controlId: z.string().trim().min(1) }).strict(),
  z.object({
    outcome: z.literal('stabilizing'),
    controlId: z.string().trim().min(1),
    reasonCode: z.string().trim().min(1),
    activeWork: z.array(blockedActiveWorkItemSchema).min(1).max(25)
  }).strict(),
  z.object({ outcome: z.literal('conflict_revision'), controlId: z.string().trim().min(1), currentRevision: z.string().trim().min(1) }).strict(),
  z.object({ outcome: z.literal('conflict_hash'), controlId: z.string().trim().min(1), currentHash: z.string().trim().min(1) }).strict(),
  z.object({ outcome: z.literal('conflict_run'), controlId: z.string().trim().min(1), currentRunId: z.string().trim().min(1), currentRunEpoch: z.number().int().nonnegative() }).strict(),
  z.object({ outcome: z.literal('blocked'), controlId: z.string().trim().min(1), reasonCode: z.string().trim().min(1) }).strict(),
  z.object({
    outcome: z.literal('blocked_active_work'),
    controlId: z.string().trim().min(1),
    reasonCode: z.string().trim().min(1),
    activeWork: z.array(blockedActiveWorkItemSchema).min(1).max(25)
  }).strict(),
  z.object({ outcome: z.literal('unsupported_absence_dependent_closure'), controlId: z.string().trim().min(1), reasonCode: z.string().trim().min(1) }).strict(),
  z.object({ outcome: z.literal('not_found'), controlId: z.string().trim().min(1), target: z.string().trim().min(1) }).strict(),
  z.object({ outcome: z.literal('invalid_state'), controlId: z.string().trim().min(1), reasonCode: z.string().trim().min(1) }).strict(),
  imageGenerationV3RecoveryAcceptedResultSchema,
  imageGenerationV3RecoveryBlockedResultSchema,
  imageGenerationV3RecoveryConflictResultSchema,
  imageGenerationV3RecoveryFailedResultSchema
])

export const aiImageGenerationControlIntentSchema = z.object({
  _id: z.string().trim().min(1),
  _type: z.literal('aiImageGenerationControlIntent'),
  controlId: z.string().trim().min(1),
  submissionId: z.string().trim().min(1),
  submissionState: imageGenerationSubmissionStateSchema,
  submissionOutcome: imageGenerationSubmissionOutcomeSchema.optional(),
  result: imageGenerationGuardedControlResultSchema.optional(),
  control: imageGenerationGuardedControlRequestSchema,
  requestedAt: z.string().datetime()
}).strict().superRefine((value, context) => {
  if (value._id !== value.controlId || value.submissionId !== value.controlId || value.control.controlId !== value.controlId) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'control intent _id, submissionId, controlId, and nested controlId must match'
    })
  }

  if (value.control.requestedAt !== value.requestedAt) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'control intent and nested control requestedAt must match'
    })
  }

  if ((value.submissionState === 'pending') === Boolean(value.submissionOutcome)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'pending control intents cannot have an outcome and non-pending intents require one'
    })
  } else if (value.submissionOutcome && value.submissionOutcome.outcome !== value.submissionState) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'control intent submission state and outcome must match'
    })
  }

  if (value.submissionState === 'pending' && value.result) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'pending control intents cannot have a guarded-control result'
    })
  }
})

export type ImageGenerationGuardedControlRequest = z.infer<typeof imageGenerationGuardedControlRequestSchema>
export type ImageGenerationGuardedControlResult = z.infer<typeof imageGenerationGuardedControlResultSchema>
export type AiImageGenerationControlIntent = z.infer<typeof aiImageGenerationControlIntentSchema>

export function buildImageGenerationRequestDuplicateControl(input: {
  controlId: string
  requestedAt: string
  sourceRequestId: string
  sourceRequestRevision: string
  templateId: string
}): ImageGenerationGuardedControlRequest {
  return imageGenerationRequestDuplicateControlSchema.parse({
    operation: 'request.duplicate',
    controlId: input.controlId,
    requestedAt: input.requestedAt,
    sourceRequestId: input.sourceRequestId,
    sourceRequestRevision: input.sourceRequestRevision,
    templateId: input.templateId
  })
}

export function buildImageGenerationPatternValidateControl(input: {
  controlId: string
  requestedAt: string
  requestId: string
  runId: string
  runEpoch: number
  artifactId: string
  expectedArtifactHash: string
  expectedRequestRevision: string
  validationDecision: 'validated' | 'failed'
}): ImageGenerationGuardedControlRequest {
  return imageGenerationPatternValidateControlSchema.parse({
    operation: 'pattern.validate',
    controlId: input.controlId,
    requestedAt: input.requestedAt,
    requestId: input.requestId,
    runId: input.runId,
    runEpoch: input.runEpoch,
    artifactId: input.artifactId,
    expectedArtifactHash: input.expectedArtifactHash,
    expectedRequestRevision: input.expectedRequestRevision,
    validationDecision: input.validationDecision
  })
}

export function buildImageGenerationTemplateResetControl(input: {
  controlId: string
  requestedAt: string
  templateId: string
  expectedTemplateRevision: string
  targetRunId?: string
  targetRunEpoch?: number
}): z.infer<typeof imageGenerationTemplateResetControlSchema> {
  return imageGenerationTemplateResetControlSchema.parse({
    operation: 'template.reset',
    controlId: input.controlId,
    requestedAt: input.requestedAt,
    templateId: input.templateId,
    expectedTemplateRevision: input.expectedTemplateRevision,
    targetRunId: input.targetRunId,
    targetRunEpoch: input.targetRunEpoch
  })
}

export function buildImageGenerationTemplateDeleteControl(input: {
  controlId: string
  requestedAt: string
  templateId: string
  expectedTemplateRevision: string
}): z.infer<typeof imageGenerationTemplateDeleteControlSchema> {
  return imageGenerationTemplateDeleteControlSchema.parse({
    operation: 'template.delete',
    controlId: input.controlId,
    requestedAt: input.requestedAt,
    templateId: input.templateId,
    expectedTemplateRevision: input.expectedTemplateRevision
  })
}

export function buildImageGenerationTemplateRebindControl(input: {
  controlId: string
  requestedAt: string
  templateId: string
  expectedTemplateRevision: string
  targetProductId: string
  targetVariantIds: string[]
}): ImageGenerationGuardedControlRequest {
  return imageGenerationTemplateRebindControlSchema.parse({
    operation: 'template.rebind',
    controlId: input.controlId,
    requestedAt: input.requestedAt,
    templateId: input.templateId,
    expectedTemplateRevision: input.expectedTemplateRevision,
    targetProductId: input.targetProductId,
    targetVariantIds: input.targetVariantIds
  })
}

export function buildImageGenerationRequestRefreshPolicyControl(input: {
  controlId: string
  requestedAt: string
  requestId: string
  expectedRequestRevision: string
  expectedPolicyHash: string
  currentRunId: string
  currentRunEpoch: number
}): ImageGenerationGuardedControlRequest {
  return imageGenerationRequestRefreshPolicyControlSchema.parse({
    operation: 'request.refreshPolicy',
    controlId: input.controlId,
    requestedAt: input.requestedAt,
    requestId: input.requestId,
    expectedRequestRevision: input.expectedRequestRevision,
    expectedPolicyHash: input.expectedPolicyHash,
    currentRunId: input.currentRunId,
    currentRunEpoch: input.currentRunEpoch
  })
}

export function buildImageGenerationProductDeleteControl(input: {
  controlId: string
  requestedAt: string
  productId: string
  styleCode: string
  expectedProductDocuments: Array<{documentId: string; revision: string}>
}): ImageGenerationGuardedControlRequest {
  return imageGenerationProductDeleteControlSchema.parse({
    operation: 'product.delete',
    controlId: input.controlId,
    requestedAt: input.requestedAt,
    productId: input.productId,
    styleCode: input.styleCode,
    expectedProductDocuments: input.expectedProductDocuments
  })
}

export function buildV3RecoveryControl(input: Omit<z.infer<typeof imageGenerationV3RecoveryControlSchema>, 'operation'>): ImageGenerationGuardedControlRequest {
  return imageGenerationV3RecoveryControlSchema.parse({
    operation: 'request.recover',
    ...input
  })
}