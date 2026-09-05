# Pipeline And Durability

Azure drives one durable product-enrichment workflow. The stage vocabulary is shared through Data so recovery, telemetry, and operator interfaces describe the same work.

## Stage Flow

1. `source_render`: Azure validates a source request and asks Render to capture source-page evidence.
2. `source_extract`: Azure turns captured source evidence into structured, registry-driven facts and variant discovery.
3. `variant_render`: Azure requests evidence for each required variant page.
4. `variant_extract`: Azure extracts variant-level evidence and associates it with the source group.
5. `image_classify`: Azure classifies captured imagery and selects reviewable candidates.
6. `compose`: Azure combines commercial source facts and vendor evidence into product detail.
7. `publish`: Azure evaluates bridge eligibility and creates or updates a Sanity draft only when eligible.

Render stops after emitting completion evidence. It never decides the next stage or writes Azure Tables. Studio publication is a separate editorial action after Azure draft ingestion.

## Durable State

Azure Tables and blobs hold recoverable state. The stage ledger records one logical target's progress for a run and recovery generation. The dispatch table acts as a durable outbox: Azure persists a dispatch record before sending the corresponding queue message. This prevents a process failure between state mutation and queue delivery from silently losing work.

Messages are idempotent and include the identity and generation information Azure needs to reject stale work. Starting a precise recovery advances the target generation; older messages cannot overwrite the current outcome.

Multiple run-summary rows per group are normal, not a bug: a style crawled with N widths or N source records produces N run-summary rows (one runId each), but only one of them is the canonical run that actually progresses; the rest link as duplicates and never advance past their initial status. Any code that reads "the latest run for a group" - in Azure or in a consuming surface such as UI - must pick the most-advanced status, not the most recent timestamp, or it will surface a request that never did any real work.

Fan-out completion (for example, waiting on every discovered variant before composing a range) cannot depend on message arrival timing alone. Persist a durable completion predicate every producer can evaluate, use it to trigger the normal next-stage dispatch, and back it with a narrow periodic reconciliation check for missed delivery or process interruption - the reconciliation check must only retry the already-idempotent next step, never fabricate a new crawl request.

## Retries And Recovery

Transient failures retry through the owning Azure worker. A recovery request selects a fixed checkpoint rather than a free-form force operation: `render_source`, `extract_source`, `recover_missing_variants`, `extract_variants`, `classify_images`, `compose`, or `publish`.

Azure resolves affected targets server-side from the source group. UI and Studio can request recovery, but neither surface owns queue leases, target selection, dispatch state, or retry policy. A selected vendor-processing extension must fail and retry when it fails; it must not silently fall back to unrelated generic processing.

See the [shared contract reference](../../../README.md#stage-ledger-and-recovery-contracts-recoverable-queues-plan-in-progress) and Azure's [repository documentation](../../../../website-product-enrichment-azure/README.md) for implementation detail.