# Studio learning 26: `useToast` is exported as `never` from both the top-level `sanity` and `@sanity/ui` pack

- **ID:** `studio-26-usetoast-is-exported-as-never-from-both-the-top-level-sanity-and-sanity-ui-pack`
- **Applies to:** `website-product-enrichment-sanity-studio`
- **Status:** Canonical learning detail.

## Learning

- `useToast` is exported as `never` from both the top-level `sanity` and `@sanity/ui` packages in this repo's installed versions (sanity 6.12.0, `@sanity/ui` ^4.0.7) - it moved to the `@sanity/ui/toast` subpath. `tsc` reports this as "not callable" on the call site, not as a missing export, which is a confusing signal. Import it as `import {useToast} from '@sanity/ui/toast'`.
