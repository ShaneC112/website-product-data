# Storage

The [`storage`](../../src/storage/index.ts) export owns shared Azure storage vocabulary and
schemas: table, container, and queue names; persisted entity and blob shapes; and canonical
storage key helpers. These contracts keep Azure writers and UI readers aligned.

Use the package subpaths `storage`, `storage/constants`, and `storage/keys` for the public
storage surface. Storage schemas live beside their corresponding contract files under `src/storage/`.

The standalone Sanity imagery pipeline also uses a dedicated texture-prompt ledger contract in
`src/storage/sanity-texture-prompt.schema.ts`. `sanityTexturePromptLedgerSchema` defines the
durable Azure Table row keyed by product/fingerprint ownership, including status, attempt counts,
optional lease expiry, prompt hash, model, and terminal error fields for product-level texture
prompt analysis.

Return to the [Data documentation index](../README.md).