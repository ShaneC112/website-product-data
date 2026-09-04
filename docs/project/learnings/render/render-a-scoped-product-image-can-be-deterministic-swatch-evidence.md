# A scoped product image can be deterministic swatch evidence

- **ID:** `render-a-scoped-product-image-can-be-deterministic-swatch-evidence`
- **Applies to:** `website-product-enrichment-render`
- **Status:** Canonical learning detail.

## Learning

## A scoped product image can be deterministic swatch evidence

Fibre Flooring’s product image is not a generic gallery fallback: the image inside
`.singleProductContainer .productimg` is the product’s displayed colour swatch. The manifest therefore emits
it in `swatchImageUrls` and prefers lazy-loaded `data-src` over fallback `src`.

**Best practice:** when a vendor identifies a precise container as its colour representation, capture that
scoped asset explicitly rather than relying on generic primary-image fallback and operator review.

