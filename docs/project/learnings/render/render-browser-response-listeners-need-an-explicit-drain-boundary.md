# Browser response listeners need an explicit drain boundary

- **ID:** `render-browser-response-listeners-need-an-explicit-drain-boundary`
- **Applies to:** `website-product-enrichment-render`
- **Status:** Canonical learning detail.

## Learning

## Browser response listeners need an explicit drain boundary

Playwright does not await promises returned by `page.on('response', ...)`. Best Wool starts its
network evidence listener before navigation and keeps it active through popup traversal, so reading
the collected array immediately could race with an in-flight `response.text()` call.

**Best practice:** track pending response work, detach and drain the listener before assembling
vendor state, and log aggregate evidence counts on completion. Build into a freshly cleaned `dist`
directory as well: TypeScript does not remove outputs for deleted source files, while Docker copies
the entire directory into the production image.

