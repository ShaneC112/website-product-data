# Operational timelines should aggregate fan-out and fail independently

- **ID:** `ui-operational-timelines-should-aggregate-fan-out-and-fail-independently`
- **Applies to:** `website-product-enrichment-ui`
- **Status:** Canonical learning detail.

## Learning

## Operational timelines should aggregate fan-out and fail independently

A row-per-ledger-item timeline makes a partial variant stage hard to diagnose, and nesting it under
composed product detail hides the exact evidence needed when composition has not happened.

**Fix:** aggregate active-run rows into seven stable pipeline stages with completed/total counts,
render recovery diagnostics independently from product detail, validate Azure responses at the
Nitro boundary, and log plus display fetch failures.

**Best practice:** workflow diagnostics should distinguish `Not started`, partial progress, and
request failure. Keep them available when the business artifact they explain is missing.

