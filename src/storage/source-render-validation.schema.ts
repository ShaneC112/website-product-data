import { z } from 'zod'

// 01-source-render's own validation table (renamed from crawlValidation for explicit
// step-ownership - see plan/queue file refactor/01a-entity-table-redesign.md). Row shape is
// unchanged. Written/resolved by crawlRequestDispatcher.ts's ingress, deleted-by-partition by
// the destructive style-group purge.
export const sourceRenderValidationErrorSchema = z.object({
  path: z.string().trim().min(1),
  message: z.string().trim().min(1)
})

export const sourceRenderValidationErrorsSchema = z.array(sourceRenderValidationErrorSchema)

export const sourceRenderValidationTableSchema = z.object({
  partitionKey: z.string().trim().min(1),
  rowKey: z.string().trim().min(1),
  sourceGroupKey: z.string().trim().min(1).optional(),
  styleCodeRaw: z.string().trim().min(1).optional(),
  styleCodeStorageKey: z.string().trim().min(1).optional(),
  sourceTableName: z.string().trim().min(1),
  sourceRowKey: z.string().trim().min(1),
  m2crmUuid: z.string().trim().min(1).optional(),
  styleCode: z.string().trim().min(1).optional(),
  trade: z.string().trim().min(1).optional(),
  crawlUrl: z.string().trim().min(1).optional(),
  errorsJson: z.string().trim().min(1),
  firstSeenAt: z.string().trim().min(1),
  lastSeenAt: z.string().trim().min(1),
  resolvedAt: z.string().trim().min(1).optional()
})

export type SourceRenderValidationError = z.infer<typeof sourceRenderValidationErrorSchema>
export type SourceRenderValidationErrors = z.infer<typeof sourceRenderValidationErrorsSchema>
export type SourceRenderValidationTable = z.infer<typeof sourceRenderValidationTableSchema>
export type SourceRenderValidationParsed = {
  row: SourceRenderValidationTable
  errors: SourceRenderValidationErrors
}

export function parseSourceRenderValidationTable(value: unknown): SourceRenderValidationTable {
  return sourceRenderValidationTableSchema.parse(value)
}

export function parseSourceRenderValidationErrors(value: string): SourceRenderValidationErrors {
  return sourceRenderValidationErrorsSchema.parse(JSON.parse(value))
}

export function stringifySourceRenderValidationErrors(value: unknown): string {
  return JSON.stringify(sourceRenderValidationErrorsSchema.parse(value))
}

export function parseSourceRenderValidation(row: SourceRenderValidationTable): SourceRenderValidationParsed {
  return {
    row,
    errors: parseSourceRenderValidationErrors(row.errorsJson)
  }
}
