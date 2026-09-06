import { describe, expect, it } from 'vitest'
import { publicRoomshotSchema } from '../src/image-generation/index.js'

describe('publicRoomshotSchema', () => {
  it('accepts an attached published roomshot projection payload', () => {
    const parsed = publicRoomshotSchema.parse({
      mediaId: 'media-1',
      assetRef: 'image-abc123-1000x1000-png',
      alt: 'Abalone carpet in a bedroom',
      room: 'bedroom',
      productId: 'product-1',
      productSlug: 'abalone-carpet',
      productType: 'carpet',
      categoryKey: 'carpets',
      variantId: 'variant-1',
      colourName: 'Abalone'
    })

    expect(parsed.room).toBe('bedroom')
  })
})