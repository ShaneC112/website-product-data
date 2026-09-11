# Studio V2 run history was verified through three live image requests

## Context

The restored `TemplateRunHistoryInput` reads Azure-owned `aiImageGenerationTemplateRunLog` documents linked to the active `aiImageGenerationTemplate`. A three-request local E2E run was used to verify the full path after restoring the run-history feature.

## Evidence

- Fixture template: `e2e-image-v2-template-1789115848863`
- Fixture product: `e2e-image-v2-product-1789115848863`
- Three request documents were accepted by Azure.
- Three run-log documents were created in Sanity.
- All three runs reached `completed` with `recoveryState: completed`.
- Each run received a persisted `mediaImage` reference.
- The observed completed timestamps were `2026-09-11T08:38:42Z`, `2026-09-11T08:39:13Z`, and `2026-09-11T08:39:27Z`.

## Learning

The run-history field is an operational view of Azure-owned run-log state, not a snapshot embedded in the template. It must refresh while open because queued and generating states change asynchronously. The UI now polls every five seconds, logs read failures with the template ID, and preserves the last successful display until a later read succeeds.

## Best practice

When validating this path, confirm the sequence in both places: Azure status and Sanity run-log documents. A completed image request without a linked run-log document indicates an ingress/runtime deployment mismatch, while a visible run log without `mediaImage` indicates the pipeline has not reached persistence yet.