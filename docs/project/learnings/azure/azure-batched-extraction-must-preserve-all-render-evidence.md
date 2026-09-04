# Batched extraction must preserve all render evidence

- **ID:** `azure-batched-extraction-must-preserve-all-render-evidence`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## Batched extraction must preserve all render evidence

The original batched extraction path persisted extracted details but skipped document captures, unlike the
single-item worker. A shared same-domain PDF persistence helper now runs in both paths, and deterministic
vendor technical PDFs are accepted as multimodal AI inputs.

**Best practice:** when batching an existing worker flow, compare every post-extraction side effect, not only
the model request and primary record write. Otherwise evidence silently disappears only for larger groups.

