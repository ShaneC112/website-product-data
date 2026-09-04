import { z } from 'zod'
import {
  crawlVariantSwatchReviewStateSchema,
  crawlVariantSwatchSourceSchema,
  crawlVariantSwatchStatusSchema
} from './variant-swatch.schema.js'

// 05-image-classify's own swatch table (split from the former shared crawlVariantSwatch table -
// see plan/queue file refactor/01a-entity-table-redesign.md). Row shape is unchanged from before
// the split. Kept separate from imageClassifyOutcome since it has its own operator-review
// lifecycle updated after the initial write.
export const imageClassifySwatchTableSchema = z.object({
  partitionKey: z.string().trim().min(1),
  rowKey: z.string().trim().min(1),
  sourceGroupKey: z.string().trim().min(1),
  sourceGroupStorageKey: z.string().trim().min(1).optional(),
  styleCodeRaw: z.string().trim().min(1).optional(),
  styleCodeStorageKey: z.string().trim().min(1).optional(),
  parentUrlKey: z.string().trim().min(1).optional(),
  canonicalVariantKey: z.string().trim().min(1).optional(),
  variantId: z.string().trim().min(1).optional(),
  variantUrl: z.string().trim().min(1).optional(),
  variantLabel: z.string().trim().min(1).optional(),
  colourName: z.string().trim().min(1).optional(),
  selectedSwatchUrl: z.string().trim().min(1).optional(),
  selectedSwatchBlobPath: z.string().trim().min(1).optional(),
  selectedSwatchHash: z.string().trim().min(1).optional(),
  swatchStatus: crawlVariantSwatchStatusSchema,
  swatchSource: crawlVariantSwatchSourceSchema.optional(),
  reviewState: crawlVariantSwatchReviewStateSchema,
  overrideSource: z.enum(['url', 'upload']).optional(),
  overrideUrl: z.string().trim().min(1).optional(),
  overrideBlobPath: z.string().trim().min(1).optional(),
  overrideHash: z.string().trim().min(1).optional(),
  overrideReviewState: crawlVariantSwatchReviewStateSchema.optional(),
  approvedAt: z.string().trim().min(1).optional(),
  approvedBy: z.string().trim().min(1).optional(),
  clearedAt: z.string().trim().min(1).optional(),
  clearedBy: z.string().trim().min(1).optional(),
  updatedAt: z.string().trim().min(1)
})

export type ImageClassifySwatchTable = z.infer<typeof imageClassifySwatchTableSchema>

export function parseImageClassifySwatchTable(value: unknown): ImageClassifySwatchTable {
  return imageClassifySwatchTableSchema.parse(value)
}
