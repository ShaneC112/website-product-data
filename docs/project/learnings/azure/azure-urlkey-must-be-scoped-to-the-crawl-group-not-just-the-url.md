# `urlKey` must be scoped to the crawl group, not just the URL

- **ID:** `azure-urlkey-must-be-scoped-to-the-crawl-group-not-just-the-url`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## `urlKey` must be scoped to the crawl group, not just the URL

The "duplicate width" dedup gate in `crawlRequestDispatcher.ts` claims a render **per
`urlKey`**, where `urlKey` was `computeUrlKey(canonicalUrl)` - a pure function of the URL
alone. This was correct for every vendor seen so far (Best Wool, Abingdon, Alternative
Flooring) because every one of their "duplicate width" products sharing one URL also
shared **one styleCode** - the second, third, etc. request just links onto the first
request's already-claimed page (`upsertCrawlUrlLink`, no re-render), and `crawlTransformWorker`
fans out one `webcrawlproductdetail` row per link, all correctly under that one shared
`sourceGroupKey`.

Victoria Carpets broke that assumption: its Burford Twist range has **two different
styleCodes** (40oz, 50oz), each in two widths (4m/5m), all four sharing **one** range URL.
Tracing the existing code confirmed a real, latent bug: `crawlTransformWorker.ts`'s
product-detail write loop, variant-detail write loop, swatch write loop, and aggregation/
group-state/publish-decide block are ALL keyed by the *transforming page's own*
`sourceGroupKey` - never the individual url-link's own group. If 40oz's request won the
render claim, 50oz's product-detail row would have been written into 40oz's partition
(wrong `styleCodeRaw`/pricing attribution), no variant/swatch rows would ever exist under
50oz's own partition, and 50oz's group-state would never be aggregated or published at all
(`getCrawlProductDetailsByGroup('...50OZ')` would find nothing → `publishWorker` throws
"crawl product details not found"). This was never triggered before because no prior
vendor put two different styleCodes on the same URL.

**Two fixes were considered:**
1. Make `crawlTransformWorker` iterate every distinct `sourceGroupKey` found among a URL's
   links and duplicate the variant/swatch/product-detail writes plus the aggregation/
   publish-decide across each one. Correct, but touches a large, intricate, already
   well-tested function across four separate concerns, and still leaves the whole-page
   evidence (`webcrawlpagedetail`) singly-owned by one group, requiring further synthesis.
2. **Scope `urlKey` itself to `(sourceGroupKey, url)`** via a new `computeGroupScopedUrlKey`
   in `urlCanonical.ts`, used only in `crawlRequestDispatcher.ts`. Requests sharing one
   styleCode still compute the same key (zero change to any existing "duplicate width"
   behavior - the existing test suite for it needed no changes beyond the key formula
   itself). Requests with different styleCodes now get genuinely separate
   `webcrawlpages` rows, each rendering/extracting/transforming/publishing completely
   independently - the multi-group-sharing-one-page problem simply cannot occur, by
   construction, so none of `crawlTransformWorker`'s per-group logic needed to change.

**Chose (2).** It's a much smaller, lower-risk change (one function + its one call site)
that structurally prevents the bug rather than patching every place it could leak out,
at the cost of rendering/extracting the same physical page twice (once per weight) instead
of once - an acceptable trade for a low-volume vendor page, and the render service's
request-cache means the underlying HTTP fetch is still only made once in practice.

**Lesson:** when a "dedup by X" mechanism is really standing in for "dedup within one
logical group," a narrower key that silently drops the group dimension will work by
coincidence for every case where the group happens to be constant across the dedup set -
until a new case breaks that coincidence. Prefer making the key's scope match the actual
invariant (here: one render can be shared only within one group) over teaching every
downstream consumer to cope with a key that spans multiple groups.

