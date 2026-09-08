# A live recovery proof found two v2 image-generation state-transition gaps

- **ID:** `azure-a-live-recovery-proof-found-two-v2-image-generation-state-transition-gaps`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

### A live recovery proof found two v2 image-generation state-transition gaps

**Fix:** In [request.ts](/workspaces/project-container/website-product-enrichment-azure/src/sanity-images-v2/01-resolve/request.ts), wrap `resolveAuthoritativeGenerationInput` so a thrown resolve failure marks the orchestration entry `failed` and appends `failureHistoryJson` with `reasonCode: 'resolve-input-failed'` before rethrowing. In [worker.ts](/workspaces/project-container/website-product-enrichment-azure/src/sanity-images-v2/recovery/worker.ts), reset the failed orchestration entry back to `queued` and clear its lease fields with `updateOrchestrationEntry(..., { expectedState: 'failed' })` before enqueueing the retry envelope.

**Best practice:** When live validation proves a recovery path, verify both halves of the state transition: the failing path must leave a durable failure trail instead of a stuck `running` row, and the retry path must restore the row to a claimable state before dispatching new queue work. A retry message without a matching durable state transition is not recovery; it is an orphaned enqueue.