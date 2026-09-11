# Room prompt cache has no prompt-version field and silently serves stale wording forever

- **ID:** `azure-room-prompt-cache-has-no-prompt-version-field-and-silently-serves-stale-wording-forever`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## Room prompt cache has no prompt-version field and silently serves stale wording forever

`getOrCreateTemplateRoomPrompt` (`prompt-features/room/sanity.ts`) returns any existing
`roomPrompts[]` entry for a matching `roomKey` unconditionally on a cache hit. The persisted
`RoomPrompt` schema (`prompt-features/room/transform.ts`) has no generator/prompt-version field:
`fingerprint` is `sha256(roomDescription)`, a content hash of the already-generated text, and
`schemaVersion` is a `z.literal(1)` structural marker, not a generator-version comparison. Neither
can detect that the room-analysis Vision prompt (`roomAnalysis.ts`) itself changed.

### Context & Intent

Room prompts are cached per template/room and reused across all product colour variants to keep
room rendering consistent. That reuse is correct; the gap is that any change to the room-analysis
Vision prompt wording (for example the qualitative-visual-anchor rewording documented in
[Vision-AI room prompts must use qualitative visual anchors instead of CAD numerical
dimensions](azure-vision-room-prompts-must-use-qualitative-visual-anchors-instead-of-cad-numerical-dimensions.md))
has no effect on any template/room combination that already has a persisted `roomPrompts[]` entry
for that `roomKey`. The old wording is served indefinitely until that Sanity entry is manually
cleared or regenerated, with no warning, log, or version-mismatch signal.

The texture prompt-feature already solves this class of problem: `resolveReusableTextureCache`
(`prompt-features/texture/cache.ts`) rejects a cache hit whose `promptVersion` does not match the
current `TEXTURE_PROMPT_VERSION` (`prompt-features/texture/schema.ts`), logging a
`texture-cache-version-mismatch` reason code. The room feature has no equivalent constant or check.

### Durable Invariant

A prompt-feature cache hit must be gated by a generator/prompt-version comparison, not only a
content fingerprint of the previously generated text. A content fingerprint proves the *input*
didn't change; it cannot prove the *generator* (Vision prompt/system prompt) is still the one that
produced the cached output. Until the room feature carries a version field comparable to
`TEXTURE_PROMPT_VERSION` that `getOrCreateTemplateRoomPrompt` checks before trusting a cache hit,
any wording change to the room-analysis Vision prompt must be paired with an explicit runbook step
to clear or regenerate the affected `roomPrompts[]` entries; the change alone is silently inert for
already-cached rooms.

### Related Sources

- `website-product-enrichment-azure/src/sanity-images-v2/prompt-features/room/sanity.ts`
- `website-product-enrichment-azure/src/sanity-images-v2/prompt-features/room/transform.ts`
- `website-product-enrichment-azure/src/sanity-images-v2/prompt-features/room/roomAnalysis.ts`
- `website-product-enrichment-azure/src/sanity-images-v2/prompt-features/texture/cache.ts`
- `website-product-enrichment-azure/src/sanity-images-v2/prompt-features/texture/schema.ts`
- [Prompt feature cache hits must validate the persisted schema before reuse](azure-prompt-feature-cache-hits-must-validate-the-persisted-schema-before-reuse.md)
- [Vision-AI room prompts must use qualitative visual anchors instead of CAD numerical dimensions](azure-vision-room-prompts-must-use-qualitative-visual-anchors-instead-of-cad-numerical-dimensions.md)
