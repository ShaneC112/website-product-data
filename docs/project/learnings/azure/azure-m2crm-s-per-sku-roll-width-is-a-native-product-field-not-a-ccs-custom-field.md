# m2crm's per-SKU roll width is a native product field, not a CCS custom field

- **ID:** `azure-m2crm-s-per-sku-roll-width-is-a-native-product-field-not-a-ccs-custom-field`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## m2crm's per-SKU roll width is a native product field, not a CCS custom field

Before wiring `rawWidthHint` (Phase 02a), a live `query-m2crm-custom-fields.ts --definitions` probe
found no `width`-named entry among Product custom field definitions - only `pile_weight`,
`construction`, `tog_rating`, etc. A `query-m2crm-products.ts --json` probe against real Victoria
Carpets rows showed the answer lives on the product record's own native `width` field (a
feet-inches string, e.g. `"13'1\""` on the `/400` SKU vs `"16'5\""` on the `/500` SKU of the same
range) - the same generic field Ops-Hub's CRM schema uses for wood plank dimensions elsewhere, but
genuinely representing carpet roll width here.

**Best practice:** never assume a generic, reused API field name means the same thing across
trades/vendors without a live raw-data probe - a field can be a custom field in one schema and a
native field in another, and the same native field name can carry different physical meaning per
trade.

