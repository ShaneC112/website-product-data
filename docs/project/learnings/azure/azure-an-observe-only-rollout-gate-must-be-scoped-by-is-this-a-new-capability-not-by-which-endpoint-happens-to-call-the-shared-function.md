# An observe-only rollout gate must be scoped by "is this a new capability", not by which endpoint happens to call the shared function

- **ID:** `azure-an-observe-only-rollout-gate-must-be-scoped-by-is-this-a-new-capability-not-by-which-endpoint-happens-to-call-the-shared-function`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## An observe-only rollout gate must be scoped by "is this a new capability", not by which endpoint happens to call the shared function

Gating live recovery execution behind an allowlist is meant to stage in the *new* ledger-driven
checkpoints (`render_source`, `extract_source`, `recover_missing_variants`, `extract_variants`,
`classify_images`, `compose`). `publish` reuses the same `executeRecovery` call from
`publishPreflightTrigger`, a pre-existing endpoint that predates this plan - gating it identically
means a previously-working operator action starts rejecting by default the moment the gate ships,
purely because of a later refactor that happened to route it through the same function.

**Decision:** asked rather than assumed. The user chose full uniformity (gate `publish` too,
accepting that `publishPreflightTrigger` now also requires the group to be allowlisted) over a
`publish`-specific exemption, since `publishPreflightTrigger` already returns a structured 409 for
any `executeRecovery` rejection - no behavior-shape change, just a new legitimate rejection reason.

**Best practice:** when a rollout gate's natural implementation point is a shared function called by
both new and pre-existing callers, that's an architectural fork worth surfacing explicitly rather
than picking the "least disruptive" default silently - the two options have real, different
operational consequences (a previously-live capability going dark by default vs. a genuinely uniform
gate), not just a style preference.

**Verification:** cover disabled-by-default, exact allowlist, and wildcard behavior directly in the
configuration test suite so rollout policy changes cannot silently widen access.

