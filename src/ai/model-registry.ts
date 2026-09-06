import { z } from 'zod'

export const aiCapabilitySchema = z.enum(['structured-text', 'image-generation', 'image-edit'])

export const aiModelDefinitionSchema = z.object({
  key: z.string().trim().min(1),
  version: z.literal(1),
  providerFamily: z.string().trim().min(1),
  capabilities: z.array(aiCapabilitySchema).min(1),
  maxInputTokens: z.number().int().positive().optional(),
  maxOutputTokens: z.number().int().positive().optional(),
  lifecycle: z.enum(['active', 'disabled-for-new-runs', 'retired-compatible'])
}).strict()

export const AI_MODEL_DEFINITIONS = {
  'gpt-4-1-mini': {
    key: 'gpt-4-1-mini',
    version: 1,
    providerFamily: 'azure-openai',
    capabilities: ['structured-text'],
    maxInputTokens: 1048576,
    maxOutputTokens: 32768,
    lifecycle: 'active'
  },
  'flux-2-pro': {
    key: 'flux-2-pro',
    version: 1,
    providerFamily: 'azure-ai-image',
    capabilities: ['image-generation'],
    lifecycle: 'active'
  }
} as const satisfies Record<string, z.infer<typeof aiModelDefinitionSchema>>

export const aiModelRegistrySchema = z.record(aiModelDefinitionSchema).superRefine((registry, ctx) => {
  const seen = new Set<string>()
  for (const [key, value] of Object.entries(registry)) {
    if (key !== value.key) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [key, 'key'], message: 'registry key must match model key' })
    }
    if (seen.has(value.key)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [key], message: 'duplicate model key' })
    }
    seen.add(value.key)
  }
})