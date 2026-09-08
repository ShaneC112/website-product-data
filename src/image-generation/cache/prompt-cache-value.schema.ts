import { z } from 'zod'
import { sanityAiTexturePromptCacheSchema } from '../sanity/texture-prompt.schema.js'

export const promptCacheValueSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('texture'),
    schemaVersion: z.literal(1),
    value: sanityAiTexturePromptCacheSchema
  }).strict()
])

export type PromptCacheValue = z.infer<typeof promptCacheValueSchema>