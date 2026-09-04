# `width` registry field: structural fix over defensive capping

- **ID:** `data-width-registry-field-structural-fix-over-defensive-capping`
- **Applies to:** `website-product-data`
- **Status:** Canonical learning detail.

## Learning

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

