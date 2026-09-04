# jest's moduleNameMapper needs a per-relative-import entry into website-product-data's own src

- **ID:** `azure-jest-s-modulenamemapper-needs-a-per-relative-import-entry-into-website-product-data-s-own-src`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## jest's moduleNameMapper needs a per-relative-import entry into website-product-data's own src

Adding a new field to `queues/contracts.ts` that imports `extractedScalarMeasurementSchema` from
`'../storage/page-detail.schema.js'` (a relative import *within* `website-product-data/src`) broke
every jest suite in this repo that transitively imports `shared/contracts.ts`, even though the shared
package builds and typechecks fine on its own. `jest.config.js` hand-maps each `.js`-suffixed relative
import path used inside `website-product-data/src` to its real `.ts` source file (ts-jest does not
resolve `.js` imports to sibling `.ts` files the way the real TypeScript/Node ESM build does), and the
mapper only had entries for import paths that already existed before.

**Fix:** whenever a shared-package source file adds a new relative import to another shared-package
source file (not just a new `@shane-corrigan/website-product-data/...` subpath import, which is already
covered by the generic mapper), add a matching regex entry to this repo's `jest.config.js`
`moduleNameMapper` for that exact relative path, or the test suite fails with a "Cannot find module"
error that has nothing to do with the actual change.


**Best practice:** never copy a storage grouping key into a domain identity field merely because both are available at the same orchestration boundary. Tests should assert each field's semantic value, not only that fan-out occurred.

