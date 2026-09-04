# A variant-discovery fallback chain must know "found none" from "found some, deliberately no hrefs"

- **ID:** `azure-a-variant-discovery-fallback-chain-must-know-found-none-from-found-some-deliberately-no-hrefs`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## A variant-discovery fallback chain must know "found none" from "found some, deliberately no hrefs"

Live-testing the group-scoped urlKey fix (above) against real Victoria Carpets data surfaced a
second, independent bug: `discoverVariantUrls` treated an empty href list from the manifest as
"the manifest found nothing," and fell through to generic element/raw-HTML href scraping - which
picked up **every** on-page link (nav, footer, other Victoria ranges entirely unrelated to Burford
Twist) as if each were a "discovered variant page." Each one then went through a full, real
render + batched AI extraction attempt (27 of them, cascading into real cost and multiple failed
batch retries) before the actual bug was traced.

Victoria's manifest (`buildVictoriaCaptureManifest`) correctly finds real `variantCaptures` (one
per colour) but **by design** never gives them an `href`, since there is no per-variant page at
all (see the vendor's own README/LEARNINGS entry in `website-product-enrichment-render`). Every
other vendor's "manifest found zero hrefs" case coincided with "manifest found nothing at all,"
so this fallback chain never needed to distinguish the two - until a vendor broke that coincidence.

**Fix:** `discoverVariantUrls` now checks whether the manifest's `variantCaptures` array itself is
non-empty (regardless of href presence) before deciding to fall through. A populated
`variantCaptures` array means variant discovery is already fully resolved by the manifest - stop
there, even if the resulting href list is empty. Only a missing/empty manifest continues to the
elements/raw-HTML fallback chain, exactly as before.

**Lesson:** the same shape of bug as the `urlKey` scoping issue above - a fallback/dedup mechanism
silently relies on an invariant ("empty result == nothing found") that happens to hold for every
case seen so far, until a new, legitimately-different case breaks it. When adding a vendor whose
behavior is a deliberate, correct "zero of X" rather than a failure, check every downstream
consumer that currently treats "zero of X" as "try the next fallback."

