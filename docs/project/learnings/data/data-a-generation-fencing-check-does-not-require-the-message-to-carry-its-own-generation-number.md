# A generation-fencing check does not require the message to carry its own generation number

- **ID:** `data-a-generation-fencing-check-does-not-require-the-message-to-carry-its-own-generation-number`
- **Applies to:** `website-product-data`
- **Status:** Canonical learning detail.

## Learning

## A generation-fencing check does not require the message to carry its own generation number

The recoverable-queues plan's illustrative pseudocode for `isCurrentStageGeneration` compares an
incoming message's `generation` against the currently active one. Threading `generation`/
`stageItemId` through every render/extract/transform queue payload would have required schema
changes reaching into `website-product-enrichment-render` (a separate Container App).

**Fix:** `website-product-enrichment-render`'s `RenderJob.parse()` already strips unknown fields
and its outgoing `RenderComplete` is built from an explicit field allowlist, not a spread - any
extra field added to the render job would be silently dropped and never survive the round trip.
Since a message only ever needs to prove it belongs to the *currently active* attempt, comparing
against the stored ledger row's own state (`!== 'superseded'`) by `(sourceGroupKey, runId, stage,
targetKey)` is equivalent for a single-active-generation-at-a-time model, with zero payload changes.

**Best practice:** before adding a field to a cross-repo queue contract "for tracking", check
whether every consumer already forwards unknown fields verbatim - many don't, and the tracking
data can usually be derived from what's already durably stored instead.

