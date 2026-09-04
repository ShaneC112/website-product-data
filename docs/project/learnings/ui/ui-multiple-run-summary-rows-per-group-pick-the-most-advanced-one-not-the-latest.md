# Multiple run-summary rows per group: pick the most-advanced one, not the latest

- **ID:** `ui-multiple-run-summary-rows-per-group-pick-the-most-advanced-one-not-the-latest`
- **Applies to:** `website-product-enrichment-ui`
- **Status:** Canonical learning detail.

## Learning

## Multiple run-summary rows per group: pick the most-advanced one, not the latest

See [Multiple `webcrawlrunsummary` rows per group are normal, not a bug](../azure/azure-multiple-webcrawlrunsummary-rows-per-group-are-normal-not-a-bug.md) for the
root cause. On the UI side, `server/api/crawl/group-states.get.ts`'s
`listLatestRunSummaries` picked the run summary with the latest `requestedAt` across
all of a group's `webcrawlrunsummary` rows - which surfaced a duplicate-width
request's summary (status `requested`, no AI usage recorded) instead of the real
run's, purely because the duplicate happened to be submitted later. Fixed with a
`STATUS_PRECEDENCE` ranking (mirroring azure's `crawlRunSummaryStore.ts`), falling
back to `requestedAt` only when precedence ties.

