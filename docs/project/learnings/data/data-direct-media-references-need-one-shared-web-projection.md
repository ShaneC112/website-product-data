# Direct media references need one shared web projection

- **ID:** `data-direct-media-references-need-one-shared-web-projection`
- **Applies to:** `website-product-data`
- **Status:** Canonical learning detail.

## Learning

## Direct media references need one shared web projection

Sanity content placements now hold direct references to `mediaImage` documents instead of inline
image objects. Frontends should not each invent their own dereference and fallback projections.

**Fix:** `@shane-corrigan/website-product-data/sanity` exports
`SANITY_MEDIA_IMAGE_FIELDS` and `mediaImageProjection()`. The fragment dereferences the media
document and flattens its native image data into the previous `{_type, asset, alt, crop, hotspot}`
shape, while preserving canonical role, source, room, source URL, and generation prompt metadata.

**Best practice:** use `mediaImageProjection('coalesce(openGraphImage, image)', 'openGraphImage')`
for an explicit social-image fallback. Keep the field expression and result alias static query
source, not user-supplied values.

