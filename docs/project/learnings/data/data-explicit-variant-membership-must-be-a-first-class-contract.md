# Explicit variant membership must be a first-class contract

- **ID:** `data-explicit-variant-membership-must-be-a-first-class-contract`
- **Applies to:** `website-product-data`
- **Status:** Canonical learning detail.

## Learning

## Explicit variant membership must be a first-class contract

Some commercial products group URLs differently from a vendor website. `SpecifiedUrls` keeps that source
membership explicit: a request carries a validated URL array instead of overloading website Range discovery.
Consumers must treat the array as required for that mode and preserve `Range`/`Single` semantics unchanged.

**Best practice:** model source-authoritative membership explicitly at the shared contract boundary; do not
try to infer commercial groups from presentation-page headings or URL labels.

