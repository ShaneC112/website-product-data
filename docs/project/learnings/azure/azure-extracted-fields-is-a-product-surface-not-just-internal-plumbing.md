# `extracted.fields[]` is a product surface, not just internal plumbing

- **ID:** `azure-extracted-fields-is-a-product-surface-not-just-internal-plumbing`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## `extracted.fields[]` is a product surface, not just internal plumbing

`buildExtractedFields`'s generic `serializeFieldValue` collapses any `{ value, unit }`
object into a display string (`"8 mm"`) before it goes into `extracted.fields`. This
is correct for the existing scalar measurement fields (`pileHeight`, `thickness`,
`totalHeight`), which have always been shown as formatted strings. But `width`
(a `measurement-list`) needed to stay a structured array, because `extracted.fields`
is surfaced directly to operators via the AI review UI's "Field confidence" card as
the literal "final AI pass" JSON output — silently flattening it to strings there
would hide the real extracted shape from someone debugging a bad extraction.
Special-cased via `serializeMeasurementListValue`. Any future `measurement-list`
registry field should follow the same pattern (see the same note in
`website-product-data/LEARNINGS.md`).

