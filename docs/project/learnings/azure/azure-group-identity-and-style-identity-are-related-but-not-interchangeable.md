# Group identity and style identity are related, but not interchangeable

- **ID:** `azure-group-identity-and-style-identity-are-related-but-not-interchangeable`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## Group identity and style identity are related, but not interchangeable

`SpecifiedUrls` uses a source-record group key such as `m2crmproducts:synthetic-vendor-run` because no real range URL owns the group. The first implementation also wrote that key into `styleCodeRaw`, which made durable group state lose the actual synthetic or m2crm style code even though page and detail rows retained it.

**Fix:** keep `sourceGroupKey` as the partition/group identity, but persist the request's original `styleCodeRaw` and derived `styleCodeStorageKey`. Log total, enqueued, and reused URL counts at dispatch, and test all three identities independently.

