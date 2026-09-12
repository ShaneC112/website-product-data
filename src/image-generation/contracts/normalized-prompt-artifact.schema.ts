import {z} from 'zod'

const boundedIdentifier = z.string().trim().min(1).max(256)
const fingerprint = z.string().regex(/^[a-f0-9]{64}$/i)
const sourceEventIds = z.array(boundedIdentifier).max(32)
const artifactKind = z.enum(['room', 'colour-design', 'texture', 'scene', 'camera', 'brand-identity', 'product', 'pattern'])

export const normalizedPromptArtifactMetadataSchema = z.object({
  envelopeVersion: z.literal(1),
  artifact: z.object({
    kind: artifactKind,
    schemaVersion: z.number().int().positive(),
    semanticFingerprint: fingerprint
  }).strict(),
  scope: z.object({
    documentKey: boundedIdentifier,
    templateId: boundedIdentifier.optional(),
    templateRevision: boundedIdentifier.optional(),
    variantKey: boundedIdentifier.optional(),
    roomKey: boundedIdentifier.optional()
  }).strict(),
  source: z.object({
    mode: z.enum(['sanity-cache', 'vision', 'deterministic', 'fallback', 'run-content']),
    sourceFingerprint: fingerprint.optional(),
    evidenceFingerprint: fingerprint.optional(),
    cacheKey: boundedIdentifier.optional(),
    cacheFingerprint: fingerprint.optional(),
    evidenceRefs: z.array(z.object({role: boundedIdentifier, stableRefOrHash: boundedIdentifier}).strict()).max(32).optional()
  }).strict(),
  contract: z.object({
    promptContractVersion: z.number().int().positive(),
    producerVersion: boundedIdentifier,
    normalizationVersion: boundedIdentifier,
    rendererVersion: boundedIdentifier.optional()
  }).strict(),
  provenance: z.object({
    outputReference: boundedIdentifier.optional(),
    sourceEventIds,
    producerEventId: boundedIdentifier.optional(),
    inputArtifactRefs: z.array(boundedIdentifier).max(32).optional()
  }).strict()
}).strict()

export type NormalizedPromptArtifactMetadata = z.infer<typeof normalizedPromptArtifactMetadataSchema>
