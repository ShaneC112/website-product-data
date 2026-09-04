# `collectVisibleText`'s output was computed but discarded - only its length survived

- **ID:** `render-collectvisibletext-s-output-was-computed-but-discarded-only-its-length-survived`
- **Applies to:** `website-product-enrichment-render`
- **Status:** Canonical learning detail.

## Learning

## `collectVisibleText`'s output was computed but discarded - only its length survived

Render already computed a hidden-aware, tag-free rendering of the page's visible
text (`collectVisibleText`) for every render, but only persisted `.length` (as
`visibleTextLength`) - the text itself was thrown away once the render finished.
This turned out to be exactly what Azure's AI extraction needed: on markup-heavy
vendor pages, a fixed-size raw-HTML excerpt can miss real content sitting tens of
thousands of characters deep, while the visible-text rendering reaches the same
content in a fraction of the size (it strips every tag and hidden node, not just
a fixed prefix of the markup).

**Fix:** upload the visible text as its own blob
(`${blobPrefix}/visible-text.txt`, only when non-empty) and thread its path through
`RenderResponse.blobPaths.visibleText` → `RenderComplete.blobPaths.visibleText`
(both schemas in `website-product-data`) so Azure can download and prefer it. No
change to how the text itself is computed - it was already correct, just never
kept past the point it was measured.

**Lesson:** before adding a new artefact or increasing a budget/limit to solve a
"the AI/consumer can't see enough of the page" problem, check whether equivalent,
already-computed data is being thrown away after only its size/length was recorded
- it's usually cheaper and denser than widening a raw/fixed-size budget.

