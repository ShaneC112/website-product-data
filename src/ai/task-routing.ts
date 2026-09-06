import { z } from 'zod'

export const aiExecutionBindingSchema = z.object({
  key: z.string().trim().min(1),
  operationKind: z.enum(['structured-text', 'image-generation', 'image-edit']),
  modelKey: z.string().trim().min(1),
  adapterKey: z.string().trim().min(1),
  adapterVersion: z.number().int().positive(),
  requestPolicyKey: z.string().trim().min(1),
  lifecycle: z.enum(['active', 'disabled-for-new-runs', 'retired-compatible'])
}).strict()

export const aiTaskRouteSchema = z.object({
  key: z.string().trim().min(1),
  version: z.literal(1),
  bindingKey: z.string().trim().min(1),
  operationKind: z.enum(['structured-text', 'image-generation', 'image-edit']),
  lifecycle: z.enum(['active', 'disabled-for-new-runs', 'retired-compatible'])
}).strict()

export const AI_TASK_ROUTES = {
  'image.scene.generate': {
    key: 'image.scene.generate',
    version: 1,
    bindingKey: 'gpt-4-1-mini-structured-text',
    operationKind: 'structured-text',
    lifecycle: 'active'
  },
  'image.texture.generate': {
    key: 'image.texture.generate',
    version: 1,
    bindingKey: 'gpt-4-1-mini-structured-text',
    operationKind: 'structured-text',
    lifecycle: 'active'
  },
  'image.pattern.generate': {
    key: 'image.pattern.generate',
    version: 1,
    bindingKey: 'gpt-4-1-mini-structured-text',
    operationKind: 'structured-text',
    lifecycle: 'active'
  },
  'image.colour-design.generate': {
    key: 'image.colour-design.generate',
    version: 1,
    bindingKey: 'gpt-4-1-mini-structured-text',
    operationKind: 'structured-text',
    lifecycle: 'active'
  },
  'image.render.direct': {
    key: 'image.render.direct',
    version: 1,
    bindingKey: 'flux-2-pro-image-generation',
    operationKind: 'image-generation',
    lifecycle: 'active'
  },
  'image.render.base-scene': {
    key: 'image.render.base-scene',
    version: 1,
    bindingKey: 'flux-2-pro-image-generation',
    operationKind: 'image-generation',
    lifecycle: 'active'
  },
  'image.render.pattern-refinement': {
    key: 'image.render.pattern-refinement',
    version: 1,
    bindingKey: 'flux-2-pro-image-generation',
    operationKind: 'image-generation',
    lifecycle: 'disabled-for-new-runs'
  }
} as const