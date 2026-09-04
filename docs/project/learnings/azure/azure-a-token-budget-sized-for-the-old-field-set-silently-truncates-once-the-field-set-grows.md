# A token budget sized for the old field set silently truncates once the field set grows

- **ID:** `azure-a-token-budget-sized-for-the-old-field-set-silently-truncates-once-the-field-set-grows`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## A token budget sized for the old field set silently truncates once the field set grows

`enrichVariantColoursWithAi` (and its batch counterpart,
`enrichVariantColoursForBatch`) sized their AI call's `maxTokens` as
`Math.min(4000, 300 + variantCount * 150)`. That was adequate when variant
enrichment only covered `colourName`, but became too small once `variantFields`
grew to include `togRating`/`suitability`/`warranty`/richer `dynamicFields` per
variant - a live run against a real 7-variant range failed with `SyntaxError:
Unterminated string in JSON at position 4818`, i.e. the model's response was cut
off mid-string by the token cap, not malformed on its own. The failure was
silently swallowed (parse failure logged, function returns the unenriched
variants) rather than crashing, so it read as "enrichment sometimes doesn't work"
rather than "enrichment is budgeted too small," and it went unnoticed until this
specific range was re-tested live after unrelated changes.

**Fix:** both call sites now size `maxTokens` against the real model output
budget via `getBatchPackingConfig()` (`Math.min(floor(maxOutputTokens *
outputBudgetFraction), 300 + variantCount * 400)`) instead of a hardcoded 4000
ceiling and a per-variant allowance that predated the richer field set.

**Lesson:** a fixed per-item token allowance is a silent time bomb once the
per-item payload grows (new registry fields, richer prompts, etc.) - prefer
sizing against the model's actual output cap (a single source of truth already
used elsewhere for batch sizing) over a second, independently-chosen constant that
can drift out of sync with the first. A caught-and-logged parse failure is not the
same as a *correct* result; treat it as a budget bug to investigate, not a
tolerated edge case.

