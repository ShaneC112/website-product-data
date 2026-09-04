# A `failed` run status can get permanently stuck even after a successful retry

- **ID:** `azure-a-failed-run-status-can-get-permanently-stuck-even-after-a-successful-retry`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## A `failed` run status can get permanently stuck even after a successful retry

`mergeCrawlRunSummary`'s `mergeStatus` picks the higher-precedence of the
existing and incoming status, and `failed` was given the highest precedence
(1000) so a late-arriving success update could never downgrade a reported
failure. That also meant a run that failed once and then succeeded on retry
stayed reported as `failed` forever - the operator-facing run summary never
recovered even though the pipeline did.

**Fix:** `mergeStatus` now special-cases `existingStatus === 'failed' &&
nextStatus !== 'failed'` to let the retry's status win, while `finalizeRunFailure`
preserves every failure in a new bounded `attemptFailuresJson` (last 20 entries)
so the failure history is not lost just because the run recovered.

**Best practice:** a "highest severity wins" merge strategy for a status field is
right for concurrent out-of-order updates within one attempt, but wrong across
attempts/retries - decide explicitly whether a terminal status should be
recoverable, and if so, carry its history in a separate field instead of losing
it when the current status moves on.

