# Sanity image v2 helper diagnostics need caller-scoped Pino context, not console callbacks

- **ID:** `azure-sanity-image-v2-helper-diagnostics-need-caller-scoped-pino-context-not-console-callbacks`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

The image-generation v2 prompt-feature and run-content helpers accept small diagnostic callback hooks, but the callback is not a license to bypass the Azure logging policy. Passing `(message) => console.warn(message)` from generate or assemble workers loses the request/run/module context that operators need, and it promotes ordinary helper diagnostics into production warning noise.

**Fix:** create the Pino child logger at the request- or stage-owned boundary, then adapt helper callbacks to that logger. Use `debug` for routine feature diagnostics, reserve `warn` for degraded-but-continuing policy or data issues, and keep durable lifecycle state changes at `info`, `warn`, or `error` according to the canonical Azure logging policy.

**Best practice:** shared helpers should receive caller-owned logging context rather than creating root loggers or receiving console callbacks. When a helper callback only reports local diagnostics, make the adapter preserve inherited `module`, `requestId`, and `runId` context and classify the event level before passing the helper message through.