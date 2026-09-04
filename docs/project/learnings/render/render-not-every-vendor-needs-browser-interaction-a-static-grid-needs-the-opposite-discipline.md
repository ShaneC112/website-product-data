# Not every vendor needs browser interaction - a static grid needs the opposite discipline

- **ID:** `render-not-every-vendor-needs-browser-interaction-a-static-grid-needs-the-opposite-discipline`
- **Applies to:** `website-product-enrichment-render`
- **Status:** Canonical learning detail.

## Learning

## Not every vendor needs browser interaction - a static grid needs the opposite discipline

Victoria Carpets' range page renders every variant card directly in the initial
HTML (`Sku_container__uKoxV`), with no popup, no per-variant link, and no lazy
hydration gating the data. The temptation, following the Best Wool/Abingdon
pattern, is to add a `page.evaluate()` DOM-collection block to `renderPage.ts` for
consistency - but that would be unneeded surface area: a plain raw-HTML regex
parse (`extractVictoriaVariants`) is sufficient and correct on its own, and is the
*only* extraction path for this vendor (no DOM-artefact fallback needed, unlike
Abingdon where the raw-HTML path is a fallback for when enriched tagging is
missing).

The other discipline this vendor forces: there is no per-variant URL to capture,
so `variantCaptures[].href` must be omitted rather than fabricated, and the
Burford Twist spec PDF (not linked anywhere on the page) must not trigger an
external-PDF-discovery exception - it is a manual AI Review upload that re-queues
the range instead.

**Lesson:** match the vendor's actual interaction model, not the shape of the last
vendor you implemented. A fully static grid should get a simpler implementation
(raw-HTML only, no DOM evaluate block) than a hydrated/popup-driven one - adding
unused DOM-collection machinery "for consistency" is unnecessary surface area, not
robustness.

