# FLUX prompts must front-load furniture and omit meta-header formatting to prevent instruction decay

- **ID:** `azure-flux-prompts-must-front-load-furniture-and-omit-meta-header-formatting-to-prevent-instruction-decay`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## FLUX prompts must front-load furniture and omit meta-header formatting to prevent instruction decay

When furniture and primary focal points are buried 250+ words down in the final FLUX prompt beneath long negative prohibitions, ALL-CAPS meta-headers (`MANDATORY FURNISHING INSTRUCTION`), markdown checkboxes (`✓`), and CAD metrics, FLUX experiences instruction decay and truncates furniture rendering in many seeds.

### Root Cause

FLUX gives highest attention weight to early prompt text (first 100-200 words). Format-heavy meta-syntax (`MANDATORY`, `✓`) and repetitive negative phrasing (`do not tint, bleach, warm, cool, recolour`) distract the T5 encoder and waste attention budget.

### Durable Invariant

Final FLUX prompts must front-load room priority and furniture requirements within the first 100 words, convert markdown formatting and checklists to natural descriptive prose, consolidate duplicate colour lock instructions, and omit internal pipeline state strings (`Pattern: unresolved pattern contribution.`).

### Related Sources

- `website-product-enrichment-azure/src/sanity-images-v2/03-assemble/direct/handler.ts`
- `website-product-enrichment-azure/src/sanity-images-v2/prompt-features/scene/render.ts`
- `website-product-enrichment-azure/src/sanity-images-v2/prompt-features/colour-design/render.ts`
