# Studio learning 13: Keep source money in integer cents, but transform it to decimal EUR for the Studio.

- **ID:** `studio-13-keep-source-money-in-integer-cents-but-transform-it-to-decimal-eur-for-the-studio`
- **Applies to:** `website-product-enrichment-sanity-studio`
- **Status:** Canonical learning detail.

## Learning

- Keep source money in integer cents, but transform it to decimal EUR for the Studio. For the Irish VAT rule, calculate and round in cents with `Math.round(exVatMinor * 1.23)`, then divide by 100 before writing the Sanity price fields.
