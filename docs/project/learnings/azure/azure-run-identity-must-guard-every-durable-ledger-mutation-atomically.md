# Run identity must guard every durable ledger mutation atomically

- **ID:** `azure-run-identity-must-guard-every-durable-ledger-mutation-atomically`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## Run identity must guard every durable ledger mutation atomically

Adding `runId` to batch rows and resetting terminal rows for a later run solved only the first half of cross-run reuse. A delayed job from the old run could still assign a new batch ID, mark the row succeeded, or delete it during fallback after the newer run had reset the same key. A read-then-write guard alone would still race.

**Solution:** filter coordinator pending scans by run, group sweeper flushes by stored run ID, and condition every reset, assignment, completion, and fallback deletion on both ownership fields and the row ETag. A mismatched or concurrently changed row becomes a no-op.

**Best practice:** once a durable row can be reused across runs, ownership is a condition on every mutation, not metadata checked only on insertion. Pair logical ownership checks with optimistic concurrency so the check and write cannot drift apart.

