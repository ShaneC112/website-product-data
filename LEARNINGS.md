# Learnings

## `buildVariant` applying one row's price to every colour was a real bug, not just a missing feature

`buildSanityIngestionPlan` took a single flat `rawPriceMinor` from whichever one
`webcrawlproductdetail` row was passed in and applied it to every variant, even
though `crawlTransformWorker.ts` already writes one row per matched m2crm SKU
(each with its own price) and `publishWorker.ts` already computes a per-variant
match proposal (`matchVariantToCandidates`) before publishing. The two systems
were never connected.

**Fix:** `buildSanityIngestionPlan`'s new `options.variantOverrides` (keyed by
`variantId`) lets a caller supply per-colour `rawPriceMinor`/`rawBoxPriceMinor`
resolved from the existing match ledger, overriding the row-level default only
for variants that have a resolved override. `publishWorker.ts` now builds this
map from the matching pass it already runs, and publishes once per distinct
`urlKey` (not once per matched row) so a shared page's colours aren't published
as separate, redundant Sanity documents with each other's prices flickering in
depending on iteration order.

**Best practice:** when a per-colour matching/resolution system already exists
for one purpose (here: swatch/variant matching), check whether a "known bug"
elsewhere in the same product (uniform pricing) is actually just that same
system not being wired to the place that needs it, before assuming a new
resolution mechanism must be built from scratch.

## Width has to be re-derived from a display-string label at the ingestion boundary

`ExtractedWidthSlot` (`vendorProductPage.widths` / `variant.widths`) is `{widthLabel:
string}`, e.g. `"4 m"` - the structured `{value, unit}` measurement that
extraction actually produces is flattened into a display string by
`buildWidthSlots` (azure) before it ever reaches the shared blob. Any
unit-normalized physical-size comparison downstream (the width parent/child
model) has no structured data to work with unless it re-parses that label.

**Best practice:** `readWidthSlot` in `ingestion.ts` parses `"${value} ${unit}"`
back into a measurement deliberately narrowly (exact format only) rather than
attempting a general free-text width parser - the format is fully controlled by
`buildWidthSlots` on the write side, so a strict parse is safe and any drift in
that format would be a build-time contract change, not a runtime data
surprise. `areMeasurementSetsEquivalent` (unit-normalized to mm) is the reusable
comparison utility for this and future product-default/child-override fields
(`packInfo`, pattern fields).

## Catch-all fields need a structured registry type

Live enrichment data exposed `additionalFeatures` as string arrays even though
storage and review consumers require `{ description, value }` objects. Describing
the field as generic `text` left the AI prompt and schema contract in disagreement.

**Best practice:** give structured catch-all fields a distinct registry value type,
state the exact JSON shape in field guidance, and validate that shape before data
crosses a repository boundary. Keep named feature booleans in the `features`
category rather than duplicating them as display strings.

## Executable URL policy must survive every transport boundary

Manual HTTP requests already required HTTPS for specified product URLs and curated PDFs, but the
queue and render schemas accepted any URL scheme. Direct queue producers could therefore bypass
the ingress guarantee before the renderer fetched the resource.

**Best practice:** enforce HTTPS on executable evidence URLs in both ingress and queue/render
contracts. Keep intentionally permissive source fields separate when malformed upstream values
must still travel to a validation ledger.

## Batch fallback controls belong to the queue that consumes them

An exhausted image-classification batch must set `bypassBatch: true` when it falls back to
`crawl-image-jobs`. Without that flag, the image worker can put the same item back into the batch
ledger instead of executing the single-item path. Modeling the flag on `TransformJob` hid this
loop because the image worker borrowed an unrelated queue schema.

**Best practice:** give each queue an accurately named contract, and carry loop-prevention flags
through every retry, split, and single-item fallback path. Protect the wire shape in the shared
package as well as the consuming worker tests.

## Batch identity needs a durable dispatch contract as well as item ownership

The batch item ledger records which URL belongs to a batch, but that alone cannot recover the
crash window after atomic assignment and before the queue message is delivered. A dispatch/outbox
record in the same storage partition carries the serialized job, state, attempt, owner token, and
lease expiry, allowing a sweeper to replay abandoned work without rebuilding its membership.

**Best practice:** for at-least-once queue work, model both durable item membership and durable
delivery intent in the shared storage contract. Keep the lifecycle fields explicit (`ready`,
`queued`, `processing`, `completed`) so writers, workers, and operator diagnostics use one shape.

## Promoting a catch-all attribute into a named registry field creates fixture drift

`TOG rating` originally only appeared in downstream tests as an
`additionalSpecifications` entry. Once it was promoted into the Carpet registry as
the named field `togRating` (alongside `suitability` and `warranty`),
the shared registry change itself was straightforward - but consumer fixtures still
encoded the old catch-all representation. The production code was already
registry-driven; the stale assumptions lived in tests and docs.

**Best practice:** when a field graduates from catch-all to named registry entry,
review adjacent consumer fixtures and README examples immediately. Otherwise the
codebase drifts into a confusing state where the registry says one thing and the
tests/documentation still teach the old shape.

## Static publication taxonomies must be shared with extraction

Free-text room values cannot safely drive a Sanity list, navigation, and room-image
generation at the same time. `suitableRooms` now uses one shared list across every
trade, while Azure filters AI values against the registry's `allowedValues` before
storage. The Sanity product-type mapper similarly transforms pipeline trade labels
instead of exposing them as public taxonomy values.

## `width` registry field: structural fix over defensive capping

**Challenge:** a live E2E run showed a vendor page's extracted `width` field
turning into thousands of bogus entries (raw CSS selector text) once a downstream
parser split it on `-`/`/`/" to ". The original fix only capped the compact
table-row summary (`widthCount` instead of a full `widths` array) to stop the Azure
Table `PropertyValueTooLarge` crash — it did not stop bad data from being generated
in the first place, and the AI review UI still showed the garbage once the blob was
read correctly.

**Solution:** changed the `width` field-registry entry (Carpet trade) from
`valueType: 'text'` to `'measurement-list'`, i.e. `Array<{ value: number, unit:
string }>` instead of free text. The consuming extraction code
(`website-product-enrichment-azure`) now produces and consumes this shape
end-to-end, so there is no free-text splitting step left that could turn one bad
value into many. See that repo's `LEARNINGS.md` for the extraction-side details.

**Best practice:** when a registry field's `valueType` is `measurement-list` (or
any structured type), keep its `extracted.fields[]` value as the structured
array/object, not a display string. `extracted.fields` is surfaced directly to
operators (the "final AI pass" JSON in the AI review UI), so silently
flattening structured data into a string there is a product regression, not just
an internal representation detail.

## `extractedDynamicFieldValueSchema` needed an array-of-measurement case

Dynamic fields (`ExtractedDynamicField.value`) previously only supported a single
scalar measurement (`{ value, unit }`), not a list of them. Any registry field that
can have multiple measurements (like `width`, which can list several available roll
widths) needs `z.array(extractedScalarMeasurementSchema)` added to
`extractedDynamicFieldValueSchema` in `src/storage/page-detail.schema.ts`. Forgetting
this causes a silent type mismatch on the Azure side rather than a build failure,
since the azure repo's own `ExtractedDynamicFieldValue` union must be kept in sync
manually (this package doesn't validate that TS type against the zod schema at
compile time).

## `file:` dependents must be rebuilt *and restarted*

Every change here requires: `npm run build` in this package, then
`npm install ../website-product-data --no-save` (or `pnpm install`) in each
consumer, then a full process restart of that consumer (not just a rebuild) —
`pnpm`/`npm`'s `file:` protocol can leave a stale on-disk copy, and a long-running
dev/runtime process can hold a stale in-memory module even after the on-disk copy
is refreshed. Confirmed consumers as of this change:
`website-product-enrichment-azure`, `website-product-enrichment-ui`,
`website-product-enrichment-render`.

## `crawlUrlLinkTableSchema` doesn't own every field `CrawlUrlLinkEntity` actually persists

`rawPriceMinor`/`vatRate` (and now `rawBoxPriceMinor`/`boxUnit`) are read/written by
`website-product-enrichment-azure`'s `crawlUrlLinksStore.ts` via a locally-declared
`CrawlUrlLinkEntity = CrawlUrlLinkTable & {...}` type extension, not via this package's
shared `crawlUrlLinkTableSchema` in `src/storage/url-link.schema.ts`. This is an
existing, asymmetric pattern (contrast with `crawlPageTableSchema`/`crawlProductDetailTableSchema`,
which both own their `rawPriceMinor`/`vatRate` fields directly) - there is no runtime
zod validation of these fields on the `webcrawlurllinks` table today, only a
compile-time TS shape.

**Best practice:** when adding a new field to the box-price/pack-info family, add it
to the consumer-local `CrawlUrlLinkEntity`/`CrawlUrlLinkInput` type (mirroring
`rawPriceMinor`/`vatRate`) rather than only to the shared schema - the shared schema
alone will not make the field reach the table today. Promoting these fields into the
shared schema (so they get real runtime validation) is a separate, deliberate future
change, not an automatic consequence of adding one more field this way.

## A field registry `exampleValue` is prompt content, not documentation, and models will copy it

The `width` field's registry entry (Carpet trade) had
`exampleValue: '[{"value":400,"unit":"cm"}]'`. `buildPromptFieldGuidance` embeds
this directly into the AI system prompt as `Example: [{"value":400,"unit":"cm"}].`
in `website-product-enrichment-azure`. On a live page whose real width text was
"Available Widths (m): 4" (no unit attached to the number), the model returned the
example verbatim - `{"value":400,"unit":"cm"}`, at confidence 1 - instead of the
real value. It read as plausible, realistic-looking data, so the model reused it
rather than treating it as a format hint.

**Fix:** changed the example to an unmistakable placeholder
(`[{"value": <the number found on the page>, "unit": "<cm or m, matching the
page>"}]`) so a model that copies it verbatim now fails a value-type check
downstream (the consuming repo's structural validation expects a real number and
unit string) instead of producing a silently-wrong number. The consuming repo also
added an explicit "never output an example's literal value" instruction to its base
system prompt - see that repo's `LEARNINGS.md` for the full writeup.

**Best practice:** any `exampleValue` added to `fieldRegistry` for a numeric,
measurement, or otherwise structured field should look obviously like a
placeholder, not like data that could plausibly be real - the more realistic an
example looks, the more likely a model is to echo it when its actual confidence in
the evidence is low.

## A shared batch-result schema must accept every shape a model actually returns, not just the shape you asked for

`batchItemResultSchema.error` was originally `z.string().min(1).max(500).optional()`.
Against real Azure OpenAI (not the mocked unit tests), the model consistently
returned a literal `"error": null` for successful items instead of omitting the key
entirely - a well-formed, schema-adjacent response that nonetheless failed
validation for every item in the batch, because Zod's `.optional()` alone rejects
an explicit `null`. The consuming repo's mocked tests never caught this because the
mocks always constructed exactly the shape the code expected.

**Fix:** `error: z.string().trim().min(1).max(500).nullable().optional()` - the
same pattern already used elsewhere in this package for optional AI-authored
fields (e.g. `VariantColourEnrichmentSchema`'s `label`/`colourName` in the azure
repo). Added a dedicated regression test (`test/batch-contracts.test.ts`) asserting
`error: null` parses successfully, since this failure mode is invisible to any test
that only feeds the schema hand-constructed "expected" payloads.

**Best practice:** for any schema field whose values are populated by an LLM
response rather than application code, default to `.nullable().optional()` unless
you've specifically confirmed the model never emits an explicit `null` for that
field - and add a test with a literal `null`, not just an omitted key, since those
are two different wire shapes that Zod treats differently.

## Shared schema helpers should stay at the contract boundary, not mirror every local convenience

The shared package had accumulated parser helpers like
`parseExtractedDetailBlob`, `parseVendorProductPageBlob`, and
`parseCrawlExtractBatchTable` even though the active consumers only used the zod
schemas and stringify helpers. Keeping declaration-only parser wrappers around made
the package surface look larger than the real contract and created extra cleanup
work whenever the underlying schema changed.

**Best practice:** keep `website-product-data` focused on durable shared contracts:
schemas, inferred types, constants, and key builders. If a parser/helper is only a
thin local convenience for one repo, keep it in that repo instead of exporting it
from the shared package.

## Curated upstream artefact URLs belong in the shared contract, not in repo-local side channels

`productOnlinePdfUrl` started as an upstream m2crm field needed by the Azure manual-enqueue path, but the
real requirement was broader: once a curated vendor PDF URL exists, both the crawl-request queue contract
and the render-request contract need to preserve it so render can emit it as evidence and extraction can
pass the original PDF to the multimodal model.

**Solution:** add `productOnlinePdfUrl` to the shared `manualCrawlEnqueueSchema`,
`crawlRequestMessageSchema`, and `renderRequestSchema` instead of letting each consumer invent its own
local extension.

**Best practice:** when a field crosses more than one repo boundary, promote it into
`website-product-data` as soon as the second boundary appears. Shared pass-through metadata is exactly what
this package is for; leaving it repo-local guarantees drift.

## Explicit variant membership must be a first-class contract

Some commercial products group URLs differently from a vendor website. `SpecifiedUrls` keeps that source
membership explicit: a request carries a validated URL array instead of overloading website Range discovery.
Consumers must treat the array as required for that mode and preserve `Range`/`Single` semantics unchanged.

**Best practice:** model source-authoritative membership explicitly at the shared contract boundary; do not
try to infer commercial groups from presentation-page headings or URL labels.

## Durable ledger rows need run identity

The extraction batch ledger is keyed by group, operation, and URL so retries can reuse one durable item. That same key is also reused by later crawl runs. Without `runId` on the shared row contract, a later run cannot distinguish its own pending work from a succeeded item left by an earlier run.

**Solution:** carry optional `runId` on `crawlExtractBatchTableSchema` and test it at the shared package boundary. Azure can then preserve idempotency within a run while resetting terminal rows when ownership moves to a new run.

**Best practice:** when a durable work ledger outlives an orchestration run, store both business identity and run identity; keys alone are not enough to express retry ownership.

## Width's parent/child model needed a real per-colour width source, not just a comparison utility

`areMeasurementSetsEquivalent` alone doesn't fix width inheritance if the only per-variant width
data available is page-extracted `variant.widths` - the same noisy, single-pass source the
pre-existing `crawlTransformWorker.ts` comment already warned couldn't be trusted alone. Price had
the identical problem and was fixed by resolving per-colour data from the matched m2crm source
row (`variantOverrides`); width needed the same authoritative channel, not a second bespoke one.

**Fix:** `rawWidthHint` rides the same `variantOverrides` map `rawPriceMinor` already uses. A
variant's resolved width set is the union of its page-extracted `widths` and its matched source
row's `rawWidthHint`, computed once per variant before `product.widths` is determined (so the
range-level default can itself fall back to that union when no range-level width was extracted),
then compared against the product default via `areMeasurementSetsEquivalent`.

**Best practice:** when adding a hint/override channel for a field that already has one for a
sibling field (price), reuse the same map and resolution order instead of adding a parallel one -
the two fields are resolved by the same match, at the same point in the pipeline.

## The bridge gate's packInfo requirement was left informational, not blocking

Phase 03 asked whether a Carpet Tile/Laminate/Vinyl/Engineered Wood product with no
`packInfo`/`packPrice` should fail `evaluateBridgeEligibility`, explicitly flagging it as a softer
call than the width check and asking for confirmation before implementing either way.

**Decision:** `SANITY_CONTENT_REQUIREMENTS[productType].requiresPackInfo` is defined (shared with
the Studio gate, Phase 05) but `evaluateBridgeEligibility` does not currently block on it - only
`requiresWidth` blocks. Box price/pack info is already authoritative business data (present or
not, per Phase 02) rather than a page-extraction quality signal the bridge should gate on; a
missing value there is more useful as an Azure/Nuxt-side informational signal than a hard block.
Revisit if real data shows products are reaching Sanity without pack info that customers need to
see, at which point this becomes an explicit, confirmed decision to add `missing_required_pack_info`
as a blocking reason.

## `buildSanityIngestionPlan` was rebuilding specs/features from raw fields, bypassing the pipeline's own inclusion decision

`composeProductDetail.ts` (Azure) already builds a four-array review model
(`knownSpecifications`/`knownFeatures`/`additionalSpecifications`/`additionalFeatures`) with a
per-field `included` flag - required registry fields default `included: true`, optional/low-
confidence fields default `included: false`. `buildSpecs`/`readFeatureLabels` ignored this
entirely and rebuilt specs/features straight from `blob.extracted.fields[]`, so every registry-
categorized field reached Sanity regardless of what the pipeline itself had decided was ready to
publish.

**Fix:** `buildSpecs`/`buildFeatures` now read `blob.review` directly, filtering each of the four
arrays by `included` before mapping. Named entries keep the registry field name as a stable `key`
(`source: 'vendor'`); catch-all entries get a key slugified from their own description
(`source: 'ai_discovered'`), since they have no canonical registry field to key against.

**Best practice:** when a pipeline stage already computes a inclusion/confidence decision for a
review workflow, a downstream transform must consume that decision, not silently re-derive its own
narrower or wider one from the same raw inputs - the two will drift the moment either side changes
independently.

## The `held` outcome replaces `productImportCandidate` entirely - no Sanity call at all, not a different document type

The old `productImportCandidate` branch still created a Sanity document (a triage queue entry) for
data that failed the publication gate. `evaluateBridgeEligibility` (Phase 03) replaces that with a
`held` outcome that makes **no Sanity call whatsoever** - not even a holding document - and never
touches an existing draft/published product for the same identity if a re-crawl's plan fails the
bridge.

**Best practice:** `publishProductDraft` evaluates bridge eligibility (plus `duplicate_identity`/
`content_locked`) before any asset upload or `createOrReplace` call, and returns immediately on
failure. Do not reorder this - uploading assets or touching an existing document before the gate
check would either waste API calls on data that should never reach Sanity or leave partial state
behind if the plan is later found ineligible.

## `evaluatePublicationGate` was reused for two unrelated gates - split into bridge vs Studio gates

`evaluatePublicationGate` used to be Studio's document-level Publish validation, and it re-checked
`importMeta.gateStatus`/`detailScore`/`accuracyScore`/`blockingReasons` - read-only pipeline
internals an editor has no way to fix. It was never the bridge gate (that's
`evaluateBridgeEligibility`, Phase 03), but it blurred the same line: a technical, Azure-owned
readiness check leaking into a content editor's surface.

**Fix (Phase 05):** `evaluatePublicationGate` is replaced by `evaluateStudioPublishReadiness`,
which only checks fields an editor can see and fix (name, shortDescription, productType, per-
variant colourName/hex/colourFamily/image) plus the same shared
`SANITY_CONTENT_REQUIREMENTS[productType]` trade-specific width/pack-info checks the bridge gate
uses - never a score, gate status, or blocking-reasons list. `importMeta` no longer carries
`detailScore`/`accuracyScore`/`gateStatus`/`blockingReasons`/`needsReview` at all; the one
surviving, deliberately narrow hint is `importAiConfidence: 'high'|'medium'|'low'`.

**Best practice:** never let a single function serve both the bridge gate and the Studio publish
gate, even when they overlap on a shared fact (e.g. "does this trade need a width") - factor the
shared fact into a table both consult (`SANITY_CONTENT_REQUIREMENTS`), but keep the two gate
functions themselves entirely separate so one never silently grows a pipeline-only check on the
editor-facing side.

## Review corrections: source ownership and per-SKU pack data

Product-level `widths` must be included in `SOURCE_MANAGED_FIELDS`; otherwise re-import starts from
the existing document and silently ignores changed source widths. Pack requirements belong in the
bridge gate as well as the Studio gate, because missing crawl-owned pack data cannot be repaired by
an editor. For source rows that share one URL, `packInfoHintJson` must remain attached to each URL
link/product-detail row and flow through the approved variant override, just like price and width.

**Best practice:** test shared-URL products with distinct source-row pack hints, not only distinct prices.
