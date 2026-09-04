# Additive operator UI beats replacing a working action when semantics diverge

- **ID:** `ui-additive-operator-ui-beats-replacing-a-working-action-when-semantics-diverge`
- **Applies to:** `website-product-enrichment-ui`
- **Status:** Canonical learning detail.

## Learning

## Additive operator UI beats replacing a working action when semantics diverge

The recoverable-queues plan asked to replace the broad `force: true` manual re-queue with the new
ledger-based recovery actions. The new recovery model's checkpoints are only legal under strict
per-stage readiness rules (e.g. `compose` requires every variant classification to already be
durable), which is a genuinely different, narrower capability than "just re-run this group now
regardless of state" - the actual job the existing `Re-queue`/`Reprocess`/`Preflight` buttons do.

**Fix:** added the new "Pipeline recovery" card to the AI review drawer as an ADDITIONAL capability
(real ledger stage status + only-currently-legal checkpoints), without removing or gating the
existing broad actions.

**Best practice:** when a plan says "replace X with Y", check whether X and Y actually have the
same legality/readiness semantics first. If Y is strictly more constrained, keep X available and
add Y additively rather than silently narrowing an operator's existing capability.

