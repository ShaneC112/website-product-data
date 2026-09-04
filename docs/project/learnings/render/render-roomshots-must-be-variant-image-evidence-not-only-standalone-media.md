# Roomshots must be variant image evidence, not only standalone media

- **ID:** `render-roomshots-must-be-variant-image-evidence-not-only-standalone-media`
- **Applies to:** `website-product-enrichment-render`
- **Status:** Canonical learning detail.

## Learning

## Roomshots must be variant image evidence, not only standalone media

Azure composes a product's `images` array from `variantCaptures[].imageUrls`; standalone
`mediaCaptures` provide evidence but do not populate that composed array. Quick-Step and Brockway
were detecting roomsets/lifestyle images but only emitting them as media captures.

**Best practice:** when a vendor can associate a roomshot with a captured product variant, append
the deduplicated roomshot URL to that variant's `imageUrls` while keeping its selected swatch in
`swatchImageUrls`. Test both arrays to prevent a roomshot-only media regression.

