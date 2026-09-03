import {describe, expect, it} from 'vitest'
import {mediaImageProjection, SANITY_MEDIA_IMAGE_FIELDS} from '../src/sanity/mediaImage.groq.js'

describe('media image GROQ projections', () => {
  it('flattens a media document to the legacy-compatible image shape', () => {
    expect(SANITY_MEDIA_IMAGE_FIELDS).toContain('"_type": "image"')
    for (const field of ['"asset": image.asset', '"alt": alt', '"crop": image.crop', '"hotspot": image.hotspot', '"role": role', '"source": source']) {
      expect(SANITY_MEDIA_IMAGE_FIELDS).toContain(field)
    }
  })

  it('projects direct references and explicit fallback expressions', () => {
    expect(mediaImageProjection('heroImage')).toContain('"heroImage": heroImage->{')
    expect(mediaImageProjection('coalesce(openGraphImage, image)', 'openGraphImage')).toContain(
      '"openGraphImage": coalesce(openGraphImage, image)->{',
    )
  })
})