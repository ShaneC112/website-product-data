# HTTP-triggered write endpoints need the same warn/log/try-catch shape as their siblings

- **ID:** `azure-http-triggered-write-endpoints-need-the-same-warn-log-try-catch-shape-as-their-siblings`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## HTTP-triggered write endpoints need the same warn/log/try-catch shape as their siblings

The first draft of `sanityRegistrySync` (a Function-authenticated `POST` endpoint that previews or
applies the shared field-registry projection into Sanity) validated its body but never logged the
rejection, never logged the dry-run preview, and called the Sanity client with no `try`/`catch` -
any network or auth failure would surface as an unhandled 500 with no function-log context.

**Fix:** matched the existing sibling shape used by `reprocessGroup`/`publishPreflight`/`getGroupPdfPreview`:
`context.warn` on schema-validation failure, `context.log` on both the dry-run preview and the
applied outcome, and a `try`/`catch` around every external Sanity call that returns a `500` with
`context.error`.

**Best practice:** when adding a new HTTP-triggered Function, diff it against 2-3 existing
functions in the same folder before considering it done - a missing log line or `try`/`catch` will
not fail a build or a happy-path test, only a live incident.

