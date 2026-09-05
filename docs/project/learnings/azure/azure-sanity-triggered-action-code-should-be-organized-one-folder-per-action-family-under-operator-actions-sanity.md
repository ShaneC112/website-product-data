# Sanity-triggered action code should be organized one folder per action family under operator-actions/sanity

- **ID:** `azure-sanity-triggered-action-code-should-be-organized-one-folder-per-action-family-under-operator-actions-sanity`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## Sanity-triggered action code should be organized one folder per action family under operator-actions/sanity

`sanityActions.ts`'s single queue worker grew inline `processCrawlAction`, `processRebuildAction`,
and `processRecoverAction` functions, plus their own `archiveProduct`/`deleteProduct` helpers and
shared Sanity read/patch plumbing (`sanityClient`, `readProduct`, `actionPath`,
`patchActionStatus`), all in one 166-line file. `Crawl & Update` and `Delete & Rebuild` are the same
underlying operation (resolve live M2CRM eligibility, force-enqueue one manual crawl per eligible
source) except rebuild purges the group's durable Azure state and deletes the Sanity product first
- but that similarity was not visible from the file layout, and there was no isolated per-action
test coverage; every scenario had to go through the full dispatcher with a mocked `@sanity/client`
module.

**Fix:** moved `processCrawlAction`/`processRebuildAction` into
`src/operator-actions/sanity/update-product/processUpdateProductAction.ts`, `processRecoverAction`
into `src/operator-actions/sanity/recover-pipeline/processRecoverAction.ts`, and the shared
plumbing into `src/operator-actions/sanity/helpers/productActionStore.ts` - mirroring the existing
`sanity/import-style-code/` folder's shape. `sanityActions.ts` shrank to a thin dispatcher (parse
message, read/validate stored request, resolve `styleCode`, patch `processing`/`failed`, delegate).
Each new folder got its own README and its own test file using a fake Sanity client object
constructed directly, rather than mocking the `@sanity/client` module - possible because both
process functions already take an already-constructed client as a parameter. Zero functional/logic
change; full suite (100 suites / 535 tests) and typecheck stayed green throughout.

**Lesson:** when three near-identical inline functions share only their trigger source (one Sanity
queue worker) and diverge mainly in one destructive step, isolate them into per-action-family
folders with a thin caller-side dispatcher, matching an already-established sibling pattern
(`import-style-code/`) rather than inventing a new shape. Promote only genuinely cross-cutting code
to a shared `helpers/` folder - do not duplicate it per action folder.
