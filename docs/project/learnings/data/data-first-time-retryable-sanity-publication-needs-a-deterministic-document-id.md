# First-time retryable Sanity publication needs a deterministic document ID

- **ID:** `data-first-time-retryable-sanity-publication-needs-a-deterministic-document-id`
- **Applies to:** `website-product-data`
- **Status:** Canonical learning detail.

## Learning

## First-time retryable Sanity publication needs a deterministic document ID

At-least-once queue delivery can invoke the publisher concurrently before either invocation can
find an existing product. A random first-create ID turns that race into duplicate drafts.

**Fix:** derive the product draft ID from the stable ingestion identity key, falling back to
vendor ID plus external ID. Existing product IDs remain unchanged when lookup succeeds.

**Best practice:** every retryable external-document create needs a deterministic identity before
the first lookup can observe an existing document; lookup alone is not a concurrency control.

