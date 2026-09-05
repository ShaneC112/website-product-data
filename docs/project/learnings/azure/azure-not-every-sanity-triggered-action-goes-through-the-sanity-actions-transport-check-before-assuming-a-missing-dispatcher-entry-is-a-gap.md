# Not every Sanity-triggered action goes through the sanity-actions transport - check before assuming a missing dispatcher entry is a gap

- **ID:** `azure-not-every-sanity-triggered-action-goes-through-the-sanity-actions-transport-check-before-assuming-a-missing-dispatcher-entry-is-a-gap`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## Not every Sanity-triggered action goes through the sanity-actions transport - check before assuming a missing dispatcher entry is a gap

After `sanityActions.ts` was split into per-action-family folders under `src/operator-actions/sanity/`
(`update-product/`, `recover-pipeline/`, `import-style-code/`), the natural next question was
whether Studio's `Create Imagery` (image-generation) action needed the same treatment - it is also
a Sanity-triggered action. Searching `src/operator-actions/` for any image-generation trigger code
found nothing, which could look like a missing dispatcher entry rather than a deliberate design.

It is deliberate: `Create Imagery` needs its own request/run/ledger lifecycle that the single
append-only `sanityActionRequests[]` entry does not fit, so its Blueprint Function writes directly
to its own `sanity-image-prepare`/`sanity-image-generate` Azure Storage queues instead of forwarding
a reference through `sanity-actions`/`sanityActionsWorker`. Its entire implementation already lives
in `src/sanity-images/`, fully independent of `operator-actions/`.

**Fix:** added `operator-actions/sanity/image-generation/README.md` as a stub recording this
(no code to move, by design), and confirmed `src/functions/`/`src/services/` (the old
`sanityImageEnqueue.ts` etc. locations) no longer exist - a stale `operator-actions/README.md` note
still claimed they did.

**Lesson:** before treating an apparent gap in a newly-established code pattern as something to
fix, confirm whether the missing piece is intentional. A Sanity-triggered action with its own
request/run/ledger lifecycle needs is a legitimate reason to bypass a shared transport entirely,
not an oversight to be forced into it.
