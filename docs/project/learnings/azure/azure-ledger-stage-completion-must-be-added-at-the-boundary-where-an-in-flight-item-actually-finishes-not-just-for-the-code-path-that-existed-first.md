# Ledger stage completion must be added at the boundary where an in-flight item actually finishes, not just for the code path that existed first

- **ID:** `azure-ledger-stage-completion-must-be-added-at-the-boundary-where-an-in-flight-item-actually-finishes-not-just-for-the-code-path-that-existed-first`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## Ledger stage completion must be added at the boundary where an in-flight item actually finishes, not just for the code path that existed first

`recordExpectedChildren` pre-creates a `planned` `image_classify` row per variant, and the
single-item worker (`crawlImageClassifyWorker.ts`) completes it after persisting. When batch mode
diverts classification to `crawlExtractBatchWorker.ts`'s `processImageClassificationBatch`, that
row was left `planned` forever - `compose` never released via the ledger for batch-mode groups
(confirmed live: real business logic still worked via the pre-existing ETag mechanism, but the
ledger/recovery-planner view was silently wrong for the *default*, batch-mode-enabled environment).

**Fix:** complete the `image_classify` stage item per batch item, right where the single-item
worker does (after `persistClassifiedVariantDetail`, before the transform-queue send). A rejected
or failed ledger transition now logs the affected batch/run/item and fails the batch attempt; the
transform message cannot race ahead of the fan-in state that will eventually release compose.

**Best practice:** when a stage's completion write exists in exactly one of two code paths that can
both legitimately finish that stage (single-item vs. batched), that's a strong signal the other path
needs the identical completion call, not that the stage doesn't apply there. Grep for every
`shouldDivertToBatch`/`tryDivert*` branch when adding ledger instrumentation, not just the primary
non-batch path.

