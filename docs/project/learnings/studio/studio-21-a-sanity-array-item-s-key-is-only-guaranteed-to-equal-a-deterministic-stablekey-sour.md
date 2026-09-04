# Studio learning 21: A Sanity array item's `_key` is only guaranteed to equal a deterministic `stableKey(sour

- **ID:** `studio-21-a-sanity-array-item-s-key-is-only-guaranteed-to-equal-a-deterministic-stablekey-sour`
- **Applies to:** `website-product-enrichment-sanity-studio`
- **Status:** Canonical learning detail.

## Learning

- A Sanity array item's `_key` is only guaranteed to equal a deterministic `stableKey(sourceId)` value if the array was built by code that explicitly set `_key` that way (as `website-product-data`'s ingestion `buildVariant` does for `productVariant._key`) - items added later through the Studio UI get a random `_key`. Azure and this repo's Blueprint Function both derive a variant's `_key` from `variantId` via a local `stableKey`-style helper to avoid an extra read-before-patch; if `ingestion.ts`'s algorithm ever changes, every local copy (this repo's `deriveVariantKey` in `src/imageGenerationRequests.ts`, Azure's `variantStableKey` in `sanityImageClient.ts`) must change with it or variant-scoped patches will silently stop matching.
