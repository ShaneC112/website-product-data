# Style-code import requests need structured per-row results, not just terminal status strings

- **ID:** `azure-style-code-import-requests-need-structured-per-row-results-not-just-terminal-status-strings`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## Style-code import requests need structured per-row results, not just terminal status strings

The import-by-style-code workflow fans one top-level Sanity request into multiple M2CRM source-row
queue attempts and later into multiple crawl run summaries.

The first implementation only patched a terminal request `status` and replaced
`progressMessages` with one summary string. Excluded rows, queue-send failures, held outcomes, and
successful draft creations were not persisted as structured request results.

Operators need to know which exact M2CRM rows were excluded, which failed before queueing, and
which eventually produced drafts or held outcomes. A single terminal string loses that information
and makes mixed outcomes unreadable.

Best practice:

- Record excluded rows immediately as `failureResults` with `outcome: 'excluded'`.
- Record queue-send failures immediately as `failureResults` with `outcome: 'failed'`.
- Project terminal run summaries back into bounded `successResults` / `failureResults` instead of
  overwriting progress with one message.
- Preserve bounded `progressMessages` as an operator timeline, and keep server logs for request,
  row key, queue-failure, and terminal projection events.