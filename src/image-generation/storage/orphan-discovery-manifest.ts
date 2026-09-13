import { z } from 'zod'
import { sha256 } from '../sanity/sha256.js'

export const orphanDiscoveryAlgorithmVersion = 'orphan-discovery-v1' as const

export const orphanDiscoveryCandidateTypeSchema = z.enum(['template', 'request', 'run-log'])

export const orphanDiscoveryReasonCodeSchema = z.enum([
  'template_product_missing',
  'request_template_missing',
  'request_template_product_missing',
  'run_log_template_missing',
  'run_log_template_product_missing'
])

export const orphanDiscoveryDependencyEvidenceSchema = z.object({
  productId: z.string().trim().min(1).optional(),
  productRevision: z.string().trim().min(1).optional(),
  templateId: z.string().trim().min(1).optional(),
  templateRevision: z.string().trim().min(1).optional(),
  requestId: z.string().trim().min(1).optional(),
  requestRevision: z.string().trim().min(1).optional(),
  runLogId: z.string().trim().min(1).optional(),
  runLogRevision: z.string().trim().min(1).optional(),
  resolutionState: z.enum(['resolved', 'missing', 'unverifiable'])
}).strict()

export const orphanDiscoveryClosureRequestSchema = z.object({
  candidateType: z.literal('request'),
  canonicalId: z.string().trim().min(1),
  documentId: z.string().trim().min(1),
  revision: z.string().trim().min(1),
  reasonCode: orphanDiscoveryReasonCodeSchema,
  dependencyEvidence: z.array(orphanDiscoveryDependencyEvidenceSchema)
}).strict()

export const orphanDiscoveryClosureRunLogSchema = z.object({
  candidateType: z.literal('run-log'),
  canonicalId: z.string().trim().min(1),
  documentId: z.string().trim().min(1),
  revision: z.string().trim().min(1),
  reasonCode: orphanDiscoveryReasonCodeSchema,
  dependencyEvidence: z.array(orphanDiscoveryDependencyEvidenceSchema)
}).strict()

export const orphanDiscoveryCandidateClosureSchema = z.object({
  requests: z.array(orphanDiscoveryClosureRequestSchema),
  runLogs: z.array(orphanDiscoveryClosureRunLogSchema)
}).strict()

export const orphanDiscoveryCandidateSchema = z.object({
  candidateType: orphanDiscoveryCandidateTypeSchema,
  canonicalId: z.string().trim().min(1),
  documentId: z.string().trim().min(1),
  revision: z.string().trim().min(1),
  reasonCode: orphanDiscoveryReasonCodeSchema,
  dependencyEvidence: z.array(orphanDiscoveryDependencyEvidenceSchema),
  closure: orphanDiscoveryCandidateClosureSchema
}).strict()

export const orphanDiscoveryPageCursorSchema = z.object({
  cursorUpdatedAt: z.string().datetime(),
  cursorId: z.string().trim().min(1)
}).strict()

export const orphanDiscoveryManifestPayloadSchema = z.object({
  generatedAt: z.string().datetime(),
  upperUpdatedAt: z.string().datetime(),
  algorithmVersion: z.literal(orphanDiscoveryAlgorithmVersion),
  queryShapeVersion: z.literal(1),
  pageCursors: z.array(orphanDiscoveryPageCursorSchema),
  candidates: z.array(orphanDiscoveryCandidateSchema)
}).strict()

export const orphanDiscoveryManifestEnvelopeSchema = z.object({
  algorithmVersion: z.literal(orphanDiscoveryAlgorithmVersion),
  manifestId: z.string().regex(/^[a-f0-9]{64}$/),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  manifestPayload: orphanDiscoveryManifestPayloadSchema
}).strict()

export const productDeletionManifestReferenceSchema = z.object({
  manifestId: z.string().regex(/^[a-f0-9]{64}$/),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  algorithmVersion: z.literal(orphanDiscoveryAlgorithmVersion),
  blobName: z.string().trim().min(1),
  generatedAt: z.string().datetime()
}).strict()

function sortObject(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortObject)
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, sortObject(nested)])
    )
  }
  return value
}

export function canonicalizeOrphanDiscoveryManifestPayload(
  payload: z.input<typeof orphanDiscoveryManifestPayloadSchema>
): string {
  const parsed = orphanDiscoveryManifestPayloadSchema.parse(payload)
  return JSON.stringify(sortObject(parsed))
}

export function computeOrphanDiscoveryManifestSha256(
  payload: z.input<typeof orphanDiscoveryManifestPayloadSchema>
): string {
  return sha256(canonicalizeOrphanDiscoveryManifestPayload(payload))
}

export function computeOrphanDiscoveryManifestId(
  payload: z.input<typeof orphanDiscoveryManifestPayloadSchema>
): string {
  return computeOrphanDiscoveryManifestSha256(payload)
}

export function buildOrphanDiscoveryManifestBlobName(
  payload: z.input<typeof orphanDiscoveryManifestPayloadSchema>
): string {
  return `orphan-discovery/${computeOrphanDiscoveryManifestId(payload)}.json`
}

export function buildOrphanDiscoveryManifestEnvelope(
  payload: z.input<typeof orphanDiscoveryManifestPayloadSchema>
): z.infer<typeof orphanDiscoveryManifestEnvelopeSchema> {
  const parsedPayload = orphanDiscoveryManifestPayloadSchema.parse(payload)
  const digest = computeOrphanDiscoveryManifestSha256(parsedPayload)
  return orphanDiscoveryManifestEnvelopeSchema.parse({
    algorithmVersion: orphanDiscoveryAlgorithmVersion,
    manifestId: digest,
    sha256: digest,
    manifestPayload: parsedPayload
  })
}

export function verifyOrphanDiscoveryManifestEnvelope(
  envelope: z.input<typeof orphanDiscoveryManifestEnvelopeSchema>
): z.infer<typeof orphanDiscoveryManifestEnvelopeSchema> {
  const parsed = orphanDiscoveryManifestEnvelopeSchema.parse(envelope)
  const digest = computeOrphanDiscoveryManifestSha256(parsed.manifestPayload)
  if (parsed.manifestId !== digest || parsed.sha256 !== digest) {
    throw new Error('Orphan discovery manifest envelope failed integrity verification')
  }
  return parsed
}
