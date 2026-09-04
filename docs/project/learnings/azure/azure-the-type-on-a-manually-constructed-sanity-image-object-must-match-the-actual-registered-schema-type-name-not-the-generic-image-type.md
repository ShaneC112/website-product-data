# The `_type` on a manually-constructed Sanity image object must match the actual registered schema type name, not the generic `image` type

- **ID:** `azure-the-type-on-a-manually-constructed-sanity-image-object-must-match-the-actual-registered-schema-type-name-not-the-generic-image-type`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## The `_type` on a manually-constructed Sanity image object must match the actual registered schema type name, not the generic `image` type

`patchGeneratedImage` wrote completed roomshots with `_type: 'image'` - Sanity's built-in generic
image type - instead of `_type: 'productImage'`, the actual custom object type registered in this
repo's schema (with `role`/`alt`/`sourceUrl`/`room`/`generationPrompt` fields). Documents written
this way would silently drop or misrender those custom fields in Studio. Fixed at the write site
and added `scripts/repair-roomshot-image-types.ts` (dry-run by default, `ifRevisionId`-guarded
apply) to correct already-written documents.

**Best practice:** when constructing a typed Sanity object by hand in a backend integration
(rather than through the Studio form, which always uses the registered schema name), double-check
`_type` against the actual `defineType({name: ...})` in `schemaTypes/`, not a generic Sanity
built-in type that happens to also be called "image".

