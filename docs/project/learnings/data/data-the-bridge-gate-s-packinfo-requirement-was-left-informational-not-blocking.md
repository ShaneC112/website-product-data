# The bridge gate's packInfo requirement was left informational, not blocking

- **ID:** `data-the-bridge-gate-s-packinfo-requirement-was-left-informational-not-blocking`
- **Applies to:** `website-product-data`
- **Status:** Canonical learning detail.

## Learning

## The bridge gate's packInfo requirement was left informational, not blocking

Phase 03 asked whether a Carpet Tile/Laminate/Vinyl/Engineered Wood product with no
`packInfo`/`packPrice` should fail `evaluateBridgeEligibility`, explicitly flagging it as a softer
call than the width check and asking for confirmation before implementing either way.

**Decision:** `SANITY_CONTENT_REQUIREMENTS[productType].requiresPackInfo` is defined (shared with
the Studio gate, Phase 05) but `evaluateBridgeEligibility` does not currently block on it - only
`requiresWidth` blocks. Box price/pack info is already authoritative business data (present or
not, per Phase 02) rather than a page-extraction quality signal the bridge should gate on; a
missing value there is more useful as an Azure/Nuxt-side informational signal than a hard block.
Revisit if real data shows products are reaching Sanity without pack info that customers need to
see, at which point this becomes an explicit, confirmed decision to add `missing_required_pack_info`
as a blocking reason.

