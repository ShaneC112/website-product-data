# Review corrections: source ownership and per-SKU pack data

- **ID:** `data-review-corrections-source-ownership-and-per-sku-pack-data`
- **Applies to:** `website-product-data`
- **Status:** Canonical learning detail.

## Learning

## Review corrections: source ownership and per-SKU pack data

Product-level `widths` must be included in `SOURCE_MANAGED_FIELDS`; otherwise re-import starts from
the existing document and silently ignores changed source widths. Pack requirements belong in the
bridge gate as well as the Studio gate, because missing crawl-owned pack data cannot be repaired by
an editor. For source rows that share one URL, `packInfoHintJson` must remain attached to each URL
link/product-detail row and flow through the approved variant override, just like price and width.

**Best practice:** test shared-URL products with distinct source-row pack hints, not only distinct prices.
