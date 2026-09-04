# Prompt constraints need deterministic persistence guards

- **ID:** `azure-prompt-constraints-need-deterministic-persistence-guards`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## Prompt constraints need deterministic persistence guards

Live Carpet enrichment repeated feature claims across named booleans, generic
features, and catch-all text, while malformed widths still looked structurally
valid. Prompt wording alone could not guarantee one representation.

**Fix:** filter AI output against the active trade registry, enforce shaped
additional attributes, remove catch-all values already owned by named fields, and
keep named facts out of vendor product-page mirrors. Width validation uses explicit
length units and a six-metre physical bound, so `2000 cm` is rejected while a
plausible `2000 mm` synthetic laminate width survives even if its trade label says
Carpet. Rejections emit bounded server warnings, and publish telemetry reads the
canonical `fields[]` value.

**Best practice:** use prompts to steer model output, then enforce the same ownership
and shape rules deterministically before persistence. Validate physical quantities
by unit and scale rather than trusting potentially synthetic classifications.

