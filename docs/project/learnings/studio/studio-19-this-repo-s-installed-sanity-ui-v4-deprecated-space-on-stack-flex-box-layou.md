# Studio learning 19: This repo's installed `@sanity/ui` (v4) deprecated `space` on `Stack`/`Flex`/`Box` layou

- **ID:** `studio-19-this-repo-s-installed-sanity-ui-v4-deprecated-space-on-stack-flex-box-layou`
- **Applies to:** `website-product-enrichment-sanity-studio`
- **Status:** Canonical learning detail.

## Learning

- This repo's installed `@sanity/ui` (v4) deprecated `space` on `Stack`/`Flex`/`Box` layout components in favour of `gap` (`space?: never` in its types) - passing `space={n}` fails typecheck with a confusing "Type 'number' is not assignable to type 'undefined'" rather than a missing-prop error. Use `gap` on any new layout component.
