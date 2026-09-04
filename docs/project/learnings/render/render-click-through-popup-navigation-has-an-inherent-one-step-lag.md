# Click-through popup navigation has an inherent one-step lag

- **ID:** `render-click-through-popup-navigation-has-an-inherent-one-step-lag`
- **Applies to:** `website-product-enrichment-render`
- **Status:** Canonical learning detail.

## Learning

## Click-through popup navigation has an inherent one-step lag

`captureBestWoolPopupVariants`'s click-through loop (used on range pages to walk
every gallery item via the popup's "Next" arrow) occasionally captures a stale
`pgid`/image one step behind the currently-displayed title, because the URL
updates before the popup's active image/heading visually catches up. A flat
`waitForTimeout(2500)` settle delay after each click (rather than polling for a
DOM signal, which this vendor's markup doesn't expose consistently) mostly avoids
it, and a collision-safe synthetic itemId (`${rawItemId}-${index}`) stops a
genuine new slide from being silently dropped/overwritten when it does happen.
This is a live, real-network timing issue - it does not reproduce reliably in
every run, so treat a single clean probe run as encouraging, not conclusive; the
regression coverage that matters here is the deterministic unit test in
`src/vendors/bestwoolcarpets/vendorState.test.ts`, not the live probe.

