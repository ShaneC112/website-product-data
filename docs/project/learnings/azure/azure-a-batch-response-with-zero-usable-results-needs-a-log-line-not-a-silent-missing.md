# A batch response with zero usable results needs a log line, not a silent `missing`

- **ID:** `azure-a-batch-response-with-zero-usable-results-needs-a-log-line-not-a-silent-missing`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## A batch response with zero usable results needs a log line, not a silent `missing`

Two related failure modes were previously silent: (1) a parsed AI response whose
`results` array came back empty (e.g. the prompt-shape bug above) and (2) an
individual result object that failed `BatchItemResult` schema validation (e.g. the
model returning a literal `error: null` before the shared schema accepted it - see
[A shared batch-result schema must accept every shape a model actually returns](../data/data-a-shared-batch-result-schema-must-accept-every-shape-a-model-actually-returns-not-just-the-shape-you-asked-for.md)). Both used to fall straight through to
`status: 'missing'` with no diagnostic trail beyond "the item didn't come back."

**Fix:** `extractTradeDetailsBatch` now logs a content sample (`logWarn`, capped to
500 chars) whenever a parsed response yields zero results, and logs each
`BatchItemResult` schema-validation failure with its Zod issues, and each
urlKey-not-in-expected-set case. This is exactly what made the two real bugs above
diagnosable from a single direct AI call and its log output, rather than needing
another live end-to-end pipeline run per hypothesis.

**Lesson:** on any AI response-correlation path where "no match" is a valid,
expected outcome for a single bad item, it is *not* a valid, expected outcome for
*every* item in a batch - log enough of the raw response to diagnose a systemic
mismatch the first time it happens, since re-triggering a real AI call to get the
same diagnostic later costs real time and money.

