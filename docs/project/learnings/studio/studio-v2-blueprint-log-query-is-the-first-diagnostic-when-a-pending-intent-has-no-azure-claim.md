# V2 Blueprint log query is the first diagnostic when a pending intent has no Azure claim

- **ID:** `studio-v2-blueprint-log-query-is-the-first-diagnostic-when-a-pending-intent-has-no-azure-claim`
- **Applies to:** `website-product-enrichment-sanity-studio`
- **Status:** Canonical learning detail.

## Learning

A V2 request with `submissionState: 'pending'`, an empty `sanity-image-submission-v2` queue,
and no Azure submission-claim row has not reached Azure. Inspect the deployed
`request-ai-images-v2` Sanity Function before changing queues, replaying an intent, or assuming
Azure consumed the message:

```bash
pnpm blueprints:logs:v2
```

The V2 handler rereads a Sanity document, so it must remove Sanity transport metadata such as
`_createdAt`, `_updatedAt`, and `_rev` before applying strict Data-owned intent schemas. Passing
those metadata keys into a strict schema fails the Function before queue submission. Queue-send
failures should patch the safely parsed pending intent to a bounded failed outcome and log the
function-side error; they must not leave a silent pending command.
