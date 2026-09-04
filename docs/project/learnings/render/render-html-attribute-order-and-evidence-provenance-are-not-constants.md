# HTML attribute order and evidence provenance are not constants

- **ID:** `render-html-attribute-order-and-evidence-provenance-are-not-constants`
- **Applies to:** `website-product-enrichment-render`
- **Status:** Canonical learning detail.

## Learning

## HTML attribute order and evidence provenance are not constants

The first Unnatural gallery parser required `href` to appear before `data-fancybox` in an anchor, even though HTML attribute order has no semantic meaning. Its technical PDF capture also stamped `sameDomain: true` without comparing the resolved PDF and page hosts.

**Solution:** identify Fancybox anchors first and parse `href` from their attribute text independently, then derive PDF provenance from normalized hostnames. Tests now reverse anchor attributes and exercise an external specification URL.

**Best practice:** regex-based HTML extraction must not encode attribute order, and trust metadata must always be computed from resolved evidence rather than assumed from the page currently being parsed.

