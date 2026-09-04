# A single-item deep-link page can still show a non-empty (but stale) DOM state

- **ID:** `ui-a-single-item-deep-link-page-can-still-show-a-non-empty-but-stale-dom-state`
- **Applies to:** `website-product-enrichment-ui`
- **Status:** Canonical learning detail.

## Learning

## A single-item deep-link page can still show a non-empty (but stale) DOM state

See [Best Wool per-variant swatches: a popup overlay does not remove the page behind it](../render/render-best-wool-per-variant-swatches-a-popup-overlay-does-not-remove-the-page-behind-it.md) for the root cause of the
Best Wool swatch-per-variant bug - this repo's part was just the downstream
symptom (broken images) once the backend started returning genuinely-correct,
per-variant `selectedSwatchUrl` values but they still failed to render for an
unrelated reason (the preview-endpoint bug above). Two independent bugs stacked on
the same user-visible symptom ("no swatches") - fixing the first one changed the
`swatchStatus`/`selectedSwatchUrl` data but didn't change what the operator saw
until the second was found too. When a reported symptom persists after a fix that
you've verified at the data layer, re-check the actual rendering path before
assuming the data-layer fix was incomplete.

