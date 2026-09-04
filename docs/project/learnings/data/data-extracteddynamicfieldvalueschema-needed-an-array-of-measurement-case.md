# `extractedDynamicFieldValueSchema` needed an array-of-measurement case

- **ID:** `data-extracteddynamicfieldvalueschema-needed-an-array-of-measurement-case`
- **Applies to:** `website-product-data`
- **Status:** Canonical learning detail.

## Learning

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

