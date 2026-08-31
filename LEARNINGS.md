# Learnings

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
the named field `togRating` (alongside `suitability`, `warranty`, and `areaRoom`),
the shared registry change itself was straightforward - but consumer fixtures still
encoded the old catch-all representation. The production code was already
registry-driven; the stale assumptions lived in tests and docs.

**Best practice:** when a field graduates from catch-all to named registry entry,
review adjacent consumer fixtures and README examples immediately. Otherwise the
codebase drifts into a confusing state where the registry says one thing and the
tests/documentation still teach the old shape.

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
