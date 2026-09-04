# A generated roomshot needs a stable media document identity

- **ID:** `azure-a-generated-roomshot-needs-a-stable-media-document-identity`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## A generated roomshot needs a stable media document identity

The Azure roomshot worker can be retried after a process failure between uploading an image and
patching the product. Creating a new `mediaImage` document on every attempt leaves duplicate
editorial records and changes the product reference for the same generation run.

**Fix:** create the AI `mediaImage` with `createIfNotExists()` using the stable roomshot run key.
The product run, primary image, and gallery continue to refer to that one canonical media
document across retried patches.

**Best practice:** any retryable producer that creates a reusable Sanity document must derive a
stable identity from the command's durable idempotency key, then test a repeated call.

