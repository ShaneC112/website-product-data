# Review corrections: approval, republish, and hold diagnostics

- **ID:** `azure-review-corrections-approval-republish-and-hold-diagnostics`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## Review corrections: approval, republish, and hold diagnostics

An AI match with `requiresApproval` may be persisted as a proposal, but it must not populate
authoritative variant price, width, or pack overrides before approval. A `product_changed` request
must enqueue publication whenever recomposition is ready, including when the group was already
ready, or price-only changes remain stale in Sanity. Bridge hold reasons must be logged with group
and run context and persisted in run-summary telemetry; a held count alone is not actionable.

