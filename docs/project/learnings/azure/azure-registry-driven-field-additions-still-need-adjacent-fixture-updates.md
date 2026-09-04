# Registry-driven field additions still need adjacent fixture updates

- **ID:** `azure-registry-driven-field-additions-still-need-adjacent-fixture-updates`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## Registry-driven field additions still need adjacent fixture updates

Adding new Carpet fields (`togRating`, `suitability`, and `warranty`) was
mostly a registry-first change, but the adjacent test fixtures in transform-worker
and review-model tests still encoded the old shape (`TOG rating` living in
`additionalSpecifications`, Carpet `features` still appearing in some payloads).
The extraction path itself was correct once the registry and `tradeExtraction.ts`
were updated; the drift was in fixtures that had become snapshots of an older
contract.

**Best practice:** when a registry change alters what counts as a named field vs a
catch-all field, review adjacent tests that assert composed detail blobs or review
arrays, not just the direct extraction tests. Those fixtures often encode the old
contract more rigidly than the production code.

