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

Azure Tables and blobs may hold recoverable execution state only while work is in flight. The stage ledger records one logical target's progress for a run and recovery generation. The dispatch table acts as a durable outbox: Azure persists a dispatch record before sending the corresponding queue message. This prevents a process failure between state mutation and queue delivery from silently losing work.

Messages are idempotent and include the identity and generation information Azure needs to reject stale work. Starting a precise recovery advances the target generation; older messages cannot overwrite the current outcome.

### Durable While In-Flight

**Durable while in-flight** permits queue, Table, blob, receipt, lease, and orchestration state only while an active workflow needs retries, handoffs, idempotency, recovery, or safe finalization. It does not permit a persistent second copy of business or artifact data after the authoritative result exists.

Before adding a ledger or other persistent orchestration record, identify the authoritative durable home for its result. Crawl, render, and extract artifacts retain the evidence and facts; pipeline state must not persist their payload as a workflow duplicate. In V2 image generation, Sanity templates, dedicated prompt caches, and media outcomes are business data, while Azure retains only the active execution journal. Template prompt caches are authoritative reusable state; Azure claims, manifests, receipts, and other journals are execution state cleaned after finalization. A later run starts from the authoritative template/request/media result with the completed journal absent. Runtime cleanup does not delete legacy stored template fields; historical field removal is a separate approved operation.

After a successful final authoritative write, remove the execution journal and any temporary blobs or receipts when safe. Cleanup is itself recoverable: a cleanup failure retries idempotently, and a redelivery after cleanup must observe the authoritative result and converge without recreating completed journal state. A later run starts from authoritative inputs and artifacts, never from a completed Azure journal, manifest, or snapshot.

A plan or implementation that creates durable state must name the authoritative result or artifact owner, active-journal fields, finalization and cleanup trigger, cleanup-failure retry behavior, redelivery behavior after cleanup, and any retention exception. Exceptions must state why their bounded retention is necessary, such as a short quota window, and must not be described as retained business data. Do not add a persistent orchestrator merely because transient data crosses pipeline stages.

The completion check is falsifiable: a successful result is complete only when journal cleanup can converge and a later run works with that journal absent.

Multiple run-summary rows per group are normal, not a bug: a style crawled with N widths or N source records produces N run-summary rows (one runId each), but only one of them is the canonical run that actually progresses; the rest link as duplicates and never advance past their initial status. Any code that reads "the latest run for a group" - in Azure or in a consuming surface such as UI - must pick the most-advanced status, not the most recent timestamp, or it will surface a request that never did any real work.

Fan-out completion (for example, waiting on every discovered variant before composing a range) cannot depend on message arrival timing alone. Persist a durable completion predicate every producer can evaluate, use it to trigger the normal next-stage dispatch, and back it with a narrow periodic reconciliation check for missed delivery or process interruption - the reconciliation check must only retry the already-idempotent next step, never fabricate a new crawl request.

## Retries And Recovery

Transient failures retry through the owning Azure worker. A recovery request selects a fixed checkpoint rather than a free-form force operation: `render_source`, `extract_source`, `recover_missing_variants`, `extract_variants`, `classify_images`, `compose`, or `publish`.

Azure resolves affected targets server-side from the source group. UI and Studio can request recovery, but neither surface owns queue leases, target selection, dispatch state, or retry policy. A selected vendor-processing extension must fail and retry when it fails; it must not silently fall back to unrelated generic processing.

See the [shared contract reference](../../../README.md#stage-ledger-and-recovery-contracts-recoverable-queues-plan-in-progress) and Azure's [repository documentation](../../../../website-product-enrichment-azure/README.md) for implementation detail.