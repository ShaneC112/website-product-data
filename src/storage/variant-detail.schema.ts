import { z } from 'zod'
import { extractedVendorVariantSchema } from './page-detail.schema.js'
import { classifiedImageSchema } from './image-classification.schema.js'
import { crawlVariantSwatchSourceSchema, crawlVariantSwatchStatusSchema } from './variant-swatch.schema.js'

export const variantDetailSummarySchema = z.object({
  summaryType: z.literal('variant-detail-summary'),
  canonicalVariantKey: z.string().trim().min(1).optional(),
  variantId: z.string().trim().min(1).optional(),
  label: z.string().trim().min(1).optional(),
  url: z.string().trim().min(1).optional(),
  colourName: z.string().trim().min(1).optional(),
  swatchImageUrl: z.string().trim().min(1).optional(),
  swatchSource: crawlVariantSwatchSourceSchema.optional(),
  swatchStatus: crawlVariantSwatchStatusSchema.optional(),
  imageUrls: z.array(z.string().trim().min(1)).optional(),
  swatchImageUrls: z.array(z.string().trim().min(1)).optional(),
  classifiedImages: z.array(classifiedImageSchema).optional(),
  swatchHex: z.string().trim().min(1).optional(),
  hasDecorativePattern: z.boolean().optional()
})

export type VariantDetailSummary = z.infer<typeof variantDetailSummarySchema>
export type VariantDetailBlob = z.infer<typeof extractedVendorVariantSchema>

export function parseVariantDetailSummary(value: string): VariantDetailSummary {
  return variantDetailSummarySchema.parse(JSON.parse(value))
}

export function parseVariantDetailBlob(value: string): VariantDetailBlob {
  return extractedVendorVariantSchema.parse(JSON.parse(value))
}

export function stringifyVariantDetailSummary(value: unknown): string {
  return JSON.stringify(variantDetailSummarySchema.parse(value))
}

export function stringifyVariantDetailBlob(value: unknown): string {
  return JSON.stringify(extractedVendorVariantSchema.parse(value))
}