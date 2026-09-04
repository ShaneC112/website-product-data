# A field registry `exampleValue` is prompt content, not documentation, and models will copy it

- **ID:** `data-a-field-registry-examplevalue-is-prompt-content-not-documentation-and-models-will-copy-it`
- **Applies to:** `website-product-data`
- **Status:** Canonical learning detail.

## Learning

## A field registry `exampleValue` is prompt content, not documentation, and models will copy it

The `width` field's registry entry (Carpet trade) had
`exampleValue: '[{"value":400,"unit":"cm"}]'`. `buildPromptFieldGuidance` embeds
this directly into the AI system prompt as `Example: [{"value":400,"unit":"cm"}].`
in `website-product-enrichment-azure`. On a live page whose real width text was
"Available Widths (m): 4" (no unit attached to the number), the model returned the
example verbatim - `{"value":400,"unit":"cm"}`, at confidence 1 - instead of the
real value. It read as plausible, realistic-looking data, so the model reused it
rather than treating it as a format hint.

**Fix:** changed the example to an unmistakable placeholder
(`[{"value": <the number found on the page>, "unit": "<cm or m, matching the
page>"}]`) so a model that copies it verbatim now fails a value-type check
downstream (the consuming repo's structural validation expects a real number and
unit string) instead of producing a silently-wrong number. The consuming repo also
added an explicit "never output an example's literal value" instruction to its base
system prompt - see [An AI model will copy a prompt's example value verbatim when it's uncertain](../azure/azure-an-ai-model-will-copy-a-prompt-s-example-value-verbatim-when-it-s-uncertain.md) for the full writeup.

**Best practice:** any `exampleValue` added to `fieldRegistry` for a numeric,
measurement, or otherwise structured field should look obviously like a
placeholder, not like data that could plausibly be real - the more realistic an
example looks, the more likely a model is to echo it when its actual confidence in
the evidence is low.

