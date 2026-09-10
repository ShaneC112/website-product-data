# Template run-log sidecars need guarded cleanup, hybrid writes, and persistence tests

- **ID:** `data-template-run-log-sidecars-need-guarded-cleanup-hybrid-writes-and-persistence-tests`
- **Applies to:** `website-product-data`, `website-product-enrichment-sanity-studio`, `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

A pipeline-wide operational sidecar needs a narrow public facade so callers do not duplicate Sanity mutations, identity rules, payload bounds, or failure handling. Its document identity should be deterministic and its writes should be classified by consequence: routine progress may be fire-and-forget with handled warnings, while creation, final prompts, terminal errors, media references, and completion should be awaited best effort.

Destructive cleanup must carry the expected revision into the mutation itself. A separate read-then-delete preflight leaves a race in which a concurrent edit can still be deleted under a stale operator intent. The deletion path should remain behind the guarded control contract and must fail closed when the revision is absent.

Persistence tests must cover every media outcome branch that can reach the sidecar, including fresh creation, already-attached reuse, reconciliation, repeated delivery, and a sidecar write that reports failure. The operational log is observational: a failed sidecar write must not change the durable image-generation outcome.

## Prevention

- Keep sidecar callers behind one facade and preserve request/template/run identity at every call site.
- Use bounded normalization for scene and error payloads.
- Put revision conditions in the Sanity mutation, not only in a preceding read.
- Add focused tests at the persistence worker seam for every attachment branch and logging failure behavior.
- Record UI action success/failure with the existing Studio toast pattern and keep server milestones on the shared structured logger.
