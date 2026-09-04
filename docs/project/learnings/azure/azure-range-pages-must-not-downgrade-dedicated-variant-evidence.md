# Range pages must not downgrade dedicated variant evidence

- **ID:** `azure-range-pages-must-not-downgrade-dedicated-variant-evidence`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## Range pages must not downgrade dedicated variant evidence

Beachcomber's range page omitted a swatch candidate for Bay Ammonite even though its dedicated
variant page resolved and approved a valid vendor swatch. A later range transform overwrote that
valid state with `missing`, blocking the entire group from reaching Sanity. Separately, stale
variant-detail rows from an old key scheme remained in storage and made final review report
phantom missing swatches.

**Fix:** when a range page has no swatch selection, reuse matching dedicated variant-page evidence.
After a range transform, delete variant-detail rows outside the current canonical membership before
evaluating readiness or publishing.

**Best practice:** source authority and current membership both matter in asynchronous crawls. A
lower-authority absence must not downgrade a higher-authority resolved value, and durable rows whose
identity no longer belongs to the authoritative range must be reconciled before downstream gates.

