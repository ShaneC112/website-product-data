# `buildVariant` applying one row's price to every colour was a real bug, not just a missing feature

- **ID:** `data-buildvariant-applying-one-row-s-price-to-every-colour-was-a-real-bug-not-just-a-missing-feature`
- **Applies to:** `website-product-data`
- **Status:** Canonical learning detail.

## Learning

## `buildVariant` applying one row's price to every colour was a real bug, not just a missing feature

`buildSanityIngestionPlan` took a single flat `price` from whichever one
`webcrawlproductdetail` row was passed in and applied it to every variant, even
though `crawlTransformWorker.ts` already writes one row per matched m2crm SKU
(each with its own price) and `publishWorker.ts` already computes a per-variant
match proposal (`matchVariantToCandidates`) before publishing. The two systems
were never connected.

**Fix:** `buildSanityIngestionPlan`'s new `options.variantOverrides` (keyed by
`variantId`) lets a caller supply per-colour `price`/`boxSalesPrice`
resolved from the existing match ledger, overriding the row-level default only
for variants that have a resolved override. `publishWorker.ts` now builds this
map from the matching pass it already runs, and publishes once per distinct
`urlKey` (not once per matched row) so a shared page's colours aren't published
as separate, redundant Sanity documents with each other's prices flickering in
depending on iteration order.

**Best practice:** when a per-colour matching/resolution system already exists
for one purpose (here: swatch/variant matching), check whether a "known bug"
elsewhere in the same product (uniform pricing) is actually just that same
system not being wired to the place that needs it, before assuming a new
resolution mechanism must be built from scratch.

