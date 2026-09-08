# A live not-applicable proof found the contribution plan and request projection were both incomplete

- **ID:** `azure-a-live-not-applicable-proof-found-the-contribution-plan-and-request-projection-were-both-incomplete`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

### A live not-applicable proof found the contribution plan and request projection were both incomplete

**Fix:** In [request.ts](/workspaces/project-container/website-product-enrichment-azure/src/sanity-images-v2/01-resolve/request.ts), seed each contribution plan item's `origin` as `not-applicable` (not `not-reached`) when product capability or pattern classification already rules it out at resolve time, and seed `terminalContributionSummary` immediately instead of leaving every item as a placeholder to be filled in later. In [registry.ts](/workspaces/project-container/website-product-enrichment-azure/src/sanity-images-v2/05-persist/registry.ts) and [sanityClient.ts](/workspaces/project-container/website-product-enrichment-azure/src/sanity-images-v2/core/sanityClient.ts), add a revision-guarded `patchImageGenerationRequestProjection` call after persist completes so the request document's `currentRun` and terminal `submissionState`/`submissionOutcome` are actually written once `projectImageGenerationStatus` reports the run as terminal.

**Best practice:** A "not applicable" or fully skipped outcome is still a real terminal outcome, and it must be seeded and projected the same way a completed one is. Live-proving only the happy path where every feature actually generates leaves every skip/not-applicable branch's projection code unexercised; a live proof needs to run at least one request where every optional feature is skipped end to end, not only the branch where everything generates.
