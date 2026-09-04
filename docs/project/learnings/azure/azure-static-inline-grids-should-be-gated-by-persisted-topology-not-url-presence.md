# Static inline grids should be gated by persisted topology, not URL presence

- **ID:** `azure-static-inline-grids-should-be-gated-by-persisted-topology-not-url-presence`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## Static inline grids should be gated by persisted topology, not URL presence

An inline variant may retain its range URL as evidence even though no child variant page exists.
Using `variant.url` as the signal for final AI review therefore misclassifies flat grids and can
let a bounded model recount deterministically persisted membership incorrectly.

**Best practice:** use persisted page roles to distinguish inline grids from variant-page groups.
Keep deterministic count and swatch checks authoritative for inline grids, retain final review for
real variant pages and zero-variant flows, validate every AI matching response, and log invalid
responses with bounded group and variant context.

