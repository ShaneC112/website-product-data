# Deduping measurements must normalize units first, not just compare raw value+unit pairs

- **ID:** `data-deduping-measurements-must-normalize-units-first-not-just-compare-raw-value-unit-pairs`
- **Applies to:** `website-product-data`
- **Status:** Canonical learning detail.

## Learning

## Deduping measurements must normalize units first, not just compare raw value+unit pairs

`dedupeMeasurements` (used for `product.widths`) built its dedupe key from the raw
`value`/`unit` pair as extracted, so `400 cm` and `4 m` - the same physical width
from two different page passes or a range page vs. a variant page - survived as two
"different" entries in the same array instead of one.

**Fix:** normalize every measurement to metres (`normalizeMeasurementToMetres`,
reusing the existing `normalizeMeasurementToMm` unit table) before building the
dedupe key, and store the normalized value so Sanity's displayed widths are
consistent regardless of which source unit a given pass happened to extract.

**Best practice:** when deduping physical-unit values, always normalize to one
canonical unit first - comparing raw extracted strings/units is not equality, it's
just string equality that happens to work when every source agrees on units.

