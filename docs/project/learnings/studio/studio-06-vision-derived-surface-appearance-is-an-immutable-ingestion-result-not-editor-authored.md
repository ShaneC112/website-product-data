# Studio learning 06: Vision-derived surface appearance is an immutable ingestion result, not editor-authored 

- **ID:** `studio-06-vision-derived-surface-appearance-is-an-immutable-ingestion-result-not-editor-authored`
- **Applies to:** `website-product-enrichment-sanity-studio`
- **Status:** Canonical learning detail.

## Learning

- Vision-derived surface appearance is an immutable ingestion result, not editor-authored product
	content. Project it through the Blueprint event payload and show it as a read-only variant field
	so direct room-image prompt preparation can use the exact surface type, sheen, tonal variation,
	texture scale, and palette captured from the selected swatch. Sanity arrays require `_key` on
	each palette item; the shared ingestion mapper is the correct place to assign those keys.
