# `response.blobBody` is a browser-only field - it is always `undefined` on Node.js

- **ID:** `ui-response-blobbody-is-a-browser-only-field-it-is-always-undefined-on-node-js`
- **Applies to:** `website-product-enrichment-ui`
- **Status:** Canonical learning detail.

## Learning

## `response.blobBody` is a browser-only field - it is always `undefined` on Node.js

The most significant bug found this session: `server/shared/blobClient.ts` and
`server/api/crawl/product-detail/[sourceGroupKey].get.ts` both read blob content via
`await response.blobBody` from `@azure/storage-blob`'s `download()`. That field only
exists in the SDK's browser build - on Node.js (which is what a Nuxt Nitro server
runs on, even in "the browser calls this API" contexts) the download response only
ever populates `readableStreamBody` (a Node stream that has to be buffered
manually). This meant every blob read in this repo had been silently returning
`null` in production, with no error and no log - the AI review drawer's "Field
confidence", "Readiness and evidence", and "Widths" sections were empty for every
single group, and nobody had noticed because the compact table-row fallback data
(styleCode/rangeName/trade) still populated most of the visible drawer fields.

**How it was found:** only surfaced by chance, while manually re-verifying a live
E2E pipeline run end-to-end and cross-checking the UI against raw table/blob reads
via a Node script - the discrepancy between "the pipeline clearly extracted data"
and "the UI shows nothing" was the tell.

**Fix:** `downloadBlobBuffer` (new helper in `blobClient.ts`) uses
`response.readableStreamBody` and buffers it manually; `downloadBlobBase64` and the
new `downloadBlobJson` are built on top of it. The product-detail route was
refactored to use this shared helper instead of duplicating its own (also broken)
`BlobServiceClient` call.

**Best practice:** when writing *any* Azure Blob download code that runs in a
Node.js server context (Nitro, Azure Functions, a plain Node script), always use
`readableStreamBody`, never `blobBody`. If you see `blobBody` in a diff or existing
code for a server-side (non-browser) code path, it's almost certainly a bug.

