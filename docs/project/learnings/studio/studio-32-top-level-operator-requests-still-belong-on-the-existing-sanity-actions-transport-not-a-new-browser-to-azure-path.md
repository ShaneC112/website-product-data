# Studio learning 32: Top-level operator requests still belong on the existing `sanity-actions` transport, not a new browser-to-Azure path

- **ID:** `studio-32-top-level-operator-requests-still-belong-on-the-existing-sanity-actions-transport-not-a-new-browser-to-azure-path`
- **Applies to:** `website-product-enrichment-sanity-studio`
- **Status:** Canonical learning detail.

## Learning

- Top-level operator requests still belong on the existing `sanity-actions` transport, not a new browser-to-Azure path. The import-by-style-code workflow needed to create products that do not yet exist in Sanity, so it could not reuse the product-local `sanityActionRequests[]` array. Studio creates a top-level `styleCodeImportRequest` document and lets the existing `sanity-actions` Blueprint Function validate and forward it. The browser still only writes Sanity content; it does not call Azure directly. This keeps Azure credentials and queue access out of the browser, preserves one operator-action transport, and lets Azure read the authoritative request document from Sanity instead of trusting a fatter queue payload.

Best practice:

- For new operator actions that need top-level request state, prefer a dedicated Sanity document plus the existing Blueprint queue transport.
- Keep the Studio UI minimal and let the request document carry progress and results.
- Import shared request contracts through `@shane-corrigan/website-product-data/...` exports, then refresh the local `file:` dependency when those exports change.