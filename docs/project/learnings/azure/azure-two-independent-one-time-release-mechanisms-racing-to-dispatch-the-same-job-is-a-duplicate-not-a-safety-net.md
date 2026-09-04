# Two independent one-time "release" mechanisms racing to dispatch the same job is a duplicate, not a safety net

- **ID:** `azure-two-independent-one-time-release-mechanisms-racing-to-dispatch-the-same-job-is-a-duplicate-not-a-safety-net`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## Two independent one-time "release" mechanisms racing to dispatch the same job is a duplicate, not a safety net

Introducing a new ledger-based compose fan-in gate (`releaseComposeWhenVariantsComplete`) alongside
the pre-existing ETag-based `claimCompletedVariantTransform` looked like harmless "defense in
depth" at first, but each is an *independent* one-time-release primitive with no shared claim
between them - if both actually dispatched the range's transform job on release, a group could
receive it twice (once per mechanism) during the rollout window before either becomes primary.

**Fix:** made the new ledger release bookkeeping-only (it flips the ledger's `compose` stage state
but never calls `sendQueueMessage`/`createAndDeliverNextStage`). The pre-existing ETag claim
remains the sole real dispatch trigger until a later phase makes the ledger authoritative and
demotes the ETag claim to a fallback.

**Best practice:** when running a new idempotency/fan-in mechanism alongside an existing one during
a migration, only one of them may ever perform the actual side effect. "Both check, only one acts"
is safe; "both check, both act" silently reintroduces the duplicate-dispatch bug the migration is
trying to prevent.

