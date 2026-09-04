# Variant-scoped Sanity patch paths need a locally-derived key, not a fetched one

- **ID:** `azure-variant-scoped-sanity-patch-paths-need-a-locally-derived-key-not-a-fetched-one`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## Variant-scoped Sanity patch paths need a locally-derived key, not a fetched one

Moving completed room images onto `productVariant.roomsets[]` (instead of `imageGenerationRequest.runs[]`)
meant every `sanityImageClient.ts` patch function needed to target `variants[_key==<variantKey>]` in
addition to the run ID. Rather than fetching the document first to read the real `_key`, this repo
derives it locally via `variantStableKey(variantId)`, a private helper that must byte-for-byte match
`website-product-data`'s `src/sanity/ingestion.ts` `stableKey()` - the function that actually assigned
`_key: stableKey(variantId)` when the variant array was first built. `website-product-data` does not
export this helper, so it is duplicated locally in both this repo and the Studio Blueprint Function
(`src/imageGenerationRequests.ts`'s `deriveVariantKey`), matching this codebase's existing pattern of
per-module `stableKey` duplication rather than a shared export.

**Best practice:** if `ingestion.ts`'s `stableKey()` algorithm ever changes, every local copy must
change with it in the same commit, or variant-scoped patches will silently stop matching any array
item (the patch resolves to a no-op, not an error).

