# Entity-table-per-step split surfaced two pre-existing concurrency gaps that must stay unfixed here

- **ID:** `azure-entity-table-per-step-split-surfaced-two-pre-existing-concurrency-gaps-that-must-stay-unfixed-here`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## Entity-table-per-step split surfaced two pre-existing concurrency gaps that must stay unfixed here

Splitting the shared `crawlPageDetail`/`crawlVariantDetail`/`crawlVariantSwatch`/`crawlProductDetail`/
`crawlGroupState`/`crawlMatchingLedger`/`crawlGroupPdf`/`crawlValidation` tables into step-owned
tables (`sourceExtractDetail`/`variantExtractDetail`, `imageClassifyOutcome`, `imageClassifySwatch`,
`composeOutput`, `composeGroupState`, `publishMatchLedger`, `extractGroupPdf`,
`sourceRenderValidation` - see `plan/queue file refactor/01a-entity-table-redesign.md`) is a pure
data-model rename/split, but reading the real call sites surfaced two **pre-existing** concurrency
behaviors that must be carried forward exactly, not "fixed" as part of the rename:

1. **`crawlRequestDispatcher.ts`'s "price recompose" fast path** (a reused crawl request whose only
   change is pricing) reads/writes `composeOutput`/`composeGroupState` directly, bypassing the
   render→...→compose queue chain entirely. This can race with an in-flight full pipeline run
   recomposing the same group - both could be writing the same rows concurrently. This race exists
   today and is out of scope to fix here; do not add a new lock/guard for it.
2. **`crawlStyleGroupPurge.ts`'s destructive rebuild** (wipes every row for a style-code group across
   every renamed/split table) can race with an in-flight pipeline run for the same group
   (delete-while-processing). Also pre-existing and out of scope to fix; do not add a new lock.

Both are one-hop-back exceptions, alongside recovery/UI observability and operator-actions' manual
overrides.

