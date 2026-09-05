# Sanity Projections

The [`sanity`](../../src/sanity/index.ts) export owns pure shared crawl-to-Sanity contracts:
bridge validation, ingestion mapping, conflict-preserving product merges, draft publication,
registry synchronization planning, publication readiness, and media-image GROQ projections.

It also owns the shared product-level AI texture prompt contracts in
`src/sanity/ai-texture-prompt.schema.ts`: native `aiTemplates` image values,
the read-only `aiTexturePrompt` cache object, normalized source-asset handling, and
`computeAiTextureSourceFingerprint()` for exact asset-set plus prompt-version identity.

This package deliberately has no runtime `@sanity/client` dependency. Runtime client creation
and pipeline orchestration remain consumer responsibilities.

Return to the [Data documentation index](../README.md).