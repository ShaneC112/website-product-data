# Sanity image generation review: instrumentation and import drift

- **ID:** `azure-sanity-image-generation-review-instrumentation-and-import-drift`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## Sanity image generation review: instrumentation and import drift

Reviewing the new `sanityImage*` functions/services against the established `traceImageGenerationEvent`
pattern (enqueue, prepare, generate, status) found two inconsistencies once every file was compared
side by side:

- `sanityImagePrepareWorker.ts` computed a prompt hash via `(await import('../services/tableStorage')).computeHash(...)`
  instead of the static `computeHash` import every sibling file uses. A dynamic import in a hot queue-trigger
  path has no behavioral upside here and is easy to miss when auditing imports for a module.
- `sanityImageAutoCreate.ts` (the `autoCreate` fast-path that enqueues generation immediately after a
  successful prepare) was the only file in the feature with no `traceImageGenerationEvent` calls at all,
  so an auto-created run's queued/failed transitions were invisible to the same diagnostics every
  manually-triggered run gets.

**Best practice:** when a feature establishes a logging/tracing convention across several sibling files,
diff all of them together before merging, not just the one under active development - drift shows up as
one file quietly missing calls the others all have, not as an error.

**Test coverage gap found the same way:** `providerRateLimiter.ts` (optimistic-concurrency Azure Table
reservation loop with etag retry) had zero tests despite being the one piece of code that throttles paid
provider calls. Added focused tests for the create/wait/conflict-retry/give-up branches using fake timers
instead of real waits.


