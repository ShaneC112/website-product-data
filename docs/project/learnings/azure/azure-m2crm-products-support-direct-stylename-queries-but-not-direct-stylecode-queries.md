# M2CRM products support direct `styleName` queries, but not direct `styleCode` queries

## ID

`azure-m2crm-products-support-direct-stylename-queries-but-not-direct-stylecode-queries`

## Applies to

- `website-product-enrichment-azure`
- M2CRM inspection scripts and style-code import investigations

## What happened

During live investigation of style-code import behavior on 2026-09-05, we verified that `GET /crm-api/api/products` accepts direct `styleName=...` query params but ignored direct `styleCode=...` params. The same session also tested several `filter=` forms for `styleName`, and those returned zero rows.

Verified example:

- `styleName=10mm AC4 Aqua / Laminate` returned one product: `Alkum Oak Aqua 10mm 4V (32) KT803 (5100430)`
- That product carried `styleCode: CANADIA10MMAC4AQUA/1.53`
- `styleCode=CANADIA10MMAC4AQUA/1.53` and `StyleCode=CANADIA10MMAC4AQUA/1.53` returned the unfiltered first page instead of the matching product

## Why it matters

It is easy to assume the products endpoint supports symmetric field filters for both `styleName` and `styleCode`, or that the generic `filter=` parameter is the right abstraction. That assumption is wrong for the live endpoint we use. If we switch style-code import to a server-side `styleCode` query without re-verifying the endpoint, we will silently broaden the result set and enqueue the wrong products.

## Correct pattern

- Use direct `styleName=...` query params for narrow live inspection when you already know the style name.
- Treat `search=...` as a broad discovery tool, not a field-specific filter.
- Do not rely on direct `styleCode=...` query params for correctness.
- Keep style-code import on the current full-scan-plus-client-filter path until M2CRM exposes a reliable server-side style-code filter and we validate it against live data.

## Prevention

- When documenting or debugging M2CRM product lookups, include one concrete live example rather than describing the endpoint generically.
- Before changing the style-code import lookup strategy, re-run a live probe against `/crm-api/api/products` and confirm the exact query shape still returns only the intended product.
- Keep the Azure runbook example aligned with the last verified live query.

## References

- Azure runbook: `website-product-enrichment-azure/scripts/m2crm-inspection-and-snapshots.md`
- Azure script index: `website-product-enrichment-azure/scripts/README.md`
- Lookup implementation: `website-product-enrichment-azure/src/stores/m2crmCrawlSource.ts`