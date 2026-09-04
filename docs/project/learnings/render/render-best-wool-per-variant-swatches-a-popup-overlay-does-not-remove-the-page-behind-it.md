# Best Wool per-variant swatches: a popup overlay does not remove the page behind it

- **ID:** `render-best-wool-per-variant-swatches-a-popup-overlay-does-not-remove-the-page-behind-it`
- **Applies to:** `website-product-enrichment-render`
- **Status:** Canonical learning detail.

## Learning

## Best Wool per-variant swatches: a popup overlay does not remove the page behind it

A pgid-deep-linked variant page (`?pgid=<componentId>-<itemId>`) loads Wix's
pro-gallery widget straight into its expanded popup state. The initial fix assumed
the underlying thumbnail grid (`[id^="pro-gallery-comp-"]`, queried by
`captureBestWoolLiveData` into `domGalleries`) would be *empty* on these pages,
since the popup - not the grid - is what's actually visible. That was wrong: the
popup is an overlay, not a replacement, so the full range page (and its grid) is
still there in the DOM underneath it. `domGalleries` came back non-empty on every
variant page - but it always reflected that page's own static/default cover item
(the range's first item), never the item the page had actually deep-linked to via
`pgid`.

`buildBestWoolVendorStateFromLiveData`'s merge logic prioritised the popup capture
over `domGalleries` only when `domGalleries` was *empty*. Since it was never empty,
every deep-linked variant page's `vendorState.galleries` (and therefore its
`vendorProductPage.variants[0].url`/`swatchImageUrl`) got stamped with the range's
default item - so every variant swatch resolved to the same image except the one
variant that happened to share that default item.

**Fix:** thread `pageRole` (`RenderRequestT['pageRole']`) through
`resolveVendorState` → `resolveBestWoolVendorState` →
`buildBestWoolVendorStateFromLiveData`, and prioritise the popup capture whenever
`pageRole === 'variant'`, regardless of whether `domGalleries` is empty - not just
as a fallback for the empty case. `domGalleries` is still trusted (and needed, to
merge in `swatchImageUrl`/`swatchHex` per item) for the **range** page's own
click-through walk, where it correctly reflects every item visited so far.

**How it was found:** the data looked plausible at every earlier layer (render-level
popup capture was verified correct via debug blobs; the extraction pipeline ran
without errors) - the bug only became visible by directly querying
`webcrawlvariantswatches` for all of a group's rows at once and noticing every row
had the *identical* `variantUrl`/`selectedSwatchUrl`, which is the signature of "one
item's data got broadcast to every row" rather than "some items are missing data".
Comparing the captured itemIds against the real site's actual `?pgid=` values
(gathered by manually opening the gallery in a browser) confirmed the popup capture
itself was fine and pinned the bug to the merge step.

**Lesson:** "is X empty" is a fragile signal for "which code path applies" when X's
emptiness depends on incidental DOM/timing behaviour rather than something
explicit like the page's own declared role. Prefer an explicit, request-level
signal (`pageRole`) over inferring intent from a data shape that can be non-empty
for the wrong reason.

