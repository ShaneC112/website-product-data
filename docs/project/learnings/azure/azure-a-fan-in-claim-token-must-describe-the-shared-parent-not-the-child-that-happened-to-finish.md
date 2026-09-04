# A fan-in claim token must describe the shared parent, not the child that happened to finish

- **ID:** `azure-a-fan-in-claim-token-must-describe-the-shared-parent-not-the-child-that-happened-to-finish`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## A fan-in claim token must describe the shared parent, not the child that happened to finish

The variant completion barrier uses one ETag-protected marker on the parent range page. Legacy
transform jobs can lack a run ID; deriving their fallback marker from each child page's content
hash let separate children use separate claim values and recreate the duplicate parent-transform
race after membership was complete.

**Fix:** use the range URL key as the fallback token (`content:<rangeUrlKey>`). Every child that
reaches the same parent therefore competes for the same durable claim.

**Best practice:** an idempotency key for fan-in work must be derived only from the work shared by
all producers. Never include a producer-specific URL, content hash, or attempt value.

