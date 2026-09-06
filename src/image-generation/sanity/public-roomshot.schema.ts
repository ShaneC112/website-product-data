import { z } from 'zod'
import {
  SANITY_CATEGORY_KEYS,
  SANITY_PRODUCT_TYPES,
  SANITY_SUITABLE_ROOMS
} from '../../registry/product-taxonomy.js'

const sanityCategoryKeySchema = z.string().refine((value) => SANITY_CATEGORY_KEYS.includes(value as (typeof SANITY_CATEGORY_KEYS)[number]), {
  message: 'Invalid category key'
})

export const publicRoomshotSchema = z.object({
  mediaId: z.string().trim().min(1),
  assetRef: z.string().trim().min(1),
  alt: z.string().trim().min(1),
  room: z.enum(SANITY_SUITABLE_ROOMS),
  productId: z.string().trim().min(1),
  productSlug: z.string().trim().min(1),
  productType: z.enum(SANITY_PRODUCT_TYPES),
  categoryKey: sanityCategoryKeySchema,
  variantId: z.string().trim().min(1),
  colourName: z.string().trim().min(1).optional()
}).strict()