# Studio learning 16: The `request-room-images` Blueprint Function (`@sanity/functions` `documentEventHandler`

- **ID:** `studio-16-the-request-room-images-blueprint-function-sanity-functions-documenteventhandler`
- **Applies to:** `website-product-enrichment-sanity-studio`
- **Status:** Canonical learning detail.

## Learning

- The `request-room-images` Blueprint Function (`@sanity/functions` `documentEventHandler`) had no logging at all on its first pass, even though it is the one place that decides whether a room-image request gets queued or marked failed - it only wrote state back onto the Sanity document. Added start/success/failure `console.log`/`console.error` lines tagged with document ID, `requestId`, and phase, and a corresponding test that invokes the exported `handler` directly (it is a plain async function - `documentEventHandler` returns it unmodified, so no Sanity runtime is needed to unit test it) with mocked `@sanity/client` and queue transport.
