# Product images can be both image and swatch evidence without duplicating telemetry

- **ID:** `render-product-images-can-be-both-image-and-swatch-evidence-without-duplicating-telemetry`
- **Applies to:** `website-product-enrichment-render`
- **Status:** Canonical learning detail.

## Learning

## Product images can be both image and swatch evidence without duplicating telemetry

Victoria's product image is the selected swatch as well as the primary variant image. The manifest
correctly retains that URL in both evidence arrays, but summing the arrays made render telemetry report
two media items for one physical URL.

**Best practice:** preserve each semantic reference in the manifest, but deduplicate URL values when
reporting physical media counts. Keep that calculation in a pure helper with a focused regression test.

**Fix:** when rendering a Quick-Step range, use the first discovered in-range variant URL to fetch
the variant HTML, extract the technical PDF, and attach it to the range capture manifest as
`spec-region-link` with `first-variant-pdp-spec-doc-item` provenance. The PDF URL can be an
`.ashx` endpoint whose filename query parameter ends in `.pdf`; pathname-only detection is not
sufficient.

**Best practice:** distinguish evidence location from data ownership. Preserve provenance when
lifting vendor evidence across that boundary, and test the live vendor resolver as well as the
manifest builder in isolation.

