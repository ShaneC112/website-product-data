# `file:` dependents must be rebuilt *and restarted*

- **ID:** `ui-file-dependents-must-be-rebuilt-and-restarted`
- **Applies to:** `website-product-enrichment-ui`
- **Status:** Canonical learning detail.

## Learning

## `file:` dependents must be rebuilt *and restarted*

Same note as `website-product-data`'s LEARNINGS.md: after any change to that shared
package, `npm install ../website-product-data --no-save` (or `pnpm install`) refreshes
the on-disk copy here, but a running dev server can still hold a stale in-memory
module. Restart the process, don't just rebuild.

