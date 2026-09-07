# V2 imagery intent must preserve selected variant identity and never write to Azure from the browser

- **ID:** `studio-v2-imagery-intent-must-preserve-selected-variant-identity-and-never-write-to-azure-from-the-browser`
- **Applies to:** `website-product-enrichment-sanity-studio`
- **Status:** Canonical learning detail.

## Learning

V2 imagery requests persist the editor's selected Sanity array-item `_key` as `variantKey` in the
request intent. The authoritative identity is `productId + variantKey`; it must not be replaced by
the business `variantId`, a display label, inferred from a different variant, or reconstructed in
a browser-to-Azure payload.

The failure mode behind this rule is easy to miss: live product, template, and request documents
can contain a human-readable colour label in `variantId`. Persist then constructs invalid media
identity or patches the wrong conceptual variant even though the operator selected the correct
array item. `colourName` is display-only metadata, and Azure must resolve and patch the selected
product variant directly by `_key`.

Studio writes the pending request or guarded-control intent to Sanity. Its Blueprint handler
rereads that document, validates the Data-owned schema, and sends only the immutable submission
reference to the dedicated queue with server-only credentials. The removed
`/api/image-generation-v2/enqueue` and `/api/image-generation-v2/control` write routes are not
fallbacks. The only remaining v2 HTTP status route is read-only.

Keep this path distinct from older Studio image-generation actions: the v2 reference is an ingress
notification, while Azure rereads the authoritative intent and owns execution and result
projection.