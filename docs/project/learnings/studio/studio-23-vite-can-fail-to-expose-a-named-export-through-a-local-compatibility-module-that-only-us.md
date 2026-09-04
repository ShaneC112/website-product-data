# Studio learning 23: Vite can fail to expose a named export through a local compatibility module that only us

- **ID:** `studio-23-vite-can-fail-to-expose-a-named-export-through-a-local-compatibility-module-that-only-us`
- **Applies to:** `website-product-enrichment-sanity-studio`
- **Status:** Canonical learning detail.

## Learning

- Vite can fail to expose a named export through a local compatibility module that only uses `export *` from a `file:` dependency, even when the dependency runtime artifact contains that export. Use explicit value and type re-exports for Studio APIs imported by schemas, then restart `sanity dev` to clear the failed ESM module cache after shared-package changes.
