import { z } from 'zod'
import {
  imageGenerationTemplateArtifactCacheEntrySchema,
  imageGenerationTemplateArtifactProvenanceEntrySchema
} from '../contracts/sanity.js'

const reusableArtifactKinds = ['colour-design', 'room', 'scene'] as const

const imageGenerationTemplateArtifactProjectionSchema = z.object({
  cacheEntry: imageGenerationTemplateArtifactCacheEntrySchema,
  provenanceEntry: imageGenerationTemplateArtifactProvenanceEntrySchema
}).superRefine(({ cacheEntry, provenanceEntry }, context) => {
  if (!reusableArtifactKinds.includes(cacheEntry.artifactKind as (typeof reusableArtifactKinds)[number])) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['cacheEntry', 'artifactKind'],
      message: 'A template artifact projection requires a reusable template artifact kind'
    })
  }

  if (cacheEntry.provenanceRef !== provenanceEntry.provenanceEntryId) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['cacheEntry', 'provenanceRef'],
      message: 'cacheEntry.provenanceRef must match provenanceEntry.provenanceEntryId'
    })
  }

  for (const field of ['artifactKind', 'scope', 'fingerprint', 'artifactRef', 'producerKey', 'producerVersion', 'policyVersion', 'surfaceProfileVersion', 'templateGeneration'] as const) {
    if (JSON.stringify(cacheEntry[field]) !== JSON.stringify(provenanceEntry[field])) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['provenanceEntry', field],
        message: `cacheEntry and provenanceEntry must have matching ${field}`
      })
    }
  }
})

export type ImageGenerationTemplateArtifactProjection = z.infer<typeof imageGenerationTemplateArtifactProjectionSchema>

export type ImageGenerationTemplateArtifactProjectionMetadata = Omit<
  ImageGenerationTemplateArtifactProjection['cacheEntry'],
  'artifactRef' | 'provenanceRef'
> & {
  provenanceEntryId: string
  recordedAt: string
}

/**
 * Validates the durable cache and provenance entries for one reusable template artifact
 * and returns a bounded metadata view suitable for operator-facing consumers.
 */
export function buildImageGenerationTemplateArtifactProjection(input: unknown): {
  cacheEntry: ImageGenerationTemplateArtifactProjection['cacheEntry']
  provenanceEntry: ImageGenerationTemplateArtifactProjection['provenanceEntry']
  metadata: ImageGenerationTemplateArtifactProjectionMetadata
} {
  const projection = imageGenerationTemplateArtifactProjectionSchema.parse(input)
  const { artifactRef: _artifactRef, provenanceRef: _provenanceRef, ...metadata } = projection.cacheEntry

  return {
    ...projection,
    metadata: {
      ...metadata,
      provenanceEntryId: projection.provenanceEntry.provenanceEntryId,
      recordedAt: projection.provenanceEntry.recordedAt
    }
  }
}