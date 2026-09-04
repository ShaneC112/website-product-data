# Silent data-loss paths need a warn log, not just a `?? undefined`

- **ID:** `azure-silent-data-loss-paths-need-a-warn-log-not-just-a-undefined`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## Silent data-loss paths need a warn log, not just a `?? undefined`

`parseWidthMeasurements`/`readAiWidthField` discard any fragment/value that doesn't
look like a real `<number><unit>` measurement. Discarding bad data is the right
behavior (see above), but discarding it *silently* would have made this exact class
of bug invisible again in a different way - a future "why does this vendor never
show any width?" investigation would have no signal to start from. Added `logWarn`
calls (`[extractTradeDetail] discarded unparsable width value`,
`[readAiWidthField] discarded unparsable AI width value`) with the offending raw
text/value, mirroring the existing pattern in this file for other fallback-and-log
extraction failures (e.g. `enrichVariantColoursWithAi`'s JSON parse failure log).

