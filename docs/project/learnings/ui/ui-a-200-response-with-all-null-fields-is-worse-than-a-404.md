# A 200 response with all-null fields is worse than a 404

- **ID:** `ui-a-200-response-with-all-null-fields-is-worse-than-a-404`
- **Applies to:** `website-product-enrichment-ui`
- **Status:** Canonical learning detail.

## Learning

## A 200 response with all-null fields is worse than a 404

`server/api/crawl/variant-swatches/preview.get.ts` returned `{ contentType: null,
blobPath: null, base64: null }` (HTTP 200) whenever a swatch row had no
blob-backed preview - which is the *normal* case for every `selector`/`ai`/
`primary_fallback` swatch, since those are live vendor image URLs that are never
downloaded into blob storage (only `operator_upload` swatches get a blob path).
`SwatchReviewDrawer.vue`'s `$fetch<BlobPreviewPayload>` call trusted the declared
(non-nullable) `BlobPreviewPayload` type, so it never hit its `catch` fallback to
`item.selectedSwatchUrl` - it just built `data:null;base64,null` and rendered a
permanently broken image for every "found" swatch that wasn't an operator upload,
which was the entire Best Wool pipeline.

**Fix:** the route now throws a 404 in both "no blob path" and "blob path set but
blob download came back empty" cases, matching the sibling
`group-pdfs/preview.get.ts` route (which already did this correctly - it was the
reference/correct pattern, not the bug). This lets the frontend's existing
try/catch fallback do its job.

**Lesson:** when an endpoint's declared success type has non-nullable fields,
never return a 200 with those fields set to `null` "just in case" - either satisfy
the type for real or throw, so callers that trust the type signature can't
silently render/consume garbage. When you find this kind of bug in one of several
near-identical sibling routes (drawer preview endpoints, in this case), check the
others too - they're prone to the exact same divergence.

