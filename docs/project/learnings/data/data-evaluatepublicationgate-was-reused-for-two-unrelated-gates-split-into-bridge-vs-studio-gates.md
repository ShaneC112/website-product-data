# `evaluatePublicationGate` was reused for two unrelated gates - split into bridge vs Studio gates

- **ID:** `data-evaluatepublicationgate-was-reused-for-two-unrelated-gates-split-into-bridge-vs-studio-gates`
- **Applies to:** `website-product-data`
- **Status:** Canonical learning detail.

## Learning

## `evaluatePublicationGate` was reused for two unrelated gates - split into bridge vs Studio gates

`evaluatePublicationGate` used to be Studio's document-level Publish validation, and it re-checked
`importMeta.gateStatus`/`detailScore`/`accuracyScore`/`blockingReasons` - read-only pipeline
internals an editor has no way to fix. It was never the bridge gate (that's
`evaluateBridgeEligibility`, Phase 03), but it blurred the same line: a technical, Azure-owned
readiness check leaking into a content editor's surface.

**Fix (Phase 05):** `evaluatePublicationGate` is replaced by `evaluateStudioPublishReadiness`,
which only checks fields an editor can see and fix (name, shortDescription, productType, per-
variant colourName/hex/colourFamily/image) plus the same shared
`SANITY_CONTENT_REQUIREMENTS[productType]` trade-specific width/pack-info checks the bridge gate
uses - never a score, gate status, or blocking-reasons list. `importMeta` no longer carries
`detailScore`/`accuracyScore`/`gateStatus`/`blockingReasons`/`needsReview` at all; the one
surviving, deliberately narrow hint is `importAiConfidence: 'high'|'medium'|'low'`.

**Best practice:** never let a single function serve both the bridge gate and the Studio publish
gate, even when they overlap on a shared fact (e.g. "does this trade need a width") - factor the
shared fact into a table both consult (`SANITY_CONTENT_REQUIREMENTS`), but keep the two gate
functions themselves entirely separate so one never silently grows a pipeline-only check on the
editor-facing side.

