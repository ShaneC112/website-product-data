# Studio learning 20: Once `productVariant.roomsets[]` became the single source of truth for room-image runs (

- **ID:** `studio-20-once-productvariant-roomsets-became-the-single-source-of-truth-for-room-image-runs`
- **Applies to:** `website-product-enrichment-sanity-studio`
- **Status:** Canonical learning detail.

## Learning

- Once `productVariant.roomsets[]` became the single source of truth for room-image runs (moved off `imageGenerationRequest.runs[]`), a naive `client.patch(id).set({'variants[_key==X].roomsets': newRuns})` in the `request-room-images` Blueprint Function would silently delete every previously completed roomset for that variant from earlier, unrelated requests - `.set()` replaces the whole array, and a variant can accumulate roomsets across many separate requests over its lifetime. Fixed with `setIfMissing({'variants[_key==X].roomsets': []}).append('variants[_key==X].roomsets', newRuns)` so new prepared runs are appended, never replacing what is already there. Any future code that writes into an accumulating per-variant array (not just `roomsets`) should default to append/insert semantics, not `set`, unless the intent is genuinely a full replace.
