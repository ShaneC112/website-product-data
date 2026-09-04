# Shared schema helpers should stay at the contract boundary, not mirror every local convenience

- **ID:** `data-shared-schema-helpers-should-stay-at-the-contract-boundary-not-mirror-every-local-convenience`
- **Applies to:** `website-product-data`
- **Status:** Canonical learning detail.

## Learning

## Shared schema helpers should stay at the contract boundary, not mirror every local convenience

The shared package had accumulated parser helpers like
`parseExtractedDetailBlob`, `parseVendorProductPageBlob`, and
`parseCrawlExtractBatchTable` even though the active consumers only used the zod
schemas and stringify helpers. Keeping declaration-only parser wrappers around made
the package surface look larger than the real contract and created extra cleanup
work whenever the underlying schema changed.

**Best practice:** keep `website-product-data` focused on durable shared contracts:
schemas, inferred types, constants, and key builders. If a parser/helper is only a
thin local convenience for one repo, keep it in that repo instead of exporting it
from the shared package.

