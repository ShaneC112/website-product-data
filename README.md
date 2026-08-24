# website-product-data

Private shared storage-contract repo for the website product enrichment system.

Purpose:
- centralize Azure Table, Blob, and Queue contract definitions
- centralize storage key builders used across repos
- reduce drift between Azure writers and Nuxt readers

Current scope:
- storage table names
- storage container names
- storage queue names
- Azure Table entity types
- shared key helpers such as `buildCrawlProductDetailPartitionKey`

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

Exports:
- `@shane-corrigan/website-product-data/storage`
- `@shane-corrigan/website-product-data/storage/constants`
- `@shane-corrigan/website-product-data/storage/contracts`
- `@shane-corrigan/website-product-data/storage/keys`