# Storage

The [`storage`](../../src/storage/index.ts) export owns shared Azure storage vocabulary and
schemas: table, container, and queue names; persisted entity and blob shapes; and canonical
storage key helpers. These contracts keep Azure writers and UI readers aligned.

Use the package subpaths `storage`, `storage/constants`, and `storage/keys` for the public
storage surface. Storage schemas live beside their corresponding contract files under `src/storage/`.

Return to the [Data documentation index](../README.md).