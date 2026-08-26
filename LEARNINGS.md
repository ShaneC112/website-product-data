# Learnings

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
