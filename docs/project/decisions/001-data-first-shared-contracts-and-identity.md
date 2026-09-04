# ADR 001: Data-First Shared Contracts And Identity

- **Status:** Accepted
- **Date:** 2026-09-04
- **Owners:** Data, Azure, Render, UI, Studio

## Context

The enrichment workflow crosses queue messages, Azure Tables, blob artefacts, request payloads, registry definitions, and Sanity mapping. Recreating these contracts in each consumer caused drift risk, especially where a business identity must survive asynchronous fan-out.

## Decision

`website-product-data` owns cross-repository runtime schemas, storage keys, canonical product and variant identity helpers, registry data, and pure Sanity mapping/gate contracts. Consumers build or refresh the Data dependency before adopting a shared contract change and validate input through the shared schemas.

Group identity is style-code first, source identity is `m2crmUuid`, and variant identity is colour/design first with width only where it distinguishes a true variant. URLs remain evidence locations, not primary commercial identities.

## Consequences

- A shared schema changes in Data before Azure, Render, UI, or Studio consume it.
- Queue messages preserve enough identity context for downstream workers that may not have another lookup source.
- File-dependency consumers must be refreshed after Data changes to avoid stale built output.
- Local page-only validation can remain local when it is not a cross-repository contract.

See [Identity and contracts](../architecture/identity-and-contracts.md).