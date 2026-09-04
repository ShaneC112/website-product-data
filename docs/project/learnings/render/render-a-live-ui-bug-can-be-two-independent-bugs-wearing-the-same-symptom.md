# A live UI bug can be two independent bugs wearing the same symptom

- **ID:** `render-a-live-ui-bug-can-be-two-independent-bugs-wearing-the-same-symptom`
- **Applies to:** `website-product-enrichment-render`
- **Status:** Canonical learning detail.

## Learning

## A live UI bug can be two independent bugs wearing the same symptom

"Still no swatches" was reported after this fix was verified correct at the
render/extraction layer (`webcrawlvariantswatches` showed distinct, correct
`selectedSwatchUrl` values per variant). The images still didn't render in the
browser - a completely separate bug in `website-product-enrichment-ui`'s swatch
preview endpoint (see that repo's LEARNINGS.md) was returning a 200 with
`base64: null` instead of a 404, so the frontend never fell back to the correct
URL it already had. Don't assume a fix was incomplete just because the reported
symptom persists - re-verify each layer independently before re-opening the
original investigation.

