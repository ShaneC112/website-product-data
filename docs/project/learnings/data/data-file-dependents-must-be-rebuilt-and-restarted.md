# `file:` dependents must be rebuilt *and restarted*

- **ID:** `data-file-dependents-must-be-rebuilt-and-restarted`
- **Applies to:** `website-product-data`
- **Status:** Canonical learning detail.

## Learning

## `file:` dependents must be rebuilt *and restarted*

Every change here requires: `npm run build` in this package, then
`npm install ../website-product-data --no-save` (or `pnpm install`) in each
consumer, then a full process restart of that consumer (not just a rebuild) —
`pnpm`/`npm`'s `file:` protocol can leave a stale on-disk copy, and a long-running
dev/runtime process can hold a stale in-memory module even after the on-disk copy
is refreshed. Confirmed consumers as of this change:
`website-product-enrichment-azure`, `website-product-enrichment-ui`,
`website-product-enrichment-render`.

