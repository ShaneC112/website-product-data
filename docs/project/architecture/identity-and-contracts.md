# Identity And Contracts

Data is the single source of truth for cross-repository runtime schemas, storage names, storage keys, queue messages, registry definitions, and shared request payloads. Consumers validate through these schemas rather than recreate equivalent local types.

## Canonical Identity

- A product group is keyed by its raw M2CRM `styleCode` and a Table-safe `styleCodeStorageKey`.
- A commercial source record is identified by `m2crmUuid`.
- A source group is represented by `sourceGroupKey` and may contain several source records and discovered variants.
- A variant's canonical identity is colour/design first; width is included only when it distinguishes a real colour/design variant.
- A rendered page has a `urlKey` and a page role; every message carries the identity context needed by downstream work.

Identity values are business keys, not incidental URLs. A vendor URL can serve multiple commercial source records, so commercial price and pack data remain scoped to their matched source row rather than copied as a URL-level default.

## Contract Ownership

When a Data schema changes, rebuild Data and refresh file-dependency consumers before testing. Azure, UI, Render, and Studio must update from the same contract revision where they share a protocol. Data's `sanity` export owns pure mapping and gate logic without a runtime Sanity client dependency.

The render-completion contract intentionally echoes full identity and evidence metadata. Azure may be seeing a discovered variant page for the first time, leaving no safe alternate source for that context.

## Registry And Taxonomy

The code-owned field registry defines stable extraction fields, labels, value types, applicability, and publication metadata. The product taxonomy maps supported product types to category keys; category is derived, not independently inferred. An unsupported product type therefore fails bridge eligibility instead of producing a contradictory category.

See Data's [storage and messaging reference](../../../README.md#storage-and-messaging-reference) and [registry documentation](../../registry/README.md).