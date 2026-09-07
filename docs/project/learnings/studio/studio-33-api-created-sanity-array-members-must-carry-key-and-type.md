# Studio learning 33: API-created Sanity array members must carry `_key` and `_type`

- **ID:** `studio-33-api-created-sanity-array-members-must-carry-key-and-type`
- **Applies to:** `website-product-enrichment-sanity-studio`
- **Status:** Canonical learning detail.

## Learning

Every object or reference inserted into a Sanity array through an API, Blueprint, Azure worker, or migration must include the metadata required by the destination array schema:

- `_key` must be a deterministic, unique key within the containing array.
- `_type` must identify the object or reference member type when the schema expects it.
- Nested objects must be constructed as complete schema members before they are appended or set.

This applies to more than top-level product variants. It includes `productVariant.roomsets[]`, `productVariant.images[]`, template `binding.variantBindings[]`, template evidence images, and any other Sanity array whose members are created outside the Studio editor.

## Evidence

The image-generation v2 rollout exposed three related defects:

1. Azure attached a generated room image through a nested `roomsets[runId == ...]` selector without first appending a complete roomset object. Sanity could materialize an anonymous `{}` member, which produced both a missing-key warning and a missing-`_type` warning in Studio.
2. Azure appended generated image references to `variant.images[]` as `{_type: 'reference', _ref}` without `_key`, producing Studio's `Missing keys` warning.
3. Studio and Azure created template `binding.variantBindings[]` members without `_key`, producing the same warning on the AI Image Generation Template document.

The visible Studio warning is delayed validation. The write has already produced malformed persisted data by the time the editor sees it.

## Resolution

Use explicit constructors at every write boundary:

- Append a complete, keyed `roomImageGenerationRun` object before setting its completion fields.
- Append image references with a stable key derived from the deterministic media ID.
- Include the source variant key as the binding member key when creating template variant bindings.
- Keep the shared Data schema aligned with the persisted Sanity shape by accepting the optional `_key` on runtime binding objects.
- Treat Sanity's **Add missing keys** action as a repair for historical malformed arrays, not as a substitute for fixing the writer.

## Prevention

For every new Sanity array write:

1. Identify the destination array member schema.
2. Build the complete member object in one named constructor or local value.
3. Set `_key` and `_type` explicitly before appending or creating the document.
4. Add a focused test that asserts the emitted mutation payload, including `_key` and `_type`; schema parsing alone is insufficient because Sanity can accept a partial object and surface the problem later in Studio.
5. Add a read-only inspection or migration repair path when a rollout may already have written malformed members.

When a nested selector is used for an existing member, first prove that the member exists. If it may be absent, append the fully typed member instead of relying on a selector to create an implicit object.

## Verification checklist

- Studio template document shows keyed variant bindings with no array warning.
- Product variant image arrays contain keyed reference members.
- Product variant roomsets contain keyed `roomImageGenerationRun` members with `_type`.
- Azure and Studio focused tests assert the emitted payload shape.
- Existing malformed data is repaired through an explicit, reviewed operation; new runs do not recreate it.
