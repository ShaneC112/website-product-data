# Multiple `webcrawlrunsummary` rows per group are normal, not a bug

- **ID:** `azure-multiple-webcrawlrunsummary-rows-per-group-are-normal-not-a-bug`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## Multiple `webcrawlrunsummary` rows per group are normal, not a bug

A style crawled with N widths produces N `crawl-requests` messages and N
`webcrawlrunsummary` rows (one runId each), but only one of them is the canonical
run that actually renders/extracts/transforms/publishes - the rest get linked as
duplicate widths and never progress past `status: requested`. Anything that reads
"the latest run for a group" (this repo's own dispatcher merge logic, and
`website-product-enrichment-ui`'s `group-states.get.ts`) must account for this, or
it will surface whichever request came in last, even if that request never did any
real work. See [Multiple run-summary rows per group: pick the most-advanced one, not the latest](../ui/ui-multiple-run-summary-rows-per-group-pick-the-most-advanced-one-not-the-latest.md) for the UI-side fix
(same `STATUS_PRECEDENCE` concept, now duplicated in two repos since there's no
shared "run summary selection" helper in `website-product-data` yet).

