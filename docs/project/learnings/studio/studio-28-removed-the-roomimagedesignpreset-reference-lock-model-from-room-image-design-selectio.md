# Studio learning 28: Removed the `roomImageDesignPreset` reference/lock model from room-image design selectio

- **ID:** `studio-28-removed-the-roomimagedesignpreset-reference-lock-model-from-room-image-design-selectio`
- **Applies to:** `website-product-enrichment-sanity-studio`
- **Status:** Canonical learning detail.

## Learning

- Removed the `roomImageDesignPreset` reference/lock model from room-image design selection (`furnitureStyle`/`interiorFashion`/`statementTone` are now independent direct-choice fields, not gated behind an "active and locked" preset document) - a locked-combination catalogue seemed like a reasonable guardrail but actually just prevented valid combinations an editor wanted (e.g. Next Home furniture with any interior fashion/tone, not only the one pre-seeded combination). When a "protect against invalid input" constraint actually blocks legitimate use of already-independent option lists, prefer independent selects over a locked combination catalogue. `roomImageGenerationRun`'s `presetId`/`presetKey`/`presetTitle`/`presetVersion` schema fields are no longer populated by any write path (kept only for historical documents written before this change) - do not resurrect them without also restoring the removed preset-resolution code in `functions/request-room-images/index.ts`.
