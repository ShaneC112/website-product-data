# A width bug had four stacked root causes, and fixing the first one only made the next one visible

- **ID:** `azure-a-width-bug-had-four-stacked-root-causes-and-fixing-the-first-one-only-made-the-next-one-visible`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## A width bug had four stacked root causes, and fixing the first one only made the next one visible

A user report ("Abingdon widths show as a nonsensical sequence, Alternative
Flooring shows no width at all") turned out to need four independent fixes, each
of which looked complete in isolation until live testing exposed the next layer:

1. **Unbounded regex captures inside `<script>`/`<style>`.** `width[:\s]+([^<\n]+)`
   is only bounded by the next tag/newline - an inline `<style>` block can be many
   KB with no tag/newline inside it, so it silently captured huge chunks of CSS as
   the "width" value, which then fanned out into dozens of garbage entries when
   split on hyphens (CSS custom property names are hyphen-heavy). Fixed by
   stripping `<script>`/`<style>` before any regex runs
   (`stripScriptAndStyleBlocks` in `renderEvidence.ts`), plus a defensive
   `looksLikeCssOrMarkupNoise` check (length + CSS-syntax-token test) in
   `tradeExtraction.ts` independent of that stripping.
2. **Comma-separated width lists weren't split.** `parseWidthMeasurements` split on
   `-`/`/`/" to " but not `,`, so a real "2.5m, 4m, 5m" list parsed as one
   unparsable blob instead of three widths. One-line fix to the split regex.
3. **A fixed-size raw-HTML AI excerpt rarely reached real content on markup-heavy
   pages.** Probing a live Abingdon page directly showed its real width text sitting
   ~54,000 characters into the raw HTML - far past any reasonable excerpt size
   increase. Render already computes a hidden-aware, tag-free "visible text"
   rendering of the page (previously discarded after only recording its `.length`);
   swapping the AI excerpt to prefer that (uploaded now as `visible-text.txt`) fixed
   it, because visible text is both denser and typically an order of magnitude
   smaller than the raw HTML for the same page.
4. **The AI trigger only checked `requiredFields`.** Once the four required Carpet
   fields (title/description/productType/features) were satisfied by cheap
   heuristics, the AI was never called, so `width` (a "recommended" field) never got
   a chance regardless of evidence quality - this reproduced on multiple vendors,
   confirming it was a systemic gate, not a vendor-specific parsing gap. Fixed by
   checking every field the trade contract defines
   (`[...requiredFields, ...optionalFields]`) via `isRegistryFieldMissing`.

**Lesson:** when a live bug survives a fix that looks structurally correct and is
fully unit-tested, don't assume the fix is wrong - check whether the fix simply
unblocked the *next* layer that was previously unreachable. Each of the four causes
above was independently real and independently necessary; none of them was visible
without the one before it being fixed first (e.g. the AI-trigger gate meant the
excerpt-budget bug for Alternative Flooring was never even exercised until the gate
was widened).

