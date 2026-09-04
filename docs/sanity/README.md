# Sanity Projections

The [`sanity`](../../src/sanity/index.ts) export owns pure shared crawl-to-Sanity contracts:
bridge validation, ingestion mapping, conflict-preserving product merges, draft publication,
registry synchronization planning, publication readiness, and media-image GROQ projections.

This package deliberately has no runtime `@sanity/client` dependency. Runtime client creation
and pipeline orchestration remain consumer responsibilities.

Return to the [Data documentation index](../README.md).