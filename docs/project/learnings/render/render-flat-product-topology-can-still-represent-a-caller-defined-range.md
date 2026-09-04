# Flat product topology can still represent a caller-defined range

- **ID:** `render-flat-product-topology-can-still-represent-a-caller-defined-range`
- **Applies to:** `website-product-enrichment-render`
- **Status:** Canonical learning detail.

## Learning

## Flat product topology can still represent a caller-defined range

Wood Innovations exposes independent `/product/{slug}/` pages rather than a stable range page. For Aspekt 12mm, the authoritative range membership was a caller-supplied set of Portland Oak, Harbourside Oak, and Savanna Oak URLs.

**Fix:** use Azure's `SpecifiedUrls` flow and let each product page emit one variant capture. Parse `.content-product .wysiwyg` for descriptions and labeled facts, feature image alt text for capabilities, the first full-size gallery link for the swatch, and the on-page Technical Data Sheet link for PDF evidence.

**Challenges:** the live HTML does not guarantee attribute order, optional links can be malformed, and a prior renderer process can retain an old vendor registry after a rebuild. Attribute extraction is now order-independent, optional URLs resolve without throwing, and live verification requires a freshly started renderer.

**Best practice:** preserve caller-defined grouping separately from page topology, derive image roles from verified gallery position, compute document provenance from resolved hosts, and trace manifest counts without logging full page content.

