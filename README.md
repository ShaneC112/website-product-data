# website-product-data

Private shared storage-contract repo for the website product enrichment system.

Purpose:
- centralize Azure Table, Blob, and Queue contract definitions
- centralize storage key builders used across repos
- centralize write request payload contracts used by Nuxt and Azure-owned write paths
- reduce drift between Azure writers and Nuxt readers

Current scope:
- storage table names
- storage container names
- storage queue names
- Azure Table entity types
- shared key helpers such as `buildCrawlProductDetailPartitionKey`
- shared write request schemas for Nuxt server routes and related callers

Current consumers:
- `website-product-enrichment-ui`
- `website-product-enrichment-azure`

Non-goals for the first cut:
- no public npm publishing
- no APISync integration yet
- no framework-specific runtime wrappers

Local integration pattern:
- add a file dependency: `"@shane-corrigan/website-product-data": "file:../website-product-data"`
- build this repo before consumers that require the emitted `dist/` output
- the Azure Functions repo currently imports built `dist/` subpaths directly for compatibility with its current TypeScript module resolution

Exports:
- `@shane-corrigan/website-product-data/requests`
- `@shane-corrigan/website-product-data/requests/contracts`
- `@shane-corrigan/website-product-data/storage`
- `@shane-corrigan/website-product-data/storage/constants`
- `@shane-corrigan/website-product-data/storage/contracts`
- `@shane-corrigan/website-product-data/storage/keys`

Decisions:
- The private shared package is the single source of truth for shared storage contracts and shared write request payload contracts.
- Nuxt write routes import request schemas from this package instead of duplicating them locally.
- Azure write functions should import the same shared request schemas wherever the payload contract matches.
- Page-local client validation that is only used by one page should be inlined in that page rather than kept in a shared UI schema file.
- APISyncAzure remains out of scope for this package.

Current request-contract adoption:
- `publishPreflight` is shared between Nuxt and Azure.
- `matchingLedgerApproval` is shared between Nuxt and Azure.
- `manualCrawlEnqueue` is shared on the Nuxt side, but the Azure function still uses a different payload shape and has not been aligned yet.