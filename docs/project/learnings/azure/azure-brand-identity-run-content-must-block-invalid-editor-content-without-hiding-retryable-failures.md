# Azure learning: Brand identity run content must block invalid editor content without hiding retryable failures

- **ID:** `azure-brand-identity-run-content-must-block-invalid-editor-content-without-hiding-retryable-failures`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

A deterministic global prompt feature can distinguish invalid editor-authored content from a temporary Sanity or storage failure. Missing or malformed `imageGenerationSettings` content is a visible terminal block for the current assembly run. Transport and durable-storage failures must propagate so the normal retry and recovery path can handle them.

## Resolution

Brand identity normalizes the required `visualGuidance` and `brandGuidance` fields, pins valid content in the run-content store, and passes only the normalized contract into direct assembly. The final prompt renders one bounded brand section, while logs and the dependency manifest record only the schema version and a content fingerprint. Cleanup removes the run-content row and claim after both successful and blocked assembly paths.

## Best practice

Keep source validation and feature wording behind the feature boundary. Catch only the validation error that represents invalid editor content; do not convert arbitrary reader or storage errors into a terminal content block. Test first miss, same-run reuse, invalid persisted versions, missing content, cross-run isolation, cleanup, and exactly-once final rendering separately.

## Verification checklist

- Data contract validation and fingerprint tests pass.
- Azure feature, resolver, assembly, and worker tests pass.
- Studio schema tests cover both required singleton fields.
- Live proof is guarded by `--confirm`, a local/development allow-list, and synthetic-AI mode.
- Live proof verifies duplicate convergence, same-run reuse, separate run identities, cleanup, fingerprint metadata, and one final Brand Identity section.
