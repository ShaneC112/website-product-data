# Active vendor modules should replace compatibility no-ops completely

- **ID:** `render-active-vendor-modules-should-replace-compatibility-no-ops-completely`
- **Applies to:** `website-product-enrichment-render`
- **Status:** Canonical learning detail.

## Learning

## Active vendor modules should replace compatibility no-ops completely

Crucial Trading, J2 Flooring, Unnatural Flooring, and Wood Innovations had no-op entries in the legacy HTML patch registry after active manifest modules became the behavior owners.

**Fix:** remove the no-op files and host mappings when registering the active module in `src/vendors/index.ts` and dispatching its manifest builder from `src/renderPage.ts`.

**Best practice:** one vendor behavior should have one runtime owner. Keep focused parser tests plus a resolver assertion, and emit concise manifest traces for variant, swatch, specification, and document counts.

