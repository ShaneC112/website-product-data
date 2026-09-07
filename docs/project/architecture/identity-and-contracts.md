# Identity And Contracts

Data is the single source of truth for cross-repository runtime schemas, storage names, storage keys, queue messages, registry definitions, and shared request payloads. Consumers validate through these schemas rather than recreate equivalent local types.

## Canonical Identity

- A product group is keyed by its raw M2CRM `styleCode` and a Table-safe `styleCodeStorageKey`.
- A commercial source record is identified by `m2crmUuid`.
- A source group is represented by `sourceGroupKey` and may contain several source records and discovered variants.
- A variant's canonical identity is colour/design first; width is included only when it distinguishes a real colour/design variant.
- A rendered page has a `urlKey` and a page role; every message carries the identity context needed by downstream work.

Identity values are business keys, not incidental URLs. A vendor URL can serve multiple commercial source records, so commercial price and pack data remain scoped to their matched source row rather than copied as a URL-level default.

`urlKey` must be scoped to the crawl/source group, never derived from the URL alone. Multiple distinct commercial records - different SKUs, different widths, even different style codes - can share one vendor URL; a `urlKey` computed as a pure function of the URL treats all of them as the same identity and silently collapses their evidence. A Sanity product is likewise a live style-code group, not a snapshot of source IDs: its M2CRM membership must be resolved from the current, live records at execution time (queue, requeue, or import), never retained from whichever IDs were present when the product was first created, or later membership changes are silently dropped.

Explicit variant membership (`SpecifiedUrls`) is a first-class contract, not something inferred from vendor page headings or URL labels: a request carries a validated URL array as source-authoritative membership, and a group using it must have both its expected variant count and its source-owning product-detail row present before it is eligible to publish - variant transforms run concurrently, so missing either creates a real publish race.

## Contract Ownership

When a Data schema changes, rebuild Data and refresh file-dependency consumers before testing. Azure, UI, Render, and Studio must update from the same contract revision where they share a protocol. Data's `sanity` export owns pure mapping and gate logic without a runtime Sanity client dependency.

Put a contract in Data when it is a project-controlled runtime or transport surface shared by two
or more repositories. A shared external-system document shape is not automatically Data-owned:
Studio-owned Sanity entity schemas remain the source of truth, while Azure and other consumers read
those entities through the Sanity/API surface. For image-generation v2, this means the selected
variant reference is the Sanity-native `variantKey` (`variants[]` item `_key`), while any broader
product `variantId` remains outside that v2 selector contract.

The render-completion contract intentionally echoes full identity and evidence metadata. Azure may be seeing a discovered variant page for the first time, leaving no safe alternate source for that context.

## Registry And Taxonomy

The code-owned field registry defines stable extraction fields, labels, value types, applicability, and publication metadata. The product taxonomy maps supported product types to category keys; category is derived, not independently inferred. An unsupported product type therefore fails bridge eligibility instead of producing a contradictory category.

See Data's [storage and messaging reference](../../../README.md#storage-and-messaging-reference) and [registry documentation](../../registry/README.md).