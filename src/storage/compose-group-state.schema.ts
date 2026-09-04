import { z } from 'zod'
import {
  crawlGroupStateSchema,
  parseCrawlGroupReadinessReasons,
  type CrawlGroupReadinessReasons
} from './group-state.schema.js'

// 06-compose's own group-rollup table (split from the former shared crawlGroupState table - see
// plan/queue file refactor/01a-entity-table-redesign.md). Row shape is unchanged from before the
// split. Kept separate from composeOutput since it's a per-group rollup at a different grain
// (partitionKey/rowKey = sourceGroupKey) than composeOutput's per-source-record rows.
export const composeGroupStateTableSchema = z.object({
  partitionKey: z.string().trim().min(1),
  rowKey: z.string().trim().min(1),
  sourceGroupKey: z.string().trim().min(1),
  styleCodeRaw: z.string().trim().min(1).optional(),
  styleCodeStorageKey: z.string().trim().min(1).optional(),
  state: crawlGroupStateSchema,
  pageCount: z.number().int().nonnegative(),
  detailCount: z.number().int().nonnegative(),
  expectedVariantCount: z.number().int().positive().optional(),
  readinessReasonsJson: z.string().trim().min(1).optional(),
  ttlExpiresAt: z.string().trim().min(1).optional()
})

export type ComposeGroupStateTable = z.infer<typeof composeGroupStateTableSchema>
export type ComposeGroupStateParsed = {
  row: ComposeGroupStateTable
  readinessReasons: CrawlGroupReadinessReasons
}

export function parseComposeGroupStateTable(value: unknown): ComposeGroupStateTable {
  return composeGroupStateTableSchema.parse(value)
}

export function parseComposeGroupState(row: ComposeGroupStateTable): ComposeGroupStateParsed {
  return {
    row,
    readinessReasons: row.readinessReasonsJson
      ? parseCrawlGroupReadinessReasons(row.readinessReasonsJson)
      : []
  }
}
