# Live E2E payload artifacts are envelopes, not enqueue arrays

- **ID:** `azure-live-e2e-payload-artifacts-are-envelopes-not-enqueue-arrays`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## Live E2E payload artifacts are envelopes, not enqueue arrays

The M2CRM snapshot script writes a reviewable envelope with `queuePayloads` (valid enqueue request
bodies) and `skipped` (enabled rows rejected by validation). Treating the artifact root as an array
can silently bypass preflight checks or produce an invalid enqueue loop.

**Best practice:** inspect and batch only `queuePayloads`; require the intended batch size before
sending any request, and leave `skipped` in the artifact as the auditable validation record.

