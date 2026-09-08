import { z } from 'zod'
import { sha256 } from '../sanity/sha256.js'

const normalizedGuidance = (maximumLength: number) => z.string()
  .transform((value) => value.trim().replace(/\s+/g, ' '))
  .pipe(z.string().min(1).max(maximumLength))

export const brandIdentitySchema = z.object({
  version: z.literal(1),
  visualGuidance: normalizedGuidance(280),
  brandGuidance: normalizedGuidance(220)
}).strict()

export type BrandIdentity = z.infer<typeof brandIdentitySchema>

export function brandIdentityFingerprint(value: BrandIdentity): string {
  return sha256(JSON.stringify({
    version: value.version,
    visualGuidance: value.visualGuidance,
    brandGuidance: value.brandGuidance
  }))
}