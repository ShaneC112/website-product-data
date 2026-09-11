---
name: product-enrichment-pipeline-durability
description: "Use for Website Product Enrichment queue contracts, durable orchestration, stage ledgers, outboxes or dispatch intents, claims or leases, retries or recovery, fan-out completion, lifecycle state, cleanup or finalization, status projection, provider side-effect uncertainty, and missing handoffs in the main product-enrichment pipeline or sanity-images-v2."
---

# Product Enrichment Pipeline Durability

Reconstruct durable state and interruption boundaries before proposing or implementing a change. Keep shared invariants common while preserving the distinct state machines used by the main product-enrichment pipeline and `sanity-images-v2`.

## Source Order

1. Read `website-product-data/docs/project/architecture/pipeline-and-durability.md`, `website-product-data/docs/project/architecture/README.md`, `website-product-data/docs/project/architecture/domain-language.md`, and `website-product-data/docs/project/project-map.json`.
2. Read `website-product-enrichment-azure/src/README.md`, then the nearest stage, `core`, `recovery`, or store README and the closest controlling code and tests.
3. For Image V2, read `website-product-enrichment-azure/src/sanity-images-v2/README.md`, then the applicable submission, orchestration, dispatch, store, recovery, status, and lifecycle worker code and tests.
4. For Azure server changes or log review, apply `website-product-data/docs/project/architecture/azure-logging.md` and Azure's repository logging guide.

Keep volatile filenames, queue names, table names, and field inventories in source pointers. Verify them in current contracts and implementation instead of copying them into plans or reviews.

## Ownership

- Data owns shared queue, request, storage, key, lifecycle, and status contracts. Change and build Data before consumers.
- Azure owns durable execution, queue and storage orchestration, recovery, status projection, and pipeline Sanity writes.
- Render is stateless. It returns capture evidence and never owns Azure Tables, downstream orchestration, or stage selection.
- Studio owns Sanity schemas, actions, and Studio UX. It does not own Azure durable execution.

## Shared Invariants

1. Name the authoritative durable result or artifact owner before adding a ledger, manifest, receipt, or snapshot.
2. Keep orchestration state durable only while work is in flight. Do not retain a persistent duplicate of a business payload or artifact after the authoritative write.
3. Persist an outbox or dispatch intent before delivery. Make messages minimal, versioned, deterministic where applicable, and idempotent under duplicate delivery.
4. Make claims and leases expire or otherwise recover. A worker failure must leave durable state retryable; reset a failed row to a claimable state before redispatch.
5. Fence stale work with the applicable generation, epoch, or active-run identity before it can mutate current results.
6. Persist fan-out completion predicates independently of message arrival order. Reconciliation retries the existing idempotent transition rather than fabricating a new request.
7. Reconcile missing handoffs where an upstream completion can exist without the downstream row or dispatch intent.
8. On redelivery, check the authoritative result before recreating execution state or repeating a side effect.
9. Finalization and cleanup must converge idempotently. Cleanup failure remains recoverable, post-cleanup redelivery does not recreate completed journals, and a later run works with the old completed journal absent.
10. Provider acceptance that cannot be reconciled is `provider-outcome-unknown`, never success. Do not repeat a provider side effect merely because local acknowledgement is absent.
11. Derive public or operator status from durable evidence, including required authoritative output, rather than optimistic queue progress or log messages.
12. Azure logs use the shared structured logger, preserve available request, run, module, and operation context, and redact payloads, prompts, secrets, credentials, signed URLs, and sensitive source data.

## Distinct Implementations

### Main Product-Enrichment Pipeline

Use the seven shared stages: `source_render`, `source_extract`, `variant_render`, `variant_extract`, `image_classify`, `compose`, and `publish`. The stage ledger records run and recovery-generation progress; dispatch rows are recovery checkpoints for queue delivery; fixed operator recovery checkpoints map onto affected stage targets. Preserve durable fan-out completion before compose and distinguish canonical progressing runs from duplicate run-summary projections.

### Sanity Images V2

Use the external submission boundary plus Azure-internal `resolve`, `generate`, `assemble`, `render`, and `persist` lifecycle. Submission claims protect command handling and result reprojection. Orchestration rows and dispatch intents protect internal transitions. Generation or active-run fencing prevents stale workers and provider calls. Missing-handoff reconciliation covers completed lifecycle work whose downstream row was never created.

Do not rename Image V2 lifecycle steps as the seven crawl stages. Do not impose Image V2 submission claims on the main pipeline when its stage ledger and recovery generation already own the transition.

## Review Workflow

1. Draw the state-transition map: durable row or artifact, state, owner, transition trigger, side effect, and next durable evidence.
2. Mark every interruption boundary between durable writes, queue sends, provider calls, authoritative writes, status projection, and cleanup.
3. For each boundary, answer what duplicate delivery observes, what stale work is fenced by, how failed work becomes claimable, how a missing downstream handoff is found, and what proves completion.
4. Check ownership and payload retention. Move shared contracts to Data, durable behavior to Azure, and browser capture to Render; remove persistent duplicate payloads unless a documented bounded retention exception exists.
5. Recommend the smallest change at the earliest owner and name a focused check capable of falsifying it.

## Validation Matrix

Cover the applicable cases with focused tests:

- duplicate queue delivery converges without duplicate state or side effects;
- interruption after state write but before dispatch is recovered from the durable intent;
- stale generation, epoch, or active-run work cannot mutate current state;
- failed or expired claims become claimable before redispatch;
- a missing downstream row is reconstructed from durable upstream completion evidence;
- cleanup failure retries, post-cleanup redelivery converges, and a later run succeeds without the completed journal;
- concurrent workers produce one valid transition or provider side effect;
- status remains pending or failed until required durable result evidence exists.

Use [Product Enrichment Architecture](../product-enrichment-architecture/SKILL.md) for repository routing, [Diagnosing Bugs](../diagnosing-bugs/SKILL.md) for difficult reproduction loops, [Product Enrichment Validation](../product-enrichment-validation/SKILL.md) for command selection, [Product Enrichment Live E2E](../product-enrichment-live-e2e/SKILL.md) for separately approved live runs, and [Reviewing Changes](../reviewing-changes/SKILL.md) for settled implementation review. These skills retain their own procedures and approval gates.

## Completion

Return the reconstructed state machine, interruption-boundary findings, authoritative result and journal lifecycle, implementation distinction used, focused validation, residual uncertainty, and any protected operation that still requires fresh approval.