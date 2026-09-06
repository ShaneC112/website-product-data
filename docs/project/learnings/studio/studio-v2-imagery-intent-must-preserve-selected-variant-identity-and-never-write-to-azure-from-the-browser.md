# V2 imagery intent must preserve selected variant identity and never write to Azure from the browser

- **ID:** `studio-v2-imagery-intent-must-preserve-selected-variant-identity-and-never-write-to-azure-from-the-browser`
- **Applies to:** `website-product-enrichment-sanity-studio`
- **Status:** Canonical learning detail.

## Learning

V2 imagery requests persist the editor's selected `variantId` in the request intent. The selection
must remain an identity reference to the template's bound variant; it must not be replaced by a
display label, inferred from a different variant, or reconstructed in a browser-to-Azure payload.

Studio writes the pending request or guarded-control intent to Sanity. Its Blueprint handler
rereads that document, validates the Data-owned schema, and sends only the immutable submission
reference to the dedicated queue with server-only credentials. The removed
`/api/image-generation-v2/enqueue` and `/api/image-generation-v2/control` write routes are not
fallbacks. The only remaining v2 HTTP status route is read-only.

Keep this path distinct from older Studio image-generation actions: the v2 reference is an ingress
notification, while Azure rereads the authoritative intent and owns execution and result
projection.