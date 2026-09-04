# A prompt's instructed word range must shift by the actual length of any text prepended after generation, not a hardcoded assumption

- **ID:** `azure-a-prompt-s-instructed-word-range-must-shift-by-the-actual-length-of-any-text-prepended-after-generation-not-a-hardcoded-assumption`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## A prompt's instructed word range must shift by the actual length of any text prepended after generation, not a hardcoded assumption

`prepareRoomImagePrompt` prepends a deterministic `colourHeader()` line (colour name/family plus
hex) to the AI-written body, then validates the combined prompt is 220-350 words. The system
prompt asked the model for a fixed 212-342 word body, assuming the header is always exactly 8
words - but `colourHeader`'s length varies (colourFamily can be multiple words; hex is optional),
so a compliant body could still land the final prompt outside 220-350, forcing an unnecessary (and
identically-doomed) correction pass or an outright failure for a perfectly good AI response.

**Fix:** compute the header's actual word count per call and shift the instructed body range by
that exact amount (`220 - headerWordCount` to `350 - headerWordCount`) in both the initial system
prompt and the correction request, instead of a value hardcoded for one specific header shape.

**Best practice:** when a fixed range must survive a deterministic prefix/suffix being added after
generation, compute the prefix's contribution at call time - do not bake in an assumed length that
only holds for the fixture you tested with.

