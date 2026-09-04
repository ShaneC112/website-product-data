# A "current membership" computation needs data that only exists on the sibling pages it's trying to filter

- **ID:** `azure-a-current-membership-computation-needs-data-that-only-exists-on-the-sibling-pages-it-s-trying-to-filter`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## A "current membership" computation needs data that only exists on the sibling pages it's trying to filter

`deleteCrawlVariantDetailsOutsideRangeMembership`'s canonical-key allow-list is computed from the
*range* page's own `vendorProductPage.variants` - but range-level extraction is discovery-only
(it finds variant URLs, never assigns `colourName`/`label`). `mergeVariantSwatchEvidence` only
backfills the opposite direction (a sibling *range* page enriching a variant child), so when the
range page itself is being transformed, none of its siblings match that filter and its own variants
stay colourless. `buildGroupVariantRowKey` then returns `null` for all of them (empty colour
token), so the "membership" allow-list comes out empty and the delete call wipes every real,
just-persisted variant-detail row for the group. A live Best Wool Bern crawl (5 real pile-weight
variants, all correctly classified and swatched) reproduced this exactly: the group was flagged
"no colour variants discovered" and stuck in `draft`, even though `webcrawlvariantswatches` had all
5 rows approved.

**Fix:** added `mergeVariantColourIdentityFromChildren()` - the missing direction - which backfills
`colourName`/`label` onto the range's own stub variants from matching sibling *variant* pages
(matched by `variantId`/`url`, same as `findDedicatedVariantSwatchEvidence`) before the canonical
key set is computed.

**Best practice:** when a "keep only current members" cleanup reads its allow-list from one specific
page's own view of the data, check whether that page's view can ever be incomplete relative to its
siblings - a `length === 0` allow-list from stale/partial data is indistinguishable from "genuinely
no members" and will delete real data. Diagnose by checking the blob evidence (extraction output)
independently of the aggregate table state, not just re-reading the aggregation code.

