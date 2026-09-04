# New write-proxy routes must adopt the existing `createServerLogger` convention on the first pass

- **ID:** `ui-new-write-proxy-routes-must-adopt-the-existing-createserverlogger-convention-on-the-first-pass`
- **Applies to:** `website-product-enrichment-ui`
- **Status:** Canonical learning detail.

## Learning

## New write-proxy routes must adopt the existing `createServerLogger` convention on the first pass

`server/api/crawl/reprocess-group.post.ts`, `publish-preflight.post.ts`, and `enqueue.post.ts`
already log a `warn` on schema-validation failure and an `info` before forwarding to Azure's write
API. The first draft of `server/api/sanity/registry-sync.post.ts` (proxying the new Sanity registry
sync Function) skipped both, even though `apply: true` is the mutating case worth an audit trail.

**Best practice:** grep sibling `*.post.ts` routes under `server/api/` before adding a new one -
`postToAzureWriteApi` + `createServerLogger` is the expected shape for any route that forwards a
write/apply-style request, not just the ones that happen to already have it.

