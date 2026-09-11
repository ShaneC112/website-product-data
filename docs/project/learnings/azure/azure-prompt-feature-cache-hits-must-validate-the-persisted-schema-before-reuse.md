# Prompt feature cache hits must validate the persisted schema before reuse

- **ID:** `azure-prompt-feature-cache-hits-must-validate-the-persisted-schema-before-reuse`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## Prompt feature cache hits must validate the persisted schema before reuse

Separating a generated prompt feature into cache and orchestration modules can make it
tempting to treat a matching fingerprint as sufficient proof that a cache entry is usable.
The fingerprint proves source identity, but it does not prove that the persisted prompt,
asset references, timestamp, model, and version still satisfy the shared Data contract.

**Fix:** validate cache hits with the Data-owned persisted schema after checking the prompt
version, source fingerprint, and normalized source asset references. Keep Azure-local runtime
types in the feature while leaving the persisted cache schema in Data.

**Best practice:** test both sides of the cache boundary: a matching but malformed persisted
entry must miss safely, and a generated entry must be accepted by the shared schema before it
is written or returned.

### Related Sources

- The room prompt-feature does not yet follow this pattern: see [Room prompt cache has no prompt-version field and silently serves stale wording forever](azure-room-prompt-cache-has-no-prompt-version-field-and-silently-serves-stale-wording-forever.md).