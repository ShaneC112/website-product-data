# Studio learning 29: `patchGeneratedImage` (Azure's Sanity image client) now also writes a completed roomshot

- **ID:** `studio-29-patchgeneratedimage-azure-s-sanity-image-client-now-also-writes-a-completed-roomshot`
- **Applies to:** `website-product-enrichment-sanity-studio`
- **Status:** Canonical learning detail.

## Learning

- `patchGeneratedImage` (Azure's Sanity image client) now also writes a completed roomshot into the variant's own `primaryImage` (if unset) or appends it to `images` - previously it only updated the roomset's own `.image` field, so an approved room image was invisible in the product's actual image gallery. The decision (set-as-primary vs. append) is based on a `client.getDocument` read taken before the patch, which is not atomic against two roomshots for the same variant completing at nearly the same time - acceptable today given low realistic concurrency per variant, but worth revisiting with a transaction/revision guard if that assumption changes.
