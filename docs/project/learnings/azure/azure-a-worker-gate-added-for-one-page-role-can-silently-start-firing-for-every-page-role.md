# A worker gate added for one page role can silently start firing for every page role

- **ID:** `azure-a-worker-gate-added-for-one-page-role-can-silently-start-firing-for-every-page-role`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## A worker gate added for one page role can silently start firing for every page role

Generalizing `renderDispatchWorker`'s Phase03 source-page-only ledger gate to also cover variant
pages (Phase04) meant two existing unit tests that combined `pageRole: 'variant'` with a `runId`
suddenly started exercising the new ledger claim path for the first time - with no default mock
return value configured, `claimStageLease()` resolved to `undefined` (falsy), silently short-
circuiting the whole worker via the `if (!leased) return` guard and breaking two previously-green
assertions with a confusing "mock not called" failure instead of an obvious "code is wrong" one.

**Fix:** always set an explicit default resolved value (`true`) for a claim/lease mock in
`beforeEach`, not just `.mockReset()`, whenever generalizing a gate to cover more cases than the
tests were originally written for.

**Best practice:** when widening a conditional's scope (e.g. `pageRole === 'range'` to `isSourcePage
|| isVariantPage`), explicitly re-check every existing test fixture for whether it now falls inside
the widened condition, not just whether it still passes - a fixture can start silently hitting a
brand-new code path with an unconfigured mock and still "pass" for the wrong reason if the guard's
default failure mode happens to look like the old behavior.

