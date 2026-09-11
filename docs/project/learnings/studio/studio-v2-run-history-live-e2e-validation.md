# Studio V2 run history was verified through three live image requests

- **ID:** `studio-v2-run-history-live-e2e-validation`
- **Applies to:** `website-product-enrichment-sanity-studio`
- **Status:** Canonical learning detail.

## Learning

The run-history field is an operational view of Azure-owned run-log state, not a snapshot embedded in the template. It must refresh while open because queued and generating states change asynchronously. The UI now polls every five seconds, logs read failures with the template ID, and preserves the last successful display until a later read succeeds.

## Best practice

When validating this path, confirm the sequence in both places: Azure status and Sanity run-log documents. A completed image request without a linked run-log document indicates an ingress/runtime deployment mismatch, while a visible run log without `mediaImage` indicates the pipeline has not reached persistence yet.