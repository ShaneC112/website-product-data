# The `held` outcome replaces `productImportCandidate` entirely - no Sanity call at all, not a different document type

- **ID:** `data-the-held-outcome-replaces-productimportcandidate-entirely-no-sanity-call-at-all-not-a-different-document-type`
- **Applies to:** `website-product-data`
- **Status:** Canonical learning detail.

## Learning

## The `held` outcome replaces `productImportCandidate` entirely - no Sanity call at all, not a different document type

The old `productImportCandidate` branch still created a Sanity document (a triage queue entry) for
data that failed the publication gate. `evaluateBridgeEligibility` (Phase 03) replaces that with a
`held` outcome that makes **no Sanity call whatsoever** - not even a holding document - and never
touches an existing draft/published product for the same identity if a re-crawl's plan fails the
bridge.

**Best practice:** `publishProductDraft` evaluates bridge eligibility (plus `duplicate_identity`/
`content_locked`) before any asset upload or `createOrReplace` call, and returns immediately on
failure. Do not reorder this - uploading assets or touching an existing document before the gate
check would either waste API calls on data that should never reach Sanity or leave partial state
behind if the plan is later found ineligible.

