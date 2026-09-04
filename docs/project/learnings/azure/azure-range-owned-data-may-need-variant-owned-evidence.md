# Range-owned data may need variant-owned evidence

- **ID:** `azure-range-owned-data-may-need-variant-owned-evidence`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## Range-owned data may need variant-owned evidence

Quick-Step Capture composes its product from the range page, but its technical PDF is linked only
from variant PDP markup. Capturing that PDF only on a variant made it unavailable to the
authoritative range extraction and left thickness missing.

**Fix:** the renderer fetches the first in-range variant when rendering a Quick-Step range,
extracts its technical-document URL, and attaches it to the range manifest with explicit origin
metadata. Azure traces whether that PDF is included in the model input. The live extraction then
produced `9.0 mm` thickness, dimensions, and pack information.

**Best practice:** follow field ownership through composition, not just where a vendor happens to
render evidence. When authoritative output is range-owned but evidence is variant-owned, lift the
evidence to the range contract with transparent provenance.

