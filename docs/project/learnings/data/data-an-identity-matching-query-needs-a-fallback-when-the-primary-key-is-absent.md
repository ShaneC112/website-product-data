# An identity-matching query needs a fallback when the primary key is absent

- **ID:** `data-an-identity-matching-query-needs-a-fallback-when-the-primary-key-is-absent`
- **Applies to:** `website-product-data`
- **Status:** Canonical learning detail.

## Learning

## An identity-matching query needs a fallback when the primary key is absent

`buildSanityIngestionPlan`'s `existingProductQuery` only matched an existing Sanity
product by `styleCodeNormalized`, so a product row with no style code (still valid -
`styleCode` is optional end-to-end) could never be matched to its own previously
published draft; each ingestion run would create a new duplicate product instead of
updating the existing one.

**Fix:** when `styleCodeNormalized` is absent, fall back to matching on
`importMeta.externalId` (the row's `sourceGroupKey`/`rowKey`) instead, which is
always populated. Two query strings are still deliberately separate (rather than
one query with optional params) so a missing style code doesn't loosen an
otherwise-precise style-code match to a same-run coincidence.

