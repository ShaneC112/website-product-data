# Provider image adapters must bound errors and validate output

- **ID:** `azure-provider-image-adapters-must-bound-errors-and-validate-output`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

Provider adapters are a trust boundary. They should log stable, bounded reason codes with operation context, not forward arbitrary provider response messages into structured logs. They must validate the returned image payload before staging it and leave retry policy to the durable workflow layer rather than retrying invisibly inside the adapter.

## Prevention

- Use the shared child logger with operation identity and transport context.
- Log stable error categories such as `provider-http-error`, not arbitrary provider message text.
- Convert malformed successful responses into an explicit provider-output validation error.
- Keep transport failures observable and let the orchestration/recovery layer decide whether they are retryable or terminal.
- Cover success, non-2xx response, malformed output, and transport failure with focused adapter tests.
