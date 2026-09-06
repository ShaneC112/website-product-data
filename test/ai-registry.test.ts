import { describe, expect, it } from 'vitest'
import { AI_MODEL_DEFINITIONS, aiModelRegistrySchema } from '../src/ai/model-registry.js'
import { AI_TASK_ROUTES, aiTaskRouteSchema } from '../src/ai/task-routing.js'

describe('aiModelRegistrySchema', () => {
  it('accepts the initial model registry', () => {
    const parsed = aiModelRegistrySchema.parse(AI_MODEL_DEFINITIONS)
    expect(parsed['gpt-4-1-mini'].key).toBe('gpt-4-1-mini')
    expect(parsed['flux-2-pro'].key).toBe('flux-2-pro')
  })

  it('rejects a repointed registry key', () => {
    const result = aiModelRegistrySchema.safeParse({
      ...AI_MODEL_DEFINITIONS,
      'gpt-4-1-mini': {
        ...AI_MODEL_DEFINITIONS['gpt-4-1-mini'],
        key: 'different-key'
      }
    })

    expect(result.success).toBe(false)
  })
})

describe('aiTaskRouteSchema', () => {
  it('accepts active direct and base-scene routes', () => {
    expect(aiTaskRouteSchema.parse(AI_TASK_ROUTES['image.render.direct']).lifecycle).toBe('active')
    expect(aiTaskRouteSchema.parse(AI_TASK_ROUTES['image.render.base-scene']).lifecycle).toBe('active')
  })

  it('keeps pattern refinement disabled for new runs', () => {
    expect(aiTaskRouteSchema.parse(AI_TASK_ROUTES['image.render.pattern-refinement']).lifecycle).toBe('disabled-for-new-runs')
  })
})