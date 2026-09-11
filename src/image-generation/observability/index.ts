import { z } from 'zod'

export const fluxPromptStageSchema = z.enum([
  'room',
  'scene',
  'texture',
  'colour-design',
  'pattern',
  'camera',
  'product',
  'brand',
  'assembly',
  'provider'
])

export const fluxPromptEventNameSchema = z.enum([
  'input',
  'ai-vision:system-prompt',
  'ai-vision:user-prompt',
  'ai-vision:structured-output',
  'normalization',
  'guard',
  'cache',
  'rendered-contribution',
  'output',
  'assembly-section',
  'assembled-prompt',
  'render-input'
])

export const fluxPromptProducerKindSchema = z.enum([
  'vision',
  'deterministic',
  'sanity-authored',
  'cache',
  'assembly',
  'provider'
])

export type FluxPromptStage = z.infer<typeof fluxPromptStageSchema>
export type FluxPromptEventName = z.infer<typeof fluxPromptEventNameSchema>
export type FluxPromptProducerKind = z.infer<typeof fluxPromptProducerKindSchema>

export const fluxPromptModuleSchema = z.string().regex(/^flux:(room|scene|texture|colour-design|pattern|camera|product|brand|assembly|provider)$/)

export function createFluxPromptTraceEventId(stage: FluxPromptStage, event: FluxPromptEventName): string {
  return `flux:${stage}:${event}`
}

export function createFluxPromptAssemblySectionEventId(sectionKey: string): string {
  const normalized = z.string().regex(/^[a-z][a-z0-9-]*$/).parse(sectionKey)
  return `flux:assembly:assembly-section#${normalized}`
}

export function getFluxPromptStageFromModule(module: string): FluxPromptStage {
  const match = module.match(/^flux:(.+)$/)
  if (!match) {
    throw new Error('Module must start with flux:')
  }

  const stage = match[1] as FluxPromptStage
  return fluxPromptStageSchema.parse(stage)
}

const prohibitedTraceKeyPattern = /token|password|secret|apikey|authorization|cookie|sas|connectionstring|credential|imagebytes|headers?/i
const MAX_TRACE_DEPTH = 10
const MAX_TRACE_STRING_LENGTH = 100_000
const MAX_TRACE_COLLECTION_LENGTH = 200
const MAX_TRACE_SERIALIZED_BYTES = 256 * 1024

function assertSafeTraceValue(value: unknown, path: string, context: z.RefinementCtx, depth = 0): void {
  if (depth > MAX_TRACE_DEPTH) {
    context.addIssue({code: z.ZodIssueCode.custom, message: 'Trace content exceeds maximum nesting depth', path: [path]})
    return
  }
  if (typeof value === 'string') {
    if (value.length > MAX_TRACE_STRING_LENGTH) {
      context.addIssue({code: z.ZodIssueCode.custom, message: 'Trace content contains an oversized string', path: [path]})
    }
    if (/^data:[^;]+;base64,/i.test(value) || /(?:https?:\/\/|asset:)[^\s]+[?&](?:sig|se|sv|sp|ske|token)=/i.test(value)) {
      context.addIssue({code: z.ZodIssueCode.custom, message: 'Trace content contains a signed URL or image data URL', path: [path]})
    }
    return
  }
  if (Array.isArray(value)) {
    if (value.length > MAX_TRACE_COLLECTION_LENGTH) {
      context.addIssue({code: z.ZodIssueCode.custom, message: 'Trace content contains an oversized array', path: [path]})
    }
    value.forEach((item, index) => assertSafeTraceValue(item, `${path}.${index}`, context, depth + 1))
    return
  }
  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, nested]) => {
      if (prohibitedTraceKeyPattern.test(key)) {
        context.addIssue({code: z.ZodIssueCode.custom, message: `Trace content contains prohibited field ${key}`, path: [path, key]})
      }
      assertSafeTraceValue(nested, `${path}.${key}`, context, depth + 1)
    })
  }
}

const fluxPromptAllowedContentSchema = z.object({
  input: z.unknown().optional(),
  systemPrompt: z.string().optional(),
  userPrompt: z.string().optional(),
  structuredOutput: z.unknown().optional(),
  normalizedOutput: z.unknown().optional(),
  cacheDecision: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
  renderedContribution: z.string().optional(),
  assembledPrompt: z.string().optional(),
  renderInput: z.unknown().optional()
}).strict().superRefine((value, context) => {
  assertSafeTraceValue(value, 'content', context)
  try {
    if (Buffer.byteLength(JSON.stringify(value), 'utf8') > MAX_TRACE_SERIALIZED_BYTES) {
      context.addIssue({code: z.ZodIssueCode.custom, message: 'Trace content exceeds maximum serialized size', path: ['content']})
    }
  } catch {
    context.addIssue({code: z.ZodIssueCode.custom, message: 'Trace content is not serializable', path: ['content']})
  }
})

const fluxPromptMetadataScalarSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null()
])

const fluxPromptMetadataSchema = z.object({}).catchall(fluxPromptMetadataScalarSchema)

const eventContentMap: Record<FluxPromptEventName, readonly string[]> = {
  input: ['input'],
  'ai-vision:system-prompt': ['systemPrompt'],
  'ai-vision:user-prompt': ['userPrompt'],
  'ai-vision:structured-output': ['structuredOutput'],
  normalization: ['normalizedOutput'],
  guard: ['normalizedOutput'],
  cache: ['cacheDecision'],
  'rendered-contribution': ['renderedContribution'],
  output: ['normalizedOutput'],
  'assembly-section': ['renderedContribution'],
  'assembled-prompt': ['assembledPrompt'],
  'render-input': ['renderInput']
}

export const fluxPromptTraceEnvelopeSchema = z.object({
  schemaVersion: z.literal(1),
  contractVersion: z.number().int().min(1),
  variant: z.enum(['current', 'candidate']),
  module: fluxPromptModuleSchema,
  event: fluxPromptEventNameSchema,
  eventId: z.string().min(1),
  fixtureId: z.string().trim().min(1).optional(),
  requestId: z.string().trim().min(1).optional(),
  runId: z.string().trim().min(1).optional(),
  room: z.string().trim().min(1).optional(),
  producerKind: fluxPromptProducerKindSchema,
  sourceEventIds: z.array(z.string().trim().min(1)).default([]),
  content: fluxPromptAllowedContentSchema,
  metadata: fluxPromptMetadataSchema.optional()
}).strict().superRefine((value, context) => {
  const stageMatch = value.module.match(/^flux:(.+)$/)
  if (!stageMatch) {
    return
  }

  const stage = stageMatch[1] as FluxPromptStage
  const expectedEventId = createFluxPromptTraceEventId(fluxPromptStageSchema.parse(stage), value.event)
  const validAssemblySectionId = value.event === 'assembly-section'
    && /^flux:assembly:assembly-section#[a-z][a-z0-9-]*$/.test(value.eventId)
  const validAssemblySourceId = value.event === 'output'
    && value.module === 'flux:assembly'
    && /^flux:assembly:source:[a-z][a-z0-9-]*$/.test(value.eventId)
  if (value.eventId !== expectedEventId && !validAssemblySectionId && !validAssemblySourceId) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: `eventId must equal ${expectedEventId}`,
      path: ['eventId']
    })
  }

  const expectedFields = eventContentMap[value.event]
  if (value.content) {
    const content = value.content
    const invalidKeys = Object.keys(content).filter((key) => !expectedFields.includes(key))
    if (invalidKeys.length > 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `content keys are invalid for event ${value.event}`,
        path: ['content']
      })
    }

    const missing = expectedFields.filter((field) => !(field in content))
    if (missing.length > 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `content for ${value.event} is missing expected field(s): ${missing.join(', ')}`,
        path: ['content']
      })
    }
  }
})

export type FluxPromptTraceEnvelope = z.infer<typeof fluxPromptTraceEnvelopeSchema>

export const promptContractComparisonSchema = z.object({
  currentVersion: z.number().int().min(1),
  candidateVersion: z.number().int().min(1).optional(),
  changedProducers: z.array(z.string().trim().min(1)).default([]),
  expectedAffected: z.array(z.string().trim().min(1)).default([])
}).strict().superRefine((value, context) => {
  if (value.candidateVersion !== undefined && value.candidateVersion !== value.currentVersion + 1) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'candidateVersion must equal currentVersion + 1',
      path: ['candidateVersion']
    })
  }
})

export const fluxPromptProcessNodeSchema = z.object({
  nodeId: z.string().trim().min(1),
  stage: fluxPromptStageSchema,
  event: fluxPromptEventNameSchema,
  producerKind: fluxPromptProducerKindSchema
}).strict()

export const fluxPromptProcessEdgeSchema = z.object({
  from: z.string().trim().min(1),
  to: z.string().trim().min(1),
  relationship: z.enum(['source', 'rendered-section', 'assembly']).default('source')
}).strict()

export const fluxPromptProcessMapSchema = z.object({
  schemaVersion: z.literal(1),
  nodes: z.array(fluxPromptProcessNodeSchema),
  edges: z.array(fluxPromptProcessEdgeSchema)
}).strict()

export const fluxPromptBaselineSchema = z.object({
  schemaVersion: z.literal(1),
  fixtureId: z.string().trim().min(1),
  contractVersion: z.number().int().min(1),
  finalPromptHash: z.string().trim().min(1).optional(),
  normalizedEvents: z.array(fluxPromptTraceEnvelopeSchema),
  processMap: fluxPromptProcessMapSchema
}).strict()

export type FluxPromptBaseline = z.infer<typeof fluxPromptBaselineSchema>
export type FluxPromptProcessNode = z.infer<typeof fluxPromptProcessNodeSchema>
export type FluxPromptProcessEdge = z.infer<typeof fluxPromptProcessEdgeSchema>
export type FluxPromptProcessMap = z.infer<typeof fluxPromptProcessMapSchema>

export { fluxPromptAllowedContentSchema, fluxPromptMetadataSchema }
