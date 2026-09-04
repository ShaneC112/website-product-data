# An AI model will copy a prompt's example value verbatim when it's uncertain

- **ID:** `azure-an-ai-model-will-copy-a-prompt-s-example-value-verbatim-when-it-s-uncertain`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## An AI model will copy a prompt's example value verbatim when it's uncertain

After fix 4 above, the AI started actually running for `width` on pages the regex
path couldn't resolve - and returned `{"value":400,"unit":"cm"}` for a page whose
real text was "Available Widths (m): 4", with confidence 1. `400 cm` is the exact,
verbatim `exampleValue` from the `width` field-registry entry
(`website-product-data/src/registry/field-registry.ts`), embedded in the system
prompt via `buildPromptFieldGuidance` as `Example: [{"value":400,"unit":"cm"}].` -
the model reused the illustrative example as if it were the extracted answer,
rather than a format hint.

**Fix, two layers:** (1) added an explicit instruction to
`BASE_SYSTEM_PROMPT_PREFIX` in `tradeContracts.ts` - never output an example's
literal value unless the page's own evidence independently states it; omit rather
than guess; (2) changed the `width` field's `exampleValue` to an unmistakable
placeholder (`<the number found on the page>` instead of a real-looking number) so
that even a model that ignores instruction (1) produces a value that fails the
existing `{value: number, unit: string}` structural check in `readAiWidthField` and
gets discarded rather than silently accepted.

**Lesson:** a concrete, realistic-looking example value in an LLM prompt is a
latent bug, not just documentation - it will occasionally be echoed back as fact,
especially for structured/numeric fields the model has no evidence for. Prefer
placeholders that are obviously not real data (angle-bracket description text, not
a plausible number) for anything a model might copy verbatim, and always pair that
with structural validation on the way back in so an echoed placeholder is caught,
not just discouraged.

