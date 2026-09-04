# Exhausted batch fallback must bypass the batching entrance

- **ID:** `azure-exhausted-batch-fallback-must-bypass-the-batching-entrance`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## Exhausted batch fallback must bypass the batching entrance

Sending a failed image-classification item back to `crawl-image-jobs` without `bypassBatch: true`
allows the worker to reinsert it into the same batch ledger instead of running the single-item
fallback. The flag was initially hidden on `TransformJob`, an unrelated queue contract.

**Best practice:** consume an accurately named `ImageJob` contract and carry loop-prevention state
through retry, split, and single-item fallback paths. Test both the shared wire schema and worker
behavior.

