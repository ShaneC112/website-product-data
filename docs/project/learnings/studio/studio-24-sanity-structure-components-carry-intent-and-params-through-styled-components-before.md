# Studio learning 24: Sanity structure components carry `intent` and `params` through styled-components before

- **ID:** `studio-24-sanity-structure-components-carry-intent-and-params-through-styled-components-before`
- **Applies to:** `website-product-enrichment-sanity-studio`
- **Status:** Canonical learning detail.

## Learning

- Sanity structure components carry `intent` and `params` through styled-components before `IntentLink` consumes them. A global `shouldForwardProp` filter that removes those props breaks route encoding. At the Studio layout boundary, filter them only when `target` is a DOM tag (`typeof target === 'string'`), preserving them for React components while preventing the styled-components unknown-prop warnings.
