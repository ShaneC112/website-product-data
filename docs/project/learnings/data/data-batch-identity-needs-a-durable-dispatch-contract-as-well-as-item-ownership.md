# Batch identity needs a durable dispatch contract as well as item ownership

- **ID:** `data-batch-identity-needs-a-durable-dispatch-contract-as-well-as-item-ownership`
- **Applies to:** `website-product-data`
- **Status:** Canonical learning detail.

## Learning

## Batch identity needs a durable dispatch contract as well as item ownership

The batch item ledger records which URL belongs to a batch, but that alone cannot recover the
crash window after atomic assignment and before the queue message is delivered. A dispatch/outbox
record in the same storage partition carries the serialized job, state, attempt, owner token, and
lease expiry, allowing a sweeper to replay abandoned work without rebuilding its membership.

**Best practice:** for at-least-once queue work, model both durable item membership and durable
delivery intent in the shared storage contract. Keep the lifecycle fields explicit (`ready`,
`queued`, `processing`, `completed`) so writers, workers, and operator diagnostics use one shape.

