# Contracts and Queues

The [`queues`](../../src/queues/index.ts) and [`requests`](../../src/requests/index.ts)
exports define runtime Zod schemas shared by pipeline producers, workers, and operator-facing
request paths. Queue contracts cover crawl and render messages; request contracts cover shared
write and recovery request payloads.

Use the package subpaths `queues`, `queues/contracts`, `requests`, and `requests/contracts` for
these contracts. Consumers should parse the shared schemas instead of recreating local stage,
state, or payload definitions.

The versioned product-generation boundary contracts are reference-only: they carry
authoritative record identity, deterministic scrape operation identity, immutable
result/evidence references, recovery epoch/checkpoint, and compatible status. They
must not carry HTML, extracted facts, composed detail, prompts, or Sanity document
bodies. The queue names `product-generation-submissions-v1`,
`product-generation-sanity-actions-v1`, `website-scrape-requests-v1`, and
`website-scrape-completions-v1` are distinct from the legacy crawl queues.

The image-generation queue contracts in `src/queues/contracts.ts` also carry the immutable
prepared-run texture snapshot used by the standalone Sanity imagery pipeline. In particular,
`sanityImageGenerateRunSchema` accepts `texturePrompt` plus `textureSourceFingerprint` only as a
paired optional field set, so Studio and Azure either preserve the exact prepared-run texture
context together or omit it entirely.

Return to the [Data documentation index](../README.md).