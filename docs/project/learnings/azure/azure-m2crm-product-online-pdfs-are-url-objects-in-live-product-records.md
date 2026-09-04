# M2CRM product-online PDFs are URL objects in live product records

- **ID:** `azure-m2crm-product-online-pdfs-are-url-objects-in-live-product-records`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## M2CRM product-online PDFs are URL objects in live product records

The live Burford Twist record stores `properties.product_online_pdf` as `{title, url}`, not as the
string assumed by the first snapshot payload mapping. That silently omitted the PDF from the render
request even though every later queue and extraction contract already supported `productOnlinePdfUrl`.

**Fix:** normalize either an M2CRM URL object or a direct string through a pure helper, then validate
the resulting URL with the shared manual enqueue schema. The snapshot remains read-only and records
malformed URLs in its existing `skipped` output.

**Best practice:** add a focused shape test whenever a vendor custom field crosses a queue boundary;
test actual API object shapes as well as convenient scalar fixtures.

