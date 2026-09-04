# A "no data" fallback can mask a real bug for a long time

- **ID:** `ui-a-no-data-fallback-can-mask-a-real-bug-for-a-long-time`
- **Applies to:** `website-product-enrichment-ui`
- **Status:** Canonical learning detail.

## Learning

## A "no data" fallback can mask a real bug for a long time

Because the blob-read bug above failed silently (empty data, not an error), and the
UI had a plausible-looking fallback (compact summary data) that partially populated
the drawer, this bug likely shipped and went unnoticed for a while. The lesson:
when a "return null / fall back to defaults" path exists for a data source, it's
worth periodically verifying that path is only taken when data is *genuinely*
absent, not whenever the read itself is broken. Added a dedicated
`test/nuxt/blob-client.test.ts` covering the Node.js stream path explicitly, plus
distinguishing "blob genuinely missing" (404, log + return null) from "download
actually failed" (log + rethrow) in `downloadBlobBuffer`, so an unexpected failure
now surfaces as a real error instead of being indistinguishable from "no data yet".

