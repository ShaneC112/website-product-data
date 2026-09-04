# A shared derivation helper needs telemetry at every call site, not just the one that got it first

- **ID:** `azure-a-shared-derivation-helper-needs-telemetry-at-every-call-site-not-just-the-one-that-got-it-first`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## A shared derivation helper needs telemetry at every call site, not just the one that got it first

`deriveSwatchHex` (samples a downloaded swatch image with `sharp` to compute a
representative hex colour) is called from three places -
`crawlImageClassifyWorker.ts`, `crawlExtractBatchWorker.ts`, and
`crawlTransformWorker.ts` - but only `crawlImageClassifyWorker.ts` emitted a
`tracePipelineEvent` recording whether derivation actually succeeded. The other
two silently called it with no observability, even though the function itself
swallows every failure (network, fetch-not-ok, `sharp` decode error) and returns
`undefined` with no error surfaced anywhere.

**Fix:** added a matching `swatch_hex_derived` `tracePipelineEvent` (with
`swatchHexDerived: boolean`) at the other two call sites, plus a batch-worker
test covering the derive-and-persist path (previously untested).

**Best practice:** when a helper function intentionally swallows its own errors
(by design, to keep a non-critical enrichment step from failing the pipeline),
every call site must independently emit success/failure telemetry - the
function itself has no context (urlKey/runId/sourceGroupKey) to log with, and a
silently-swallowed failure with no telemetry anywhere is invisible in production.

