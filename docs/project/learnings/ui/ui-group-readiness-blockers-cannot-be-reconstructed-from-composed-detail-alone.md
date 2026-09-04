# Group readiness blockers cannot be reconstructed from composed detail alone

- **ID:** `ui-group-readiness-blockers-cannot-be-reconstructed-from-composed-detail-alone`
- **Applies to:** `website-product-enrichment-ui`
- **Status:** Canonical learning detail.

## Learning

## Group readiness blockers cannot be reconstructed from composed detail alone

The product-detail route fetched group state but returned only reasons embedded in composed detail.
Range-completeness blockers are calculated at group level, so a stalled group could show `draft`
and an empty missing-field list with no explanation in the drawer.

**Fix:** parse `readinessReasonsJson` through the shared schema and merge/deduplicate it with
detail-derived reasons before returning the AI review payload.

**Best practice:** operator UI must show the authoritative state owner for each kind of blocker.
Do not infer group workflow state from page-level presentation data.

