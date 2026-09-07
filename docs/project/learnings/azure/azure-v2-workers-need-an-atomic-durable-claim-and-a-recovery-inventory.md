# V2 workers need an atomic durable claim and a recovery inventory

- **ID:** `azure-v2-workers-need-an-atomic-durable-claim-and-a-recovery-inventory`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## Queue delivery is at-least-once, so a worker must claim durable work atomically

A queue message is not ownership. Azure Queue can deliver the same logical work more than once, and two deliveries can begin together. The previous check-then-update shape let both workers observe `queued`, after which one worker changed the row to `running` and the other failed later when its handler tried to claim the same row again. That produced misleading state-fence errors and could leave the pipeline looking stalled even though the provider work had already started.

**Solution:** every v2 stage claims its orchestration row at the worker boundary with an ETag-guarded `queued -> running` update. A delivery that loses the ETag race returns `busy`; a delivery that finds a live running lease also returns `busy`; terminal rows return `terminal`. The handler runs only for the delivery that won the durable claim. An expired running lease may be reclaimed with the same ETag fence.

The claim must happen once. The resolve worker previously performed a second `queued -> running` transition inside its handler after the worker boundary had already claimed the row. That double claim was removed; the handler now updates an already-running row.

## Recovery must rebuild missing dispatches and recover the durable states it inventories

A 30-second recovery timer now redelivers expired or pending dispatch intents, requeues retryable failed work through the normal dispatch path, and recreates dispatch intents for queued orchestration rows whose dispatch intent was lost. Recovery logs the action and its request, run, and work identity. Duplicate queue deliveries are therefore harmless and missing dispatch records are repairable without manually clearing storage.

This inventory is not yet a complete stranded-work detector. An orchestration row that is `running` with an expired lease but whose queue message and dispatch intent were both permanently lost is not found by the current recovery scans. That case needs a future expired-running reconciliation scan, with care to avoid reclaiming genuinely long-running provider work.

## Prevention and diagnosis

- Treat `busy delivery` as expected at-least-once delivery evidence, not automatically as a failure.
- For a state-fence error, inspect whether the worker performed a durable claim before the handler and whether the handler still performs a second claim.
- Inspect the orchestration row's `ownerToken`, `leaseExpiresAt`, `state`, and ETag before changing durable state.
- Inspect pending/expired dispatch intents, retryable failures, queued rows, active queues, and poison queues together; no single view proves recovery succeeded.
- Use the request ID, run ID, step, and work key in server logs so a duplicate can be matched to its durable row.
- Keep worker tests for terminal and busy acknowledgements, and store-level tests for queued claim, active lease rejection, expired lease reclaim, and ETag conflict.
- Do not clear tables or queues as a first response. Clearing destroys the evidence needed to distinguish a duplicate delivery, a lost dispatch, a stale lease, and a real provider failure.

## Verified evidence

The Bern 2 x 2 live run completed all four runs through resolve, generate, assemble, render, and persist. The corresponding four Sanity media documents were present, all v2 active and poison queues were empty, and no dispatch intents remained. The focused orchestration-store suite passes with direct coverage for the claim and lease decisions described above.
