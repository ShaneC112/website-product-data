import {z} from 'zod'
import {sha256} from '../sanity/sha256.js'
import {SANITY_PRODUCT_TYPES} from '../../registry/product-taxonomy.js'

const optionalText = z.string().trim().min(1).optional()
const optionalNumber = z.number().finite().optional()

export const normalizedProductVariantSchema = z.object({
  variantKey: z.string().trim().min(1),
  colourName: z.string().trim().min(1),
  colourFamily: optionalText,
  hex: z.string().regex(/^#[0-9a-f]{6}$/i).optional(),
  vendorSku: optionalText,
  sourceUrl: z.string().url().optional(),
  primaryImage: z.unknown().optional(),
  swatchImage: z.unknown().optional(),
  images: z.array(z.unknown()).default([]),
  overrides: z.object({
    price: z.boolean(),
    packPrice: z.boolean(),
    packInfo: z.boolean(),
    widths: z.boolean(),
    suitableRooms: z.boolean(),
    pattern: z.boolean(),
    specs: z.boolean()
  }).strict(),
  price: z.unknown().optional(),
  packPrice: z.unknown().optional(),
  packInfo: z.unknown().optional(),
  widths: z.array(z.unknown()).optional(),
  suitableRooms: z.array(z.string()).optional(),
  patternRepeatCm: optionalNumber,
  repeatsInSwatch: z.number().int().positive().optional(),
  specs: z.array(z.unknown()).optional()
}).strict()

export const normalizedFullProductSchema = z.object({
  version: z.literal(1),
  documentKey: z.string().trim().min(1),
  revision: z.string().trim().min(1),
  productType: z.enum(SANITY_PRODUCT_TYPES),
  categoryKey: z.string().trim().min(1),
  name: optionalText,
  brand: optionalText,
  shortDescription: optionalText,
  description: z.unknown().optional(),
  features: z.array(z.unknown()).default([]),
  specs: z.array(z.unknown()).default([]),
  suitableRooms: z.array(z.string()).default([]),
  widths: z.array(z.unknown()).default([]),
  price: z.unknown().optional(),
  priceOnRequest: z.boolean().default(false),
  packPrice: z.unknown().optional(),
  packInfo: z.unknown().optional(),
  patternRepeatCm: optionalNumber,
  repeatsInSwatch: z.number().int().positive().optional(),
  variants: z.array(normalizedProductVariantSchema).min(1)
}).strict()

export const narrowedProductVariantSchema = z.object({
  version: z.literal(1),
  documentKey: z.string().trim().min(1),
  productType: z.enum(SANITY_PRODUCT_TYPES),
  categoryKey: z.string().trim().min(1),
  product: normalizedFullProductSchema.omit({variants: true}),
  variant: normalizedProductVariantSchema,
  familySources: z.record(z.enum(['product', 'variant']))
}).strict()

export type NormalizedProductVariant = z.infer<typeof normalizedProductVariantSchema>
export type NormalizedFullProduct = z.infer<typeof normalizedFullProductSchema>
export type NarrowedProductVariant = z.infer<typeof narrowedProductVariantSchema>

export function buildFullProductCacheKey(documentKey: string): string {
  return `product:fullProduct:${documentKey}`
}

export function buildProductVariantKey(documentKey: string, variantKey: string): string {
  return `variant:${documentKey}:${variantKey}`
}

export function computeFullProductFingerprint(value: NormalizedFullProduct): string {
  return sha256(JSON.stringify(value))
}
