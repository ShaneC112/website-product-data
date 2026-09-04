import { z } from 'zod'

// 02-source-extract's/04-variant-extract's own group-pdf table (renamed from crawlGroupPdf for
// explicit step-ownership - see plan/queue file refactor/01a-entity-table-redesign.md). Row
// shape is unchanged. Written by the extract stages (auto-discovered) and by operator-actions
// (manual override), same pattern as the image-classify swatch table.
export const extractGroupPdfSourceSchema = z.enum(['discovered', 'operator_upload'])
export const extractGroupPdfStatusSchema = z.enum(['active', 'superseded', 'deleted'])

export const extractGroupPdfTableSchema = z.object({
  partitionKey: z.string().trim().min(1),
  rowKey: z.string().trim().min(1),
  sourceGroupKey: z.string().trim().min(1),
  sourceGroupStorageKey: z.string().trim().min(1).optional(),
  styleCodeRaw: z.string().trim().min(1).optional(),
  styleCodeStorageKey: z.string().trim().min(1).optional(),
  blobPath: z.string().trim().min(1),
  fileName: z.string().trim().min(1),
  contentType: z.string().trim().min(1),
  contentHash: z.string().trim().min(1),
  source: extractGroupPdfSourceSchema,
  status: extractGroupPdfStatusSchema,
  discoveredUrl: z.string().trim().min(1).optional(),
  uploadedAt: z.string().trim().min(1),
  uploadedBy: z.string().trim().min(1).optional(),
  supersededAt: z.string().trim().min(1).optional(),
  deletedAt: z.string().trim().min(1).optional()
})

export type ExtractGroupPdfTable = z.infer<typeof extractGroupPdfTableSchema>

export function parseExtractGroupPdfTable(value: unknown): ExtractGroupPdfTable {
  return extractGroupPdfTableSchema.parse(value)
}
