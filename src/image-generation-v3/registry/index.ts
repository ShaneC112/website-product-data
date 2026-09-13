import { z } from 'zod'

/**
 * V3 product family identifiers. Plain carpet is the first and currently only family in the V3 plan;
 * later families require separate decision and planning before addition here.
 */
export const imageGenerationV3FamilyKeySchema = z.enum(['plain-carpet'])

export type ImageGenerationV3FamilyKey = z.infer<typeof imageGenerationV3FamilyKeySchema>

/**
 * V3 FLUX route/model identifiers. Each route maps to a specific provider, render path, and feature set.
 * Plain carpet uses direct FLUX 2 Pro; future routes may use Flux Kontext or other providers.
 */
export const imageGenerationV3RouteKeySchema = z.enum(['flux-2-pro'])

export type ImageGenerationV3RouteKey = z.infer<typeof imageGenerationV3RouteKeySchema>

/**
 * Workflow version pinned into the immutable per-run plan. Identifies the exact features, assembly,
 * and prompt-generation versions that produced a given run's output.
 */
export const imageGenerationV3WorkflowVersionSchema = z.object({
  workflow: z.literal(3),
  family: imageGenerationV3FamilyKeySchema,
  route: imageGenerationV3RouteKeySchema,
  featureVersions: z.record(z.string(), z.number().int().positive()),
  assemblyVersion: z.number().int().positive(),
  promptReviewVersion: z.number().int().positive()
}).strict()

export type ImageGenerationV3WorkflowVersion = z.infer<typeof imageGenerationV3WorkflowVersionSchema>

/**
 * Eligibility check for a product request on a given family. Plain carpet is eligible for
 * all products in the first V3 slice; later families may have narrower eligibility.
 */
export function isEligibleForFamily(family: ImageGenerationV3FamilyKey): boolean {
  // Plain carpet is eligible for all products. Future families will narrow this.
  if (family === 'plain-carpet') {
    return true
  }
  return false
}
