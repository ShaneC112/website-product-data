# A shared batch-result schema must accept every shape a model actually returns, not just the shape you asked for

- **ID:** `data-a-shared-batch-result-schema-must-accept-every-shape-a-model-actually-returns-not-just-the-shape-you-asked-for`
- **Applies to:** `website-product-data`
- **Status:** Canonical learning detail.

## Learning

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

