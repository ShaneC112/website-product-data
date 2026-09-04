# An operator "re-queue" action must actually force reprocessing

- **ID:** `ui-an-operator-re-queue-action-must-actually-force-reprocessing`
- **Applies to:** `website-product-enrichment-ui`
- **Status:** Canonical learning detail.

## Learning

## An operator "re-queue" action must actually force reprocessing

`ai-review.vue`'s manual `requeueGroup` action sent `force: false` to
`/api/crawl/enqueue`. Even after fixing `crawlUrl` (see the [Azure learning index](../azure/README.md)) so the Re-queue button was no longer permanently disabled, a
non-forced request for a URL the dispatcher had already seen gets silently linked
as a duplicate rather than actually re-rendered/re-extracted - so an operator
deliberately clicking "Re-queue" to fix stale/wrong data got no error and no new
data. An explicit, operator-triggered re-queue should always force reprocessing;
`force` should only ever be `false` for automatic/bulk paths that want dedup-by-
default. Changed to `force: true` in both the log call and the request body, and
added a drawer-contracts assertion that `force: false` never reappears in this
file.

