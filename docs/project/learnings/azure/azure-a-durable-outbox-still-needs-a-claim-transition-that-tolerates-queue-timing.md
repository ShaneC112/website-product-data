# A durable outbox still needs a claim transition that tolerates queue timing

- **ID:** `azure-a-durable-outbox-still-needs-a-claim-transition-that-tolerates-queue-timing`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## A durable outbox still needs a claim transition that tolerates queue timing

An atomic batch claim writes a `ready` dispatch before queue delivery. The coordinator then sends
the queue message and marks that record `queued`. Azure Queue delivery can begin before the latter
ETag-conditional update completes, so a worker that reads `ready` can lose its first update solely
because the coordinator changed it to `queued` milliseconds later.

**Fix:** retry the lease claim once after a `412`, rereading the dispatch. The retry can claim the
valid `queued` state, while a genuinely active `processing` owner remains fenced out. The sweeper
is still the recovery path for crashes; it should not be the normal path for this handoff race.

**Best practice:** a durable outbox removes the send/crash gap, but every optimistic state
transition around queue delivery must explicitly account for the consumer arriving before the
producer has completed its post-send bookkeeping. Add a deterministic ETag-race unit test.

