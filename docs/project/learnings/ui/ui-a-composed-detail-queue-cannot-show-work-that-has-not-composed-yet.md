# A composed-detail queue cannot show work that has not composed yet

- **ID:** `ui-a-composed-detail-queue-cannot-show-work-that-has-not-composed-yet`
- **Applies to:** `website-product-enrichment-ui`
- **Status:** Canonical learning detail.

## Learning

## A composed-detail queue cannot show work that has not composed yet

The review queue starts from `webcrawlgroupstate`, which is written only after a group reaches
composition. During rendering, batched extraction retry/split recovery, and image classification,
the run summary can show active work while the UI has no row to render.

**Best practice:** when extending workflow visibility, merge the most-advanced active run summary
into the read model rather than exposing Azure's internal dispatch, lease, or retry tables in the
browser. This keeps orchestration ownership in Azure while making long-running recovery visible to
operators.

