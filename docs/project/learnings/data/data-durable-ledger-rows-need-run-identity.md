# Durable ledger rows need run identity

- **ID:** `data-durable-ledger-rows-need-run-identity`
- **Applies to:** `website-product-data`
- **Status:** Canonical learning detail.

## Learning

## Durable ledger rows need run identity

The extraction batch ledger is keyed by group, operation, and URL so retries can reuse one durable item. That same key is also reused by later crawl runs. Without `runId` on the shared row contract, a later run cannot distinguish its own pending work from a succeeded item left by an earlier run.

**Solution:** carry optional `runId` on `crawlExtractBatchTableSchema` and test it at the shared package boundary. Azure can then preserve idempotency within a run while resetting terminal rows when ownership moves to a new run.

**Best practice:** when a durable work ledger outlives an orchestration run, store both business identity and run identity; keys alone are not enough to express retry ownership.

