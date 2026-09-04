# ADR 002: Azure Durability And Render Stateless Capture

- **Status:** Accepted
- **Date:** 2026-09-04
- **Owners:** Azure, Render, Data

## Context

Browser automation has vendor-specific, transient execution needs, while enrichment progression needs idempotency, recovery, retry, and durable auditability. Combining them would make the browser worker responsible for storage state and downstream policy.

## Decision

Azure owns queue dispatch, stage ledgers, transactional-outbox records, retries, recovery generations, extraction, composition, and publication orchestration. Render is a stateless Fastify and Playwright worker: it accepts Azure-assigned render jobs, performs generic or vendor-specific browser interaction, writes capture artefacts, emits a complete result, and stops.

Vendor DOM selectors and deterministic vendor parsing reside in Render modules. Azure consumes their structured evidence through common contracts and remains vendor-agnostic.

## Consequences

- Render does not write Azure Tables, enqueue later enrichment stages, decide readiness, or publish content.
- Azure can reject stale messages and recover precise targets independently of browser-worker state.
- A render-completion message must echo all Azure-required identity and evidence metadata.
- Scaling Render replicas does not create a second durable orchestration implementation.

See [Pipeline and durability](../architecture/pipeline-and-durability.md) and [Evidence and extraction](../architecture/evidence-and-extraction.md).