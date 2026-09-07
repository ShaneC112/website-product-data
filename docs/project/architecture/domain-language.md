# Domain Language

Use these terms consistently in cross-repository plans, code, tests, telemetry, and documentation. Prefer the canonical term over a shorter local synonym when identity, ownership, or lifecycle meaning matters. This page defines language; linked contracts and implementation remain authoritative for data shape and runtime behavior.

Add a term only when it is durable, repeatedly used, and costly to explain from first principles. Do not coin compressed jargon for a one-off operation. When a term changes, retain the old name only as a deprecated search alias with a migration destination.

## Identity

| Canonical term | Definition | Do not confuse with | Defining source |
| --- | --- | --- | --- |
| **Commercial source record** | One live M2CRM product row, identified by `m2crmUuid`, that owns commercial facts such as price and pack data. | A vendor URL, rendered page, or composed Sanity product. | [Identity and contracts](identity-and-contracts.md#canonical-identity) |
| **Style-code group** | The live commercial set of source records sharing one raw M2CRM `styleCode`; it is the canonical product-level grouping used when resolving current membership. | A snapshot of source IDs or one source-domain processing group. | [Identity and contracts](identity-and-contracts.md#canonical-identity) |
| **Source group** | A crawl-processing identity represented by `sourceGroupKey`, normally scoped by source table, root domain, and style code. | The broader style-code group or an individual source record. | [Storage and messaging reference](../../../README.md#common-identity-fields) |
| **Rendered page** | One captured vendor page identified within its source-group scope by `urlKey` and classified by `pageRole`. | A commercial source record; several records may share a vendor URL. | [Identity and contracts](identity-and-contracts.md#canonical-identity) |
| **Variant** | A colour/design-first product member; width participates in identity only when it distinguishes a real colour/design variant. | A source record or every width offered for the same colour/design. | [Identity and contracts](identity-and-contracts.md#canonical-identity) |

Avoid **product group** in new cross-repository contracts and documentation because it can mean either a style-code group or a source group. Name the intended identity explicitly.

## Pipeline And Evidence

| Canonical term | Definition | Do not confuse with | Defining source |
| --- | --- | --- | --- |
| **Pipeline stage** | One of the seven shared durable stages: `source_render`, `source_extract`, `variant_render`, `variant_extract`, `image_classify`, `compose`, or `publish`. | An operator recovery checkpoint, which is a user-facing restart choice. | [Pipeline and durability](pipeline-and-durability.md#stage-flow) |
| **Render evidence** | Captured page material emitted by Render, such as HTML, screenshot, visible text, elements, capture manifest, or vendor state. | Extracted facts or composed product content. | [Evidence and extraction](evidence-and-extraction.md) |
| **Extracted facts** | Registry-shaped facts derived from source or variant evidence and retained with their identity/evidence context. | Raw render evidence or final composed detail. | [Evidence and extraction](evidence-and-extraction.md) |
| **Composed detail** | The product-level result that combines commercial source facts and vendor evidence before bridge eligibility is evaluated. | A Sanity draft or published product. | [Pipeline and durability](pipeline-and-durability.md#stage-flow) |
| **Authoritative durable home** | The owning system and artifact or business record that remains the source of truth after a workflow completes. | An Azure journal, manifest, receipt, or temporary payload copy. | [Pipeline and durability](pipeline-and-durability.md#durable-while-in-flight) |
| **Durable while in-flight** | The limited retention of execution state needed for active retries, handoffs, idempotency, leases, recovery, or safe finalization; it ends after the authoritative result is written and cleanup converges. | Retaining a completed duplicate of business or artifact data. | [Pipeline and durability](pipeline-and-durability.md#durable-while-in-flight) |
| **Execution journal** | Queue, Table, blob, receipt, lease, or orchestration state used to progress and recover active work; it is removed after safe finalization rather than becoming completed business data. | The authoritative durable home. | [Pipeline and durability](pipeline-and-durability.md#durable-while-in-flight) |
| **Stage ledger** | Durable Azure Table state for one logical stage target, run, and recovery generation. | The dispatch table or a run-summary projection. | [Pipeline and durability](pipeline-and-durability.md#durable-state) |
| **Dispatch table** | The durable outbox persisted before a queue send so a state transition cannot lose its corresponding message. | The stage ledger that records processing progress. | [Pipeline and durability](pipeline-and-durability.md#durable-state) |
| **Canonical run** | The run-summary row for a source group that actually progresses through pipeline states. | A later duplicate run-summary row that links to existing work and remains at its initial state. | [Pipeline and durability](pipeline-and-durability.md#durable-state) |
| **Duplicate run** | A run-summary row deduplicated against the canonical run; it records the request but does not independently progress. | A retry or recovery generation within the canonical run. | [Pipeline and durability](pipeline-and-durability.md#durable-state) |
| **Recovery checkpoint** | A fixed operator-facing restart choice that Azure resolves to affected durable targets. | A free-form force operation or the internal pipeline-stage vocabulary. | [Pipeline and durability](pipeline-and-durability.md#retries-and-recovery) |

## Sanity And Operator Flow

| Canonical term | Definition | Do not confuse with | Defining source |
| --- | --- | --- | --- |
| **Bridge eligibility** | The Azure-side decision, implemented by `evaluateBridgeEligibility`, that determines whether composed detail may be ingested as a Sanity draft. | Studio publish readiness. | [Sanity and operator workflows](sanity-and-operator-workflows.md#draft-ingestion-and-publish) |
| **Draft ingestion** | Azure creating or updating a deterministic Sanity draft after bridge eligibility passes. | Editorial publication to the public website. | [Sanity and operator workflows](sanity-and-operator-workflows.md#draft-ingestion-and-publish) |
| **Studio publish readiness** | The editor-visible decision, implemented by `evaluateStudioPublishReadiness`, that determines whether a draft is ready for normal Studio publication. | Pipeline quality scoring or bridge eligibility. | [Sanity and operator workflows](sanity-and-operator-workflows.md#draft-ingestion-and-publish) |
| **Editorial publication** | An editor publishing eligible content through the normal Studio workflow. | Azure draft ingestion. | [Sanity and operator workflows](sanity-and-operator-workflows.md#draft-ingestion-and-publish) |
| **Operator action request** | A validated request persisted in Sanity and forwarded to Azure by minimal reference, unless the action deliberately owns a separate queue and ledger lifecycle. | A browser call containing Azure credentials or a queue payload treated as source of truth. | [Sanity and operator workflows](sanity-and-operator-workflows.md#operator-action-transport) |

## Maintenance

Project Knowledge owns this page. Before adding or changing a term:

1. Verify its current meaning in Data contracts and controlling implementation.
2. Check this page and nearby architecture documents for an existing concept.
3. Prefer one canonical term and list an old name only when readers still need it for search or migration.
4. Link the defining contract or architecture section instead of duplicating volatile fields and commands.
5. Update affected plans, agent pointers, and acceptance evidence when a terminology change alters behavior or routing.

## Influence

The shared-language approach is adapted from Matt Pocock's discussion of ubiquitous language in <https://github.com/mattpocock/skills> and EveryInc's narrowest-durable-home guidance in <https://github.com/EveryInc/compound-engineering-plugin>. This project keeps the vocabulary inside its existing canonical architecture hierarchy rather than introducing a parallel `CONTEXT.md` or `CONCEPTS.md` system.
