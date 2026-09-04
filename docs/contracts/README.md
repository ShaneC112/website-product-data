# Contracts and Queues

The [`queues`](../../src/queues/index.ts) and [`requests`](../../src/requests/index.ts)
exports define runtime Zod schemas shared by pipeline producers, workers, and operator-facing
request paths. Queue contracts cover crawl and render messages; request contracts cover shared
write and recovery request payloads.

Use the package subpaths `queues`, `queues/contracts`, `requests`, and `requests/contracts` for
these contracts. Consumers should parse the shared schemas instead of recreating local stage,
state, or payload definitions.

Return to the [Data documentation index](../README.md).