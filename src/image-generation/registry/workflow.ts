import { z } from 'zod'
import { imageGenerationStepSchema, imageGenerationWorkKindSchema } from '../contracts/queue.js'

export const imageGenerationWorkLifecycleSchema = z.enum(['active', 'disabled-for-new-runs', 'retired-compatible'])

export const imageGenerationWorkflowEntrySchema = z.object({
  step: imageGenerationStepSchema,
  workKind: imageGenerationWorkKindSchema,
  lifecycle: imageGenerationWorkLifecycleSchema
}).strict()

export const IMAGE_GENERATION_WORKFLOW = [
  { step: 'resolve', workKind: 'resolve.request', lifecycle: 'active' },
  { step: 'generate', workKind: 'generate.texture', lifecycle: 'active' },
  { step: 'generate', workKind: 'generate.pattern', lifecycle: 'active' },
  { step: 'generate', workKind: 'generate.room', lifecycle: 'active' },
  { step: 'generate', workKind: 'generate.scene', lifecycle: 'active' },
  { step: 'generate', workKind: 'generate.colour-design', lifecycle: 'active' },
  { step: 'assemble', workKind: 'assemble.direct', lifecycle: 'active' },
  { step: 'assemble', workKind: 'assemble.base-scene', lifecycle: 'disabled-for-new-runs' },
  { step: 'assemble', workKind: 'assemble.pattern-refinement', lifecycle: 'disabled-for-new-runs' },
  { step: 'render', workKind: 'render.direct', lifecycle: 'active' },
  { step: 'render', workKind: 'render.base-scene', lifecycle: 'disabled-for-new-runs' },
  { step: 'render', workKind: 'render.pattern-refinement', lifecycle: 'disabled-for-new-runs' },
  { step: 'persist', workKind: 'persist.media', lifecycle: 'active' }
] as const satisfies ReadonlyArray<z.infer<typeof imageGenerationWorkflowEntrySchema>>

export const imageGenerationWorkflowSchema = z.array(imageGenerationWorkflowEntrySchema).superRefine((entries, ctx) => {
  const seen = new Set<string>()
  for (const entry of entries) {
    const key = `${entry.step}:${entry.workKind}`
    if (seen.has(key)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `duplicate workflow entry ${key}` })
    }
    seen.add(key)
  }
})