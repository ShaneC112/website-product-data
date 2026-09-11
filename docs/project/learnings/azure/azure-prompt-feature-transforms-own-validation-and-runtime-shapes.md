# Prompt feature transforms own validation and runtime shapes

- **ID:** `azure-prompt-feature-transforms-own-validation-and-runtime-shapes`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

An Azure prompt feature should keep persisted-value validation and
`fromSanity`/`toSanity` mapping in its `transform.ts`, next to the feature's
runtime types. A type-only Data contract can describe a genuinely shared
Sanity/Azure persisted shape, but it must not pull Azure's Zod implementation or
rich runtime prompt object into the shared package.

This boundary is intentionally asymmetric: camera policy is Azure-only, room and
colour-design use shared persisted types, and texture validation stays Azure-owned
even when a persisted texture shape is shared. Swatch analysis supplies evidence
for colour-design and does not create a separate prompt stage.

**Prevention:** make Sanity access code fetch or patch storage values, have the
feature transform parse and map them, and test malformed persisted values before
reuse. Do not infer shared ownership from a Data import alone.

See the Data companion learning:
[`data-prompt-contracts-must-follow-the-persistence-boundary`](../data/data-prompt-contracts-must-follow-the-persistence-boundary.md).