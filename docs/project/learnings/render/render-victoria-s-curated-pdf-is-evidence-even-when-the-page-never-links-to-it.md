# Victoria's curated PDF is evidence even when the page never links to it

- **ID:** `render-victoria-s-curated-pdf-is-evidence-even-when-the-page-never-links-to-it`
- **Applies to:** `website-product-enrichment-render`
- **Status:** Canonical learning detail.

## Learning

## Victoria's curated PDF is evidence even when the page never links to it

Victoria's Burford Twist range page still does not expose its spec PDF in the rendered DOM, so generic
document discovery from anchors/iframes/embed tags will never find it. Once Azure started forwarding the
upstream `productOnlinePdfUrl` from m2crm on the render request, render needed to treat that URL as a
first-class document capture and persist it in `capture-manifest.json` rather than assuming "not on the
page" means "not render evidence".

**Fix:** thread `productOnlinePdfUrl` into `buildVictoriaCaptureManifest()` and emit a
`documentCaptures[]` entry with source `m2crm-product-online-pdf` plus metadata describing the upstream
field origin.

**Lesson:** render evidence is not limited to facts rediscovered from the DOM. If upstream orchestration
already has a curated artefact URL that the downstream model must see, preserve it in the generic
manifest instead of forcing later stages to rediscover or infer it from page content.

