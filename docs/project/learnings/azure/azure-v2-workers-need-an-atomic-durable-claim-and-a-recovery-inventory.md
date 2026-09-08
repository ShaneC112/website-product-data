# V2 workers need an atomic durable claim and a recovery inventory

- **ID:** `azure-v2-workers-need-an-atomic-durable-claim-and-a-recovery-inventory`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## Queue delivery is at-least-once, so a worker must claim durable work atomically

A queue message is not ownership. Azure Queue can deliver the same logical work more than once, and two deliveries can begin together. The previous check-then-update shape let both workers observe `queued`, after which one worker changed the row to `running` and the other failed later when its handler tried to claim the same row again. That produced misleading state-fence errors and could leave the pipeline looking stalled even though the provider work had already started.

**Solution:** every v2 stage claims its orchestration row at the worker boundary with an ETag-guarded `queued -> running` update. A delivery that loses the ETag race returns `busy`; a delivery that finds a live running lease also returns `busy`; terminal rows return `terminal`. The handler runs only for the delivery that won the durable claim. An expired running lease may be reclaimed with the same ETag fence.

The claim must happen once. The resolve worker previously performed a second `queued -> running` transition inside its handler after the worker boundary had already claimed the row. That double claim was removed; the handler now updates an already-running row.

## Recovery rebuilds missing dispatches and reclaims expired running leases

A 30-second recovery timer now:
1. Redelivers expired or pending dispatch intents.
2. Reclaims orchestration rows stranded in `running` state whose lease has expired back to `queued`.
3. Requeues retryable failed work through the normal dispatch path.
4. Recreates dispatch intents for queued orchestration rows whose dispatch intent was lost.

Recovery logs the action along with its request, run, and work identity. Duplicate queue deliveries are therefore harmless, mid-execution crash states with expired leases are automatically recovered, and missing dispatch records are repairable without manually clearing storage.

## A queue retry is not the same thing as a visible worker retry

Azure Queue retry can be working while the worker still appears not to retry. In v2, the queue-triggered handler rethrows uncaught errors, so Azure will redeliver the message. But the durable orchestration row is the real execution gate. If a worker claims the row first and then throws before it records a durable failed state, the row can remain leased as `running`. The next queue delivery then sees a live lease and returns `busy` instead of re-entering the failing code path. That produces one visible failure followed by `busy delivery` logs, which looks like "retry is broken" even though Azure is redelivering correctly.

**Best practice:** any failure after a durable claim but before normal completion must transition the orchestration row into an explicit durable failure shape, including an incremented attempt count and failure history. Do not leave the row in `running` and expect queue redelivery alone to make the retry visible.

## Requeueing failed work must also reset the durable row to a claimable state

Recovery cannot just enqueue a new message for a retryable failed row. The worker claim gate only accepts `queued` rows or expired `running` rows. If recovery requeues a row that still says `failed`, the next delivery will not become a real retry; it will be acknowledged as `busy` or otherwise fenced by the durable state.

**Best practice:** when recovery resubmits retryable failed work, it must first transition the orchestration row back to a claimable state, typically `queued`, and clear any stale lease ownership before enqueueing the new message. Requeueing without that state reset is only queue noise, not a retry.

## Prevention and diagnosis

- Treat `busy delivery` as expected at-least-once delivery evidence, not automatically as a failure.
- If you see one real failure followed by repeated `busy delivery` logs, inspect whether the row was left `running` after the failure instead of being marked `failed`.
- If recovery logs `accepted requeue-work` but the worker still logs `busy delivery`, inspect whether recovery reset the row back to `queued` before enqueueing.
- For a state-fence error, inspect whether the worker performed a durable claim before the handler and whether the handler still performs a second claim.
- Inspect the orchestration row's `ownerToken`, `leaseExpiresAt`, `state`, and ETag before changing durable state.
- Inspect pending/expired dispatch intents, retryable failures, queued rows, active queues, and poison queues together; no single view proves recovery succeeded.
- Use the request ID, run ID, step, and work key in server logs so a duplicate can be matched to its durable row.
- Keep worker tests for terminal and busy acknowledgements, and store-level tests for queued claim, active lease rejection, expired lease reclaim, and ETag conflict.
- Do not clear tables or queues as a first response. Clearing destroys the evidence needed to distinguish a duplicate delivery, a lost dispatch, a stale lease, and a real provider failure.

## Verified evidence

The Bern 2 x 2 live run completed all four runs through resolve, generate, assemble, render, and persist. The corresponding four Sanity media documents were present, all v2 active and poison queues were empty, and no dispatch intents remained. The focused orchestration-store suite passes with direct coverage for the claim and lease decisions described above.
