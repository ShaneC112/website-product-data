# Studio learning 30: The Studio's Vite-prebundled `@sanity/icons` module exposes the generic `Icon` component

- **ID:** `studio-30-the-studio-s-vite-prebundled-sanity-icons-module-exposes-the-generic-icon-component`
- **Applies to:** `website-product-enrichment-sanity-studio`
- **Status:** Canonical learning detail.

## Learning

- The Studio's Vite-prebundled `@sanity/icons` module exposes the generic `Icon` component and `icons` registry, not every named icon export from the installed package. A document action using a named `ImageIcon` can typecheck yet fail at runtime with a missing-export error. Wrap `<Icon symbol="images" />` in a no-props component for the action's `icon` slot, verify it in the running Studio, and target the rendered action's exact `data-testid` when adding scoped menu styling.
