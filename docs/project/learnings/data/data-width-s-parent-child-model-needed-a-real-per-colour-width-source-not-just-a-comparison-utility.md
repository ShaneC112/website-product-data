# Width's parent/child model needed a real per-colour width source, not just a comparison utility

- **ID:** `data-width-s-parent-child-model-needed-a-real-per-colour-width-source-not-just-a-comparison-utility`
- **Applies to:** `website-product-data`
- **Status:** Canonical learning detail.

## Learning

## Width's parent/child model needed a real per-colour width source, not just a comparison utility

`areMeasurementSetsEquivalent` alone doesn't fix width inheritance if the only per-variant width
data available is page-extracted `variant.widths` - the same noisy, single-pass source the
pre-existing `crawlTransformWorker.ts` comment already warned couldn't be trusted alone. Price had
the identical problem and was fixed by resolving per-colour data from the matched m2crm source
row (`variantOverrides`); width needed the same authoritative channel, not a second bespoke one.

**Fix:** `rawWidthHint` rides the same `variantOverrides` map `price` already uses. A
variant's resolved width set is the union of its page-extracted `widths` and its matched source
row's `rawWidthHint`, computed once per variant before `product.widths` is determined (so the
range-level default can itself fall back to that union when no range-level width was extracted),
then compared against the product default via `areMeasurementSetsEquivalent`.

**Best practice:** when adding a hint/override channel for a field that already has one for a
sibling field (price), reuse the same map and resolution order instead of adding a parallel one -
the two fields are resolved by the same match, at the same point in the pipeline.

