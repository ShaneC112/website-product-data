# Variant completion needs a durable barrier and a reconciliation backstop

- **ID:** `azure-variant-completion-needs-a-durable-barrier-and-a-reconciliation-backstop`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## Variant completion needs a durable barrier and a reconciliation backstop

Best Wool Bern discovered five dedicated variant pages. The range transform began before the
fifth classified variant detail was persisted, so it aggregated an incomplete snapshot and left
the group in `draft` with `extracted_detail_not_ready`. The renderer and extraction workers had
already completed; no new crawl was required.

**Fix:** variant transforms count durable variant details for the range parent after persistence
and queue the parent transform only when the discovered count is satisfied. A generic
15-minute `crawlReconciliationSweeper` hosts independently registered recovery checks; its first
check retries that idempotent transform only for stale groups with proven-complete variant
membership. It never creates a crawl request or attaches to the original run.

**Best practice:** queued fan-out completion cannot depend on message timing alone. Persist a
completion predicate that every producer can evaluate, use it to trigger the normal path, and add
a narrow periodic reconciliation check for missed delivery or process interruption.

