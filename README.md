# website-product-data

## Intent

`website-product-data` is the shared data-contract library for the website product
enrichment system. It exists to provide one authoritative definition of the data
structures and helpers that cross repository boundaries: Azure Table entity schemas,
blob artefact schemas, queue message contracts, the shared product and variant field
registry, storage key builders, and write-request payload contracts. The Azure
orchestrator and the Nuxt UI import these definitions instead of redefining them
locally, so writers and readers never drift. This package contains no workflow logic,
no browser automation, and no framework-specific runtime code.

Private shared storage-contract repo for the website product enrichment system.

Purpose:
- centralize Azure Table, Blob, and Queue contract definitions
- centralize storage key builders used across repos
- centralize write request payload contracts used by Nuxt and Azure-owned write paths
- reduce drift between Azure writers and Nuxt readers

Current scope:
- storage table names
- storage container names
- storage queue names
- Azure Table entity types
- shared key helpers such as `encodeStorageKey`, `buildCanonicalSourceRowKey`, and `buildCanonicalVariantKey`
- shared write request schemas for Nuxt server routes and related callers

Current consumers:
- `website-product-enrichment-ui`
- `website-product-enrichment-azure`

Non-goals for the first cut:
- no public npm publishing
- no APISync integration yet
- no framework-specific runtime wrappers

Local integration pattern:
- add a file dependency: `"@shane-corrigan/website-product-data": "file:../website-product-data"`
- build this repo before consumers that require the emitted `dist/` output
- the Azure Functions repo currently imports built `dist/` subpaths directly for compatibility with its current TypeScript module resolution

Exports:
- `@shane-corrigan/website-product-data/registry`
- `@shane-corrigan/website-product-data/requests`
- `@shane-corrigan/website-product-data/requests/contracts`
- `@shane-corrigan/website-product-data/storage`
- `@shane-corrigan/website-product-data/storage/constants`
- `@shane-corrigan/website-product-data/storage/keys`

Decisions:
- The private shared package is the single source of truth for shared storage contracts and shared write request payload contracts.
- Nuxt write routes import request schemas from this package instead of duplicating them locally.
- Azure write functions should import the same shared request schemas wherever the payload contract matches.
- Page-local client validation that is only used by one page should be inlined in that page rather than kept in a shared UI schema file.
- APISyncAzure remains out of scope for this package.

Current request-contract adoption:
- `publishPreflight` is shared between Nuxt and Azure.
- `matchingLedgerApproval` is shared between Nuxt and Azure.
- `manualCrawlEnqueue` is shared between Nuxt and Azure using the Azure-owned payload shape.

## Storage and messaging reference

Canonical key helpers now shipped in this package:

- `encodeStorageKey` / `decodeStorageKey`: reversible Azure Table-safe business keys
- `normaliseVariantToken` and `normaliseWidth`: canonical colour/design and width normalization
- `buildStyleCodeStorageKey`: styleCode-first group storage key
- `buildCanonicalSourceRowKey`: canonical source identity from `m2crmUuid`
- `buildCanonicalVariantKey`: colour/design-first variant identity with width appended only when it distinguishes a true colour/design variant

Queue contracts now include canonical identity pass-through fields on render jobs (`styleCodeRaw`, `styleCodeStorageKey`, `m2crmUuid`, `sourceGroupKey`) and the shared `renderCompleteSchema` for `crawl-render-complete`.

The durable extraction-batch ledger also stores the originating optional `runId`. Consumers use it to distinguish a retry within one run from a later run reusing the same group and URL, so stale succeeded rows can be reset without duplicating work inside a run.

`crawlRequestMessageSchema`, `manualCrawlEnqueueSchema`, and `renderRequestSchema` also carry an optional
`productOnlinePdfUrl` field for curated upstream PDF evidence. This is intentionally a contract-level
pass-through: the sync/manual enqueue path can preserve a known vendor PDF URL even when the rendered page
does not link to it, and downstream render/extraction stages can hand the original PDF to the multimodal
model instead of trying to rediscover or reconstruct it from HTML.

`crawlRequestMessageSchema` and `manualCrawlEnqueueSchema` support `crawlType: 'SpecifiedUrls'` for
source-authoritative variant membership. Such requests require `specifiedUrls`, an HTTPS URL array. Azure
canonicalizes and deduplicates that list, then crawls each member directly as a variant under a source-record
group; ordinary `Range` and `Single` requests retain their existing single-URL semantics.

`renderCompleteSchema` is intentionally not minimal. It requires `url` and `blobPaths`
(the real render evidence) and also carries `pageRole`, `sourceTableName`,
`styleCode`, `styleCodeRaw`, `styleCodeStorageKey`, `m2crmUuid`, `trade`, and
`sourceGroupKey` — the same identity fields present on the render job. This is
because `website-product-enrichment-azure`'s `renderDispatchWorker` may be creating
the `webcrawlpages` row for a `urlKey` for the first time (true for every discovered
variant page), so there is no fallback source for these fields other than this
message. Trimming this schema back to "just status and a content hash" reintroduces
a real bug found via live E2E testing: pages silently lost their `url`, `pageRole`,
and `sourceGroupKey`, corrupting downstream transform/publish. See
[plan/render-update/06-live-e2e-payloads.md](/workspaces/project-container/plan/render-update/06-live-e2e-payloads.md#findings-from-the-first-live-run--read-before-touching-render-complete-or-dispatcher-code)
for the full writeup. If a new field is added to the render job contract that Azure
needs after completion, add it here too.

`compactVendorProductPageSchema` (part of `productDetailSummarySchema` in
`storage/product-detail.schema.ts`) intentionally does **not** carry the full
`widths` array — only a `widthCount`. Azure Table Storage rejects any single
property over 64KB, and vendor-supplied `widths`/extracted field text is unbounded
(a live E2E run hit this with a vendor page whose width parser scraped ~38K
characters of CSS text as bogus "width" values). The full-fidelity detail always
lives in the `composed-detail.json` blob; this compact schema is index/preview data
only, so any new field added here should be a count, enum, or short id — never
unbounded vendor text. Because this schema is shared across repos (at minimum
`website-product-enrichment-azure` and `website-product-enrichment-ui` both parse
`webcrawlproductdetail` rows through it), changing it requires rebuilding this
package *and* restarting every consuming repo's process — a `file:` dependency
consumer can be holding a stale on-disk copy and/or a stale in-memory module even
after this package's `dist` is rebuilt. See
[plan/render-update/06-live-e2e-payloads.md](/workspaces/project-container/plan/render-update/06-live-e2e-payloads.md#findings-from-the-first-live-run--read-before-touching-render-complete-or-dispatcher-code)
(Pitfall 6) for the full trace.

This section is the canonical reference for shared Azure Tables, queues, and blob artefacts used by the website product enrichment pipeline.

**Update:** the underlying width-parsing bug referenced above (a vendor page's
extracted `width` text turning into thousands of bogus entries) was later fixed at
the source, not just capped. The `width` registry field
(`src/registry/field-registry.ts`, Carpet trade) is now `valueType: 'measurement-list'`
— an array of `{ value: number, unit: string }` — instead of free text. Downstream,
`website-product-enrichment-azure`'s `buildWidthSlots` now maps this array directly
into `vendorProductPage.widths` instead of splitting a raw string on `-`/`/`/" to ",
so a bad extraction can no longer fan out into dozens of garbage width entries. Any
new `measurement-list` registry field should follow the same pattern: keep the raw
`fields[]` value as an array of `{ value, unit }` objects (do not stringify it),
since `extracted.fields` is surfaced directly to operators as the "final AI pass"
output in the AI review UI.

**Update:** `renderResponseSchema`/`renderCompleteSchema`'s `blobPaths` and
`crawlPageTableSchema` all gained an optional `visibleText`/`blobVisibleTextPath`
field. This carries render's already-computed, hidden-aware, tag-free rendering of
the page's visible text through to Azure, which prefers it over a fixed-size raw
HTML excerpt for the AI extraction input (see
`website-product-enrichment-azure/README.md`'s AI-extraction pitfalls for why).

**Update:** a field registry `exampleValue` is prompt guidance shown to the model as
a format illustration, not real data - but a model can and will copy a
realistic-looking example verbatim when it is uncertain of the real value. This
happened with the `width` field's original example (`[{"value":400,"unit":"cm"}]`),
which the AI returned unmodified for a page whose real width was "4 m". Any new
`exampleValue` for a numeric/structured field should use an unmistakable placeholder
(e.g. `<the number found on the page>` rather than a plausible real number) so that
even a model that ignores the "never copy an example" instruction in the consuming
repo's system prompt produces an obviously-invalid value that downstream structural
validation rejects, instead of a silently-wrong one.

**Update:** the Carpet registry now includes optional named fields for `togRating`,
`suitability`, and `warranty` as specifications, plus `areaRoom` as an additional
named field. These were promoted from catch-all evidence because they recur on
vendor pages often enough to deserve stable field names in the extraction contract.
When promoting a catch-all attribute into a named field, update both the shared
registry tests and any consumer fixtures that previously asserted it under
`additionalSpecifications` or `additionalFeatures`.

**Update:** unused blob/batch parser exports were removed from the shared schemas
once all consumers were confirmed to use the schemas/stringifiers directly rather
than the old `parseExtractedDetailBlob`, `parseVendorProductPageBlob`, and
`parseCrawlExtractBatchTable` helpers. Keep the zod schemas as the shared contract
surface; avoid adding one-off parser wrappers unless a real cross-repo consumer
needs them.

### Tables

#### `webcrawlpages`

Intent:
- transient canonical page ledger, one row per canonical URL
- tracks render status, source identity, and blob evidence paths

Key strategy:
- `partitionKey = urlKey`
- `rowKey = urlKey`

Primary producers:
- crawl request dispatcher
- render result writer in the page store

Primary consumers:
- extract worker
- transform worker
- sweeper and purge flows
- Nuxt read routes

Important fields:
- `url`: canonical page URL used for render and downstream identity
- `urlKey`: hashed canonical URL key used as the page identity
- `sourceTableName`, `sourceRowKey`: source product identity when known
- `styleCode`, `trade`, `sourceGroupKey`: grouping and operator-facing metadata
- `pageRole`: `range`, `variant`, or `single`
- `variantUrlsJson`: discovered variant URLs for range pages
- `linkedProductCount`: number of source products currently linked to this page
- `contentHash`: render content hash used for change detection
- `status`: current page processing state
- `blobHtmlPath`, `blobScreenshotPath`, `blobElementsJsonPath`: render evidence blob paths
- `blobCaptureManifestPath`, `blobVendorStatePath`: structured render artefact paths when available
- `blobVisibleTextPath`: blob path to the hidden-aware, tag-free visible-text rendering, when non-empty
- `visibleTextLength`: compact render telemetry
- `ttlExpiresAt`: transient retention cutoff
- `rawPriceMinor`, `vatRate`, `vendorSku`: source-product pricing identity carried forward for fallback and transform

#### `webcrawlpagedetail`

Intent:
- transient compact extraction summary per page
- points to full extracted payload blobs when needed

Key strategy:
- `partitionKey = urlKey`
- `rowKey = urlKey`

Primary producers:
- extract worker

Primary consumers:
- transform worker
- Nuxt AI review detail route
- purge and sweeper flows

Important fields:
- `urlKey`: page identity
- `sourceGroupKey`: group identity used for readiness aggregation
- `pageRole`: `range`, `variant`, or `single`
- `status`: `draft` or `ready`
- `detailJson`: compact summary payload stored in-table
- `extractedDetailBlobPath`: full extracted detail blob path
- `vendorProductPageBlobPath`: full vendor product page blob path when split out
- `ttlExpiresAt`: transient retention cutoff

#### `webcrawlvariantdetail`

Intent:
- transient compact per-variant summary for publish preflight and review
- points to full variant blobs when needed

Key strategy:
- `partitionKey = sourceGroupStorageKey`
- `rowKey = canonicalVariantKey` using `buildCanonicalVariantKey(...)`
- `parentUrlKey = range page urlKey` for the whole group, even when the row was produced from a variant child page

Primary producers:
- transform worker
- image classify worker (pre-transform classified-image enrichment)

Primary consumers:
- publish worker
- purge and sweeper flows

Important fields:
- `sourceGroupKey`, `sourceGroupStorageKey`: group identity
- `parentUrlKey`: range-page identity used by publish and review joins
- `variantId`, `variantUrl`, `label`: variant identity fields
- `detailJson`: compact variant summary payload
- `detailBlobPath`: full variant blob path
- `ttlExpiresAt`: transient retention cutoff

Local E2E note:
- when validating a new canonical-key or queue-contract change locally, prefer clearing the full
	pipeline state and rerunning from scratch rather than attempting a transient backfill. The Azure
	repo ships `npm run reset:pipeline -- --confirm` for this purpose.

#### `webcrawlgroupstate`

Intent:
- transient readiness summary per source group
- drives operator views such as crawl status and AI review

Key strategy:
- `partitionKey = sourceGroupStorageKey`
- `rowKey = sourceGroupStorageKey`

Primary producers:
- transform worker
- price recompose path in dispatcher

Primary consumers:
- Nuxt crawl status and AI review routes
- publish queue decision logic

Important fields:
- `sourceGroupKey`: logical group identity
- `state`: readiness state such as `draft`, `ready`, `trade_unmapped`, `ai_field_missing`, `swatch_missing`
- `pageCount`: number of page-detail rows in the group
- `detailCount`: number of detail rows contributing to readiness
- `readinessReasonsJson`: serialized readiness reasons used by UI and publish gating
- `ttlExpiresAt`: transient retention cutoff when present

#### `webcrawlproductdetail`

Intent:
- durable composed product output per source product
- publish-facing durable record that survives transient cleanup

Key strategy:
- `partitionKey = sourceGroupStorageKey`
- `rowKey = sourceTableName:sourceRowKey` when url links exist
- fallback legacy row shape may use `rowKey = urlKey`

Primary producers:
- transform worker
- price recompose path in dispatcher

Primary consumers:
- publish worker
- Nuxt AI review routes
- future publish integrations

Important fields:
- `urlKey`: originating canonical page identity
- `sourceGroupKey`, `sourceGroupStorageKey`: group identity
- `sourceTableName`, `sourceRowKey`: source product identity
- `vendorSku`, `rawPriceMinor`, `vatRate`: source-product pricing identity preserved per product row
- `styleCode`, `trade`: operator-facing metadata when available
- `status`: `draft` or `ready`
- `detailJson`: compact composed summary payload stored in-table
- `detailBlobPath`: full composed product detail blob path
- `publishedAt`: durable freshness timestamp used by rerender gating
- `updatedAt`, `createdAt`, `promptVersion`: optional lifecycle metadata when present

#### `webcrawlurllinks`

Intent:
- durable forward fan-out from canonical URL to source products
- preserves many-to-one mapping when multiple source products share one vendor URL

Key strategy:
- `partitionKey = urlStorageKey`
- `rowKey = sourceTableName:sourceRowKey`

Primary producers:
- crawl request dispatcher

Primary consumers:
- transform worker
- dispatcher price recompose path
- Nuxt read routes for canonical source metadata

Important fields:
- `urlKey`, `urlStorageKey`: canonical URL identity
- `sourceGroupKey`, `sourceGroupStorageKey`: group identity
- `sourceTableName`, `sourceRowKey`: source product identity
- `styleCode`, `trade`: operator-facing metadata
- `vendorSku`, `rawPriceMinor`, `vatRate`: source-product pricing identity
- `crawlUrl`: optional original crawl URL when available

#### `webcrawlvalidations`

Intent:
- durable operator-fixable crawl configuration error ledger
- blocks invalid products before render and AI work

Key strategy:
- `partitionKey = sourceTableName`
- `rowKey = sourceRowKey`

Primary producers:
- crawl request dispatcher

Primary consumers:
- Nuxt validations screen
- dispatcher resolution path when a valid request re-fires

Important fields:
- `sourceTableName`, `sourceRowKey`: source product identity
- `sourceGroupKey`: optional group identity when known
- `styleCode`, `trade`, `crawlUrl`: operator-facing context
- `errorsJson`: serialized validation error list
- `firstSeenAt`, `lastSeenAt`: lifecycle timestamps
- `resolvedAt`: set when a later valid request resolves the issue

#### `webcrawlrunsummary`

Intent:
- durable per-run telemetry and stage tracing
- operational read model, not publish payload

Key strategy:
- `partitionKey = runId`
- `rowKey = runId`

Primary producers:
- dispatcher
- extract worker
- transform worker
- publish worker
- failure/finalization helpers

Primary consumers:
- Nuxt crawl status screen
- operational debugging and cost tracing

Important fields:
- `runId`: run identity
- `sourceGroupKey`, `urlKey`, `styleCode`, `sourceTableName`: source context
- `status`: current or final run status
- stage timestamps: `requestedAt`, `renderStartedAt`, `renderCompletedAt`, `extractStartedAt`, `extractCompletedAt`, `transformStartedAt`, `transformCompletedAt`, `publishStartedAt`, `publishCompletedAt`
- `aiCallCount`, `aiTotalTokens`, `aiEstimatedCost`: aggregate AI telemetry
- `warningCount`: compact warning summary

#### `webcrawlmatchledger`

Intent:
- transient or review-oriented matching proposal ledger for publish preflight
- stores proposed variant-to-product matches and operator approval state

Key strategy:
- `partitionKey = sourceGroupStorageKey`
- `rowKey = variantRowKey`

Primary producers:
- publish worker preflight proposal generation
- approval update function mutates approval state

Primary consumers:
- Nuxt variant matching screen
- future publish approval flows

Important fields:
- `sourceGroupKey`, `sourceGroupStorageKey`: group identity
- `parentUrlKey`, `variantRowKey`: parent and variant identity
- `variantId`, `variantUrl`, `variantLabel`, `colourName`, `swatchImageUrl`, `swatchHex`: review context
- `matchedProductRowKey`, `matchedSourceRowKey`, `matchedSourceTableName`: proposed target identity
- `matchMethod`: `exact_url`, `colour_hint`, or `unmatched`
- `matchConfidence`: numeric proposal confidence
- `approvalState`: `pending`, `approved`, `rejected`, or `not_required`
- `proposalSource`: currently `publish_preflight`
- `detailJson`: compact explanation payload for the proposal
- `updatedAt`: last proposal or approval update time
- `ttlExpiresAt`: retention cutoff when used

#### `webcrawlextractbatch`

Intent:
- durable ledger for the batch AI extraction/image-classification aggregation barrier
- tracks every variant-page item pending, batched, or resolved for a `(sourceGroupKey, operation)`
  pair so scale-out and restarts cannot lose or duplicate batch work

Key strategy:
- `partitionKey = sourceGroupKey` (or its storage-safe encoded form)
- `rowKey = \`${operation}:${urlKey}\`` (optionally suffixed with `variantId`)

Primary producers:
- render dispatch worker (diverts variant-page render-completes into the ledger instead of the
  single-item extract queue when batch mode is enabled)
- extract/image-classify workers (diverts variant-page image classification the same way)

Primary consumers:
- the extraction batch coordinator (packs pending items into batches once enough have arrived)
- the extraction batch sweeper (timer; force-flushes stale trailing batches)
- the extraction batch worker (dispatches the batched AI call and updates item status)

Important fields:
- `sourceGroupKey`, `operation`, `urlKey`, `variantId`, `url`, `pageRole`: item identity
- `status`: `pending`, `batched`, `succeeded`, `failed`, or `missing`
- `batchId`: the batch this item was last assigned to, once packed
- `attempt`: whole-batch retry count carried onto every item in that batch
- `estimatedTokens`: used by the packer to size batches against the model's output-token budget
- `firstSeenAt`, `updatedAt`, `ttlExpiresAt`: lifecycle timestamps

### Queues

#### `crawl-requests`

Intent:
- entry queue for crawl requests from sync, manual operator actions, and sweeper recovery

Primary producers:
- sync trigger paths
- manual enqueue HTTP function
- sweeper recovery path

Primary consumer:
- crawl request dispatcher

Message contract:
- `CrawlRequestMessage` from Azure shared contracts
- includes source identity, canonical crawl URL, crawl type, style/trade metadata, validation errors, pricing identity, force flag, and request timestamp

#### `crawl-render-jobs`

Intent:
- render work queue for canonical pages and discovered variant pages

Primary producers:
- crawl request dispatcher
- variant worker

Primary consumer:
- render dispatch worker

Message contract:
- `RenderJob` / `RenderRequest`
- includes `urlKey`, `url`, `blobPrefix`, `pageRole`, and optional source metadata used downstream

#### `crawl-extract-jobs`

Intent:
- extraction work queue after render completes

Primary producers:
- render dispatch worker

Primary consumer:
- extract worker

Message contract:
- `ExtractJob`
- includes `urlKey` and optional `runId`

#### `crawl-variant-jobs`

Intent:
- variant discovery follow-up queue for range pages

Primary producers:
- extract worker when a page is a range page

Primary consumer:
- variant worker

Message contract:
- `VariantJob`
- includes `urlKey` and optional `runId`

#### `crawl-transform-jobs`

Intent:
- transform/composition work queue after extraction completes for non-range pages

Primary producers:
- extract worker

Primary consumer:
- transform worker

Message contract:
- `TransformJob`
- includes `urlKey` and optional `runId`

#### `crawl-extract-batch-jobs`

Intent:
- dispatches one AI call for a whole batch of variant-page items (extraction or image
  classification) instead of one call per item

Primary producers:
- the extraction batch coordinator, once enough ledger items for a `(sourceGroupKey, operation)`
  pair have arrived (or the sweeper force-flushes a stale trailing batch)

Primary consumer:
- the extraction batch worker

Message contract:
- `ExtractionBatchJob`
- includes `batchId`, `sourceGroupKey`, `operation`, `attempt`, `items[]` (each keyed by `urlKey` +
  optional `variantId` - never by array index), and `estimatedPromptTokens`
- results are correlated back per item via `ExtractionBatchResult` / `BatchItemResult`; a batch
  that comes back with fewer results than items retries the whole batch, then splits into smaller
  batches, then falls back to the existing single-item queues - it never leaves a group
  publishable on partial batch success
- fully reversible via `BATCH_MODE_ENABLED=false` in the azure repo: disabled, this queue is never
  used and the existing single-item queues are unchanged

#### `publish-jobs`

Intent:
- publish-preflight and publish-stage queue for ready source groups

Primary producers:
- dispatcher price recompose path
- transform worker when a group becomes ready
- publish preflight HTTP trigger

Primary consumer:
- publish worker

Message contract:
- `PublishJob`
- includes `sourceGroupKey` and optional `runId`

### Blob container

#### `crawl-artefacts`

Intent:
- stores full render, extraction, variant, and composed-detail artefacts that are too large or too detailed for Azure Table rows

Primary producers:
- render service / render dispatch flow
- extract worker
- transform worker

Primary consumers:
- extract worker
- transform worker
- publish worker
- purge and sweeper flows

Common blob families:
- `pages/{urlKey}/page.html`: raw rendered HTML evidence
- `pages/{urlKey}/page.png` or screenshot path from render output: rendered screenshot evidence
- `pages/{urlKey}/elements.json`: extracted DOM element evidence from render
- `pages/{urlKey}/capture-manifest.json`: structured render capture manifest when available
- `pages/{urlKey}/vendor-state.json`: vendor-specific structured state emitted by render when available
- `pages/{urlKey}/extracted-detail.json`: full extracted detail payload used by transform
- `pages/{urlKey}/vendor-product-page.json`: full vendor product page payload when split from extracted detail
- `pages/{urlKey}/variants/{encodedVariantRowKey}.json`: full per-variant payload used by publish preflight
- `pages/{urlKey}/composed-detail.json`: full composed product detail payload used by publish and review

Retention model:
- transient artefact blobs follow the same retention window as transient crawl state
- durable product rows may continue to reference composed detail blobs after transient working data has expired, depending on cleanup policy and future archival decisions

## Field glossary appendix

This appendix is a compact field-level glossary for the most reused shared contracts. It complements the intent-oriented reference above.

### Common identity fields

| Field | Meaning |
|---|---|
| `partitionKey` | Azure Table partition key used for storage locality and query shape. Its meaning depends on the table. |
| `rowKey` | Azure Table row key used as the row identity within a partition. |
| `urlKey` | Hashed canonical URL identity for a crawled page. |
| `urlStorageKey` | Hashed storage partition key derived from `urlKey` for URL-link rows. |
| `sourceGroupKey` | Logical group identity, typically combining source table, root domain, and style code. |
| `sourceGroupStorageKey` | Hashed storage key derived from `sourceGroupKey`. |
| `sourceTableName` | Upstream source table name, currently typically `m2crmproducts`. |
| `sourceRowKey` | Upstream source product row identity. |

### `CrawlPageRow` field glossary

| Field | Meaning |
|---|---|
| `url` | Canonical page URL used for render and downstream processing. |
| `pageRole` | Page classification: `range`, `variant`, or `single`. |
| `rootDomain` | Root domain derived from the canonical URL for grouping and render scoping. |
| `variantUrlsJson` | Serialized discovered variant URL list for range pages. |
| `linkedProductCount` | Number of source products currently linked to this canonical page. |
| `contentHash` | Rendered content hash used for change detection and reuse decisions. |
| `status` | Current page processing state written by render/update flows. |
| `blobHtmlPath` | Blob path to raw rendered HTML evidence. |
| `blobScreenshotPath` | Blob path to rendered screenshot evidence. |
| `blobElementsJsonPath` | Blob path to extracted DOM elements evidence. |
| `blobCaptureManifestPath` | Blob path to structured render capture manifest when available. |
| `blobVendorStatePath` | Blob path to vendor-specific structured state when available. |
| `blobVisibleTextPath` | Blob path to the hidden-aware, tag-free visible-text rendering, when non-empty. Preferred over raw HTML for the AI extraction excerpt. |
| `visibleTextLength` | Compact render telemetry used for diagnostics and review. |
| `ttlExpiresAt` | Transient retention cutoff timestamp. |
| `rawPriceMinor` | Source price in minor currency units carried forward for composition. |
| `vatRate` | Source VAT rate carried forward for composition. |
| `vendorSku` | Source vendor SKU carried forward for composition. |

### `CrawlProductDetailRow` field glossary

| Field | Meaning |
|---|---|
| `status` | Durable composed detail readiness state, usually `draft` or `ready`. |
| `detailJson` | Compact composed summary payload stored directly in the table row. |
| `detailBlobPath` | Blob path to the full composed product detail payload. |
| `publishedAt` | Durable freshness timestamp used by rerender gating and publish reuse. |
| `promptVersion` | Optional AI prompt version metadata when captured. |
| `updatedAt` | Optional last-update timestamp when explicitly written. |
| `createdAt` | Optional creation timestamp when explicitly written. |

### `CrawlValidationRow` field glossary

| Field | Meaning |
|---|---|
| `errorsJson` | Serialized list of operator-fixable validation errors. |
| `firstSeenAt` | Timestamp when the validation issue was first recorded. |
| `lastSeenAt` | Timestamp when the validation issue was most recently observed. |
| `resolvedAt` | Timestamp set when a later valid request resolves the issue. |

### `CrawlRunSummaryRow` field glossary

| Field | Meaning |
|---|---|
| `requestedAt` | Time the run was accepted into the crawl pipeline. |
| `renderStartedAt` / `renderCompletedAt` | Render stage timing. |
| `extractStartedAt` / `extractCompletedAt` | Extract stage timing. |
| `transformStartedAt` / `transformCompletedAt` | Transform stage timing. |
| `publishStartedAt` / `publishCompletedAt` | Publish or publish-preflight stage timing. |
| `aiCallCount` | Number of AI calls attributed to the run. |
| `aiTotalTokens` | Aggregate AI token usage for the run. |
| `aiEstimatedCost` | Approximate AI cost when token pricing settings are configured. |
| `warningCount` | Compact warning count for the run. |

### `CrawlMatchingLedgerRow` field glossary

| Field | Meaning |
|---|---|
| `parentUrlKey` | Canonical page identity for the parent product page. |
| `variantRowKey` | Variant identity used as the ledger row identity. |
| `matchMethod` | Proposal method: `exact_url`, `colour_hint`, or `unmatched`. |
| `matchConfidence` | Numeric confidence score for the current proposal. |
| `approvalState` | Operator approval state for the proposal. |
| `proposalSource` | Workflow that generated the proposal, currently `publish_preflight`. |
| `detailJson` | Compact explanation payload describing why the proposal was made. |