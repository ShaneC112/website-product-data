# Curated upstream artefact URLs belong in the shared contract, not in repo-local side channels

- **ID:** `data-curated-upstream-artefact-urls-belong-in-the-shared-contract-not-in-repo-local-side-channels`
- **Applies to:** `website-product-data`
- **Status:** Canonical learning detail.

## Learning

## Curated upstream artefact URLs belong in the shared contract, not in repo-local side channels

`productOnlinePdfUrl` started as an upstream m2crm field needed by the Azure manual-enqueue path, but the
real requirement was broader: once a curated vendor PDF URL exists, both the crawl-request queue contract
and the render-request contract need to preserve it so render can emit it as evidence and extraction can
pass the original PDF to the multimodal model.

**Solution:** add `productOnlinePdfUrl` to the shared `manualCrawlEnqueueSchema`,
`crawlRequestMessageSchema`, and `renderRequestSchema` instead of letting each consumer invent its own
local extension.

**Best practice:** when a field crosses more than one repo boundary, promote it into
`website-product-data` as soon as the second boundary appears. Shared pass-through metadata is exactly what
this package is for; leaving it repo-local guarantees drift.

