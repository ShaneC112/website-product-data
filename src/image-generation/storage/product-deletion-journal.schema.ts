import { z } from 'zod'

export const productDeletionFenceAliasKindSchema = z.enum([
  'style-code',
  'source-group',
  'm2crm',
  'url'
])

export const productDeletionFenceAliasMemberSchema = z.object({
  aliasKind: productDeletionFenceAliasKindSchema,
  aliasValue: z.string().trim().min(1)
}).strict()

const imageGenerationProductDeletionClosureTemplateSchema = z.object({
  templateId: z.string().trim().min(1),
  revision: z.string().trim().min(1),
  productRef: z.string().trim().min(1).optional(),
  bindingProductId: z.string().trim().min(1).optional(),
}).strict()

const imageGenerationProductDeletionClosureRequestSchema = z.object({
  requestId: z.string().trim().min(1),
  documentId: z.string().trim().min(1),
  revision: z.string().trim().min(1),
  templateId: z.string().trim().min(1),
}).strict()

const imageGenerationProductDeletionClosureRunLogSchema = z.object({
  documentId: z.string().trim().min(1),
  revision: z.string().trim().min(1),
  templateId: z.string().trim().min(1),
  requestId: z.string().trim().min(1),
  runId: z.string().trim().min(1),
  runEpoch: z.number().int().min(0),
}).strict()

export const imageGenerationProductDeletionClosureSnapshotSchema = z.object({
  productId: z.string().trim().min(1),
  templates: z.array(imageGenerationProductDeletionClosureTemplateSchema),
  requests: z.array(imageGenerationProductDeletionClosureRequestSchema),
  runLogs: z.array(imageGenerationProductDeletionClosureRunLogSchema),
}).strict()

export const productDeletionPipelineClosureSnapshotSchema = z.object({
  productId: z.string().trim().min(1),
  productFenceGeneration: z.number().int().positive(),
  styleCode: z.object({
    raw: z.string().trim().min(1),
    normalized: z.string().trim().min(1)
  }).strict(),
  sourceGroup: z.object({
    key: z.string().trim().min(1),
    storageKey: z.string().trim().min(1)
  }).strict(),
  m2crmIds: z.array(z.string().trim().min(1)),
  urlKeys: z.array(z.string().trim().min(1)),
  aliases: z.array(productDeletionFenceAliasMemberSchema)
}).strict()

export const productDeletionPermitScopeSchema = z.enum([
  'publish-asset-upload',
  'publish-media-image-write',
  'publish-draft-write'
])

export const productDeletionPermitSchema = z.object({
  productId: z.string().trim().min(1),
  productFenceGeneration: z.number().int().positive(),
  workKey: z.string().trim().min(1),
  sideEffectScope: productDeletionPermitScopeSchema
}).strict()

export const imageGenerationProductDeletionJournalPhaseSchema = z.enum([
  'fence-acquired',
  'draining-pre-fence-work',
  'awaiting-drain-retry',
  'terminality-proven',
  'payloads-retired',
  'requests-deleted',
  'run-logs-deleted',
  'templates-deleted',
  'product-deleted',
  'azure-state-retired',
  'completed',
  'failed-terminal'
])

export const imageGenerationProductDeletionActiveWorkItemSchema = z.object({
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

export const imageGenerationProductDeletionJournalSchema = z.object({
  partitionKey: z.literal('product-deletion-journal'),
  rowKey: z.string().trim().min(1),
  schemaVersion: z.literal(1),
  controlId: z.string().trim().min(1),
  productId: z.string().trim().min(1),
  styleCode: z.string().trim().min(1),
  productFenceGeneration: z.number().int().positive().optional(),
  phase: imageGenerationProductDeletionJournalPhaseSchema,
  resultOutcome: z.enum([
    'accepted',
    'blocked',
    'blocked_active_work',
    'stabilizing',
    'conflict_revision',
    'unsupported_absence_dependent_closure'
  ]),
  resultReasonCode: z.string().trim().min(1).optional(),
  resultCurrentRevision: z.string().trim().min(1).optional(),
  activeWork: z.array(imageGenerationProductDeletionActiveWorkItemSchema).max(25).optional(),
  drainRoster: z.array(imageGenerationProductDeletionActiveWorkItemSchema).max(25).optional(),
  closureSnapshotJson: z.string().trim().min(1).optional(),
  pipelineClosureSnapshotJson: z.string().trim().min(1).optional(),
  nextRetryAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).strict()
