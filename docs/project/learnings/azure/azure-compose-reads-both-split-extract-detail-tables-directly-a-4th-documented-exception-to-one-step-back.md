# Compose reads both split extract-detail tables directly - a 4th documented exception to "one step back"

- **ID:** `azure-compose-reads-both-split-extract-detail-tables-directly-a-4th-documented-exception-to-one-step-back`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## Compose reads both split extract-detail tables directly - a 4th documented exception to "one step back"

The entity-table split's own design intent says image_classify is "the only place either
[sourceExtractDetail/variantExtractDetail] table is read after this phase" - but the real
`crawlTransformWorker.ts` (compose) extensively reads every sibling page's raw extracted-detail blob
across the whole group (both source/range AND variant pages) for cross-page swatch/colour fallback
(`applySiblingFallback`, `mergeVariantSwatchEvidence`). Re-deriving this into `imageClassifyOutcome`
rows would be a real logic change, not a mechanical rename - too risky for a "structural move" phase.

**Decision:** kept compose reading both split tables directly via the `listExtractDetailsByGroup`
cross-table helper (originally in `crawlPageDetailStore.ts`, moved to `core/extractDetailStore.ts`
in `plan/queue file refactor/04a-extract-batch-and-tables.md`), documented as a 4th exception to
the "one step back" rule (alongside recovery/UI observability, operator-actions' manual overrides,
and the price-recompose fast path above) rather than silently reshaping compose's sibling-fallback
logic.

