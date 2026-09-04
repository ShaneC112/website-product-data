# A single-image vendor's "no swatch" was a missed opportunity, not a real gap

- **ID:** `render-a-single-image-vendor-s-no-swatch-was-a-missed-opportunity-not-a-real-gap`
- **Applies to:** `website-product-enrichment-render`
- **Status:** Canonical learning detail.

## Learning

## A single-image vendor's "no swatch" was a missed opportunity, not a real gap

Axminster Carpets' capture manifest only ever produced one image per variant and never populated `swatchImageUrls`/`primarySwatchImageUrl`, so that one image - which is the
 only visual evidence this vendor's page ever has - was invisible to anything reading swatch fields, including Azure's new `deriveSwatchHex` colour sampling.

**Fix:** when a vendor page has exactly one image and no separate swatch/product distinction, treat that image as both the product image and the swatch image instead of leav
ing swatch fields empty.

**Best practice:** when a downstream feature starts consuming a field (here, swatch image URLs feeding swatch-colour derivation), re-check every vendor's capture manifest fo
r that field being populated, not just the ones that were built assuming that consumer existed.

