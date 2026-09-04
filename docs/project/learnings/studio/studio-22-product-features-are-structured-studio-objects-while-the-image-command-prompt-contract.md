# Studio learning 22: Product features are structured Studio objects, while the image-command prompt contract 

- **ID:** `studio-22-product-features-are-structured-studio-objects-while-the-image-command-prompt-contract`
- **Applies to:** `website-product-enrichment-sanity-studio`
- **Status:** Canonical learning detail.

## Learning

- Product features are structured Studio objects, while the image-command prompt contract expects strings. Blueprint projections must map features to their labels before queueing. Re-preparing a deterministic room-image run must unset the same run `_key` before appending its replacement, or Sanity arrays accumulate duplicate keys. Regenerate `schema.json` and `sanity.types.ts` whenever source schemas remove document types or fields so downstream TypeGen consumers do not retain legacy concepts.
