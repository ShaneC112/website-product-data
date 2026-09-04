# Vendor image semantics must come from the live page, not filenames

- **ID:** `render-vendor-image-semantics-must-come-from-the-live-page-not-filenames`
- **Applies to:** `website-product-enrichment-render`
- **Status:** Canonical learning detail.

## Learning

## Vendor image semantics must come from the live page, not filenames

Unnatural Flooring's Copenhagen variant pages use a two-image Fancybox gallery whose second item was verified as the required swatch across the full 20-variant live run. Synthetic fixture filenames containing words such as `lifestyle` made that positional rule look suspicious, but filename vocabulary is not a stable vendor contract.

**Solution:** keep the live-validated gallery rule isolated in the Unnatural module, describe it accurately in tests and metadata, and document that a future gallery-order change requires whole-range revalidation.

**Best practice:** prefer observed DOM position or scoped container semantics over filename-token guesses. When the vendor rule is positional, keep it vendor-specific and record the evidence that justified it.

