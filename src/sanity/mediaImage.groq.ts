export type SanityMediaImageProjection = {
  _id: string
  _type: 'image'
  asset?: {_type: 'reference'; _ref: string}
  alt: string
  crop?: Record<string, number>
  hotspot?: Record<string, number>
  role: 'swatch' | 'product' | 'lifestyle' | 'roomshot'
  source: 'vendor' | 'ai'
  room?: string
  sourceUrl?: string
  generationPrompt?: string
}

/**
 * Fields from a `mediaImage` document, flattened to the legacy Sanity image shape.
 * Use inside a dereferenced projection, for example: `heroImage->{${SANITY_MEDIA_IMAGE_FIELDS}}`.
 */
export const SANITY_MEDIA_IMAGE_FIELDS = /* groq */ `
  "_id": _id,
  "_type": "image",
  "asset": image.asset,
  "alt": alt,
  "crop": image.crop,
  "hotspot": image.hotspot,
  "role": role,
  "source": source,
  "room": room,
  "sourceUrl": sourceUrl,
  "generationPrompt": generationPrompt
`

/**
 * Projects a direct `mediaImage` reference under a stable field name.
 *
 * `mediaImageProjection('coalesce(openGraphImage, image)', 'openGraphImage')`
 * returns an Open Graph override with an image fallback in the legacy-compatible shape.
 */
export function mediaImageProjection(referenceExpression: string, fieldName = referenceExpression): string {
  return `"${fieldName}": ${referenceExpression}->{${SANITY_MEDIA_IMAGE_FIELDS}}`
}