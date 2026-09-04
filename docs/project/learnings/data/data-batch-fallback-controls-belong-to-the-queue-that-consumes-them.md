# Batch fallback controls belong to the queue that consumes them

- **ID:** `data-batch-fallback-controls-belong-to-the-queue-that-consumes-them`
- **Applies to:** `website-product-data`
- **Status:** Canonical learning detail.

## Learning

## Batch fallback controls belong to the queue that consumes them

An exhausted image-classification batch must set `bypassBatch: true` when it falls back to
`crawl-image-jobs`. Without that flag, the image worker can put the same item back into the batch
ledger instead of executing the single-item path. Modeling the flag on `TransformJob` hid this
loop because the image worker borrowed an unrelated queue schema.

**Best practice:** give each queue an accurately named contract, and carry loop-prevention flags
through every retry, split, and single-item fallback path. Protect the wire shape in the shared
package as well as the consuming worker tests.

