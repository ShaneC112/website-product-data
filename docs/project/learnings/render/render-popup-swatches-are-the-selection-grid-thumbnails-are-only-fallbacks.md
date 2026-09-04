# Popup swatches are the selection; grid thumbnails are only fallbacks

- **ID:** `render-popup-swatches-are-the-selection-grid-thumbnails-are-only-fallbacks`
- **Applies to:** `website-product-enrichment-render`
- **Status:** Canonical learning detail.

## Learning

## Popup swatches are the selection; grid thumbnails are only fallbacks

Lano's colour grid links each variant to a full popup image while nesting a small thumbnail in the
grid cell. Using the thumbnail as `primarySwatchImageUrl` discarded the useful surface detail
needed for Vision classification.

**Fix:** capture the popup image as the primary swatch and retain the thumbnail as a secondary
candidate for evidence and fallback use.

**Best practice:** where markup provides both a display thumbnail and a product-detail asset, make
the detail asset authoritative for visual analysis and explicitly test that selection.

