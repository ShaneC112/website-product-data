# `buildSanityIngestionPlan` was rebuilding specs/features from raw fields, bypassing the pipeline's own inclusion decision

- **ID:** `data-buildsanityingestionplan-was-rebuilding-specs-features-from-raw-fields-bypassing-the-pipeline-s-own-inclusion-decision`
- **Applies to:** `website-product-data`
- **Status:** Canonical learning detail.

## Learning

## `buildSanityIngestionPlan` was rebuilding specs/features from raw fields, bypassing the pipeline's own inclusion decision

`composeProductDetail.ts` (Azure) already builds a four-array review model
(`knownSpecifications`/`knownFeatures`/`additionalSpecifications`/`additionalFeatures`) with a
per-field `included` flag - required registry fields default `included: true`, optional/low-
confidence fields default `included: false`. `buildSpecs`/`readFeatureLabels` ignored this
entirely and rebuilt specs/features straight from `blob.extracted.fields[]`, so every registry-
categorized field reached Sanity regardless of what the pipeline itself had decided was ready to
publish.

**Fix:** `buildSpecs`/`buildFeatures` now read `blob.review` directly, filtering each of the four
arrays by `included` before mapping. Named entries keep the registry field name as a stable `key`
(`source: 'vendor'`); catch-all entries get a key slugified from their own description
(`source: 'ai_discovered'`), since they have no canonical registry field to key against.

**Best practice:** when a pipeline stage already computes a inclusion/confidence decision for a
review workflow, a downstream transform must consume that decision, not silently re-derive its own
narrower or wider one from the same raw inputs - the two will drift the moment either side changes
independently.

