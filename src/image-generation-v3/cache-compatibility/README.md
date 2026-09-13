# Cache Compatibility Metadata

This folder holds optional V3 metadata field shapes for existing reusable template cache entries (room, texture, colour-design). When a cache entry is read, V3 consumers validate that these fields are present and semantically current; legacy entries without the fields are explicit cache misses, never silently accepted as valid hits.

The metadata includes:
- Producer version (which V3 feature implementation created this entry)
- Normalization version (which prompt-normalization rules were applied)
- Prompt version (which prompt contract/generation logic produced this output)
- Input fingerprint (semantic identity of the input that produced this output)

Existing cache schemas in `website-product-data/src/image-generation/cache/` extend these shapes using `.extend()` to remain backward compatible while gaining V3 validation capability.
