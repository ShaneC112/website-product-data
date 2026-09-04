# Compose range fields from range evidence, even when the vendor hides the document on variants

- **ID:** `render-compose-range-fields-from-range-evidence-even-when-the-vendor-hides-the-document-on-variants`
- **Applies to:** `website-product-enrichment-render`
- **Status:** Canonical learning detail.

## Learning

## Compose range fields from range evidence, even when the vendor hides the document on variants

Quick-Step's Capture range page has no technical-document link, while every variant PDP exposes
the same technical PDF through `pdp-spec-doc-item`. The Azure product detail is composed from the
range extraction, so capturing the PDF only when rendering variants cannot fill range-owned fields
such as thickness.

