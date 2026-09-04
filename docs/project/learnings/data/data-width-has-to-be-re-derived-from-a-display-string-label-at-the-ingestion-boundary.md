# Width has to be re-derived from a display-string label at the ingestion boundary

- **ID:** `data-width-has-to-be-re-derived-from-a-display-string-label-at-the-ingestion-boundary`
- **Applies to:** `website-product-data`
- **Status:** Canonical learning detail.

## Learning

## Width has to be re-derived from a display-string label at the ingestion boundary

`ExtractedWidthSlot` (`vendorProductPage.widths` / `variant.widths`) is `{widthLabel:
string}`, e.g. `"4 m"` - the structured `{value, unit}` measurement that
extraction actually produces is flattened into a display string by
`buildWidthSlots` (azure) before it ever reaches the shared blob. Any
unit-normalized physical-size comparison downstream (the width parent/child
model) has no structured data to work with unless it re-parses that label.

**Best practice:** `readWidthSlot` in `ingestion.ts` parses `"${value} ${unit}"`
back into a measurement deliberately narrowly (exact format only) rather than
attempting a general free-text width parser - the format is fully controlled by
`buildWidthSlots` on the write side, so a strict parse is safe and any drift in
that format would be a build-time contract change, not a runtime data
surprise. `areMeasurementSetsEquivalent` (unit-normalized to mm) is the reusable
comparison utility for this and future product-default/child-override fields
(`packInfo`, pattern fields).

