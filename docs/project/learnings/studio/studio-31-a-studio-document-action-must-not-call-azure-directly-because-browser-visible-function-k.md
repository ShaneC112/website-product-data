# Studio learning 31: A Studio document action must not call Azure directly because browser-visible Function k

- **ID:** `studio-31-a-studio-document-action-must-not-call-azure-directly-because-browser-visible-function-k`
- **Applies to:** `website-product-enrichment-sanity-studio`
- **Status:** Canonical learning detail.

## Learning

- A Studio document action must not call Azure directly because browser-visible Function keys or Storage credentials are unacceptable. The requeue action writes a minimal, shared-Zod-validated request to the product; a Blueprint event handler forwards only the canonical document ID and request ID to the `sanity-actions` queue using server-only `AZURE_SANITY_ACTIONS_QUEUE_URL` and an add-only `AZURE_QUEUE_SAS_TOKEN`. A successful destructive rebuild removes that document, so the handler must not attempt its normal terminal status patch after Azure accepts the request; log the terminal outcome instead.
