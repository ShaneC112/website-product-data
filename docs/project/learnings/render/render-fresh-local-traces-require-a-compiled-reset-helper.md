# Fresh local traces require a compiled reset helper

- **ID:** `render-fresh-local-traces-require-a-compiled-reset-helper`
- **Applies to:** `website-product-enrichment-render`
- **Status:** Canonical learning detail.

## Learning

## Fresh local traces require a compiled reset helper

Renderer trace files are intentionally local diagnostics, but stale `.tracing` output can make a
new crawl investigation look like the previous run. `start:fresh` builds first, runs the compiled
trace-reset helper, then starts the queue worker so the helper is available even from a clean
checkout.

**Best practice:** keep reset scripts explicit and opt-in, log only bounded metadata, and use
`POST /queue/drain` only in controlled local runs because it consumes available render work.

