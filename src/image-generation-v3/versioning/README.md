# Versioning and Compatibility

This folder defines per-contract upcast rules and compatibility dispositions for V3 contracts. It follows the existing `website-product-data/src/image-generation/versioning/upcasters.ts` pattern: each contract explicitly declares supported versions, and readers either upcast a known old shape into the current internal model or return a typed terminal failure.

**Exports:**
- `upcastImageGenerationV3RecoveryControl`: handles V3 recovery-control version changes
- `upcastImageGenerationV3CacheEntry`: validates and optionally upgrades legacy cache entries with missing V3 metadata
- `quarantineSchema`: schema for incompatible/unsupported-version payloads

No silent defaults, generic JSON merging, or instance purge substitutes for compatibility. Retain prior readers/upcasters until relevant histories are terminal and past retention.
