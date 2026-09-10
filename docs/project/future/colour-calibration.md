# Flooring Colour Calibration

## Status

Future development. This capability is not implemented in the current image-generation v2 pipeline.

## Purpose

Prompt-level colour instructions cannot guarantee that FLUX renders the same flooring colour across different rooms, lighting conditions, camera exposures, and surrounding palettes. The current pipeline applies a strong canonical colour lock, but does not perform pixel-level correction or rejection.

This future stage would improve product consistency while preserving natural room lighting, texture, shadows, and furnishing design.

## Proposed Boundary

Colour calibration would run after the render provider returns an image and before media persistence. It would own flooring-region measurement, bounded colour correction, confidence scoring, and calibration diagnostics.

It would not own:

- authoritative product colour or variant identity;
- room architecture;
- scene composition;
- camera policy;
- FLUX transport;
- Sanity media attachment; or
- arbitrary whole-image colour grading.

The authoritative target remains the selected variant colour and canonical hex from the colour-design artifact.

## Proposed Workflow

1. **Reference target**

   Resolve the authoritative variant colour, canonical hex, and, when available, the approved swatch reference image. The hex is the numeric target; the swatch provides material and lighting context.

2. **Flooring segmentation**

   Detect the visible installed flooring region with a vision segmentation or image-classification step. Exclude furniture, walls, curtains, artwork, and other room elements. Preserve confidence and mask metadata with the render diagnostic.

3. **Colour measurement**

   Measure a robust median or trimmed-mean colour from the masked flooring region. Use CIE Lab or another perceptual colour space rather than comparing raw RGB values only. Measure representative regions separately when the floor contains strong shadow or highlight variation.

4. **Bounded correction**

   If confidence is sufficient, apply a local colour transform to the flooring mask only. Preserve texture, pile detail, shadows, highlights, occlusion, and local contrast. Do not flatten the floor to a uniform swatch or alter non-flooring content.

5. **Edge blending**

   Feather the mask around furniture and architectural boundaries to prevent halos, cut-outs, or visible correction edges.

6. **Validation**

   Calculate a perceptual colour difference such as Delta E between the corrected representative flooring colour and the canonical target. Record the score, mask confidence, and correction magnitude.

7. **Decision**

   Apply bounded correction only when the mask and confidence thresholds are met. Accept, warn, or reject according to product-specific tolerance. A low-confidence image should be flagged for review or regenerated rather than silently recoloured.

## Important Invariant

The target is the product's base flooring colour under the image's lighting, not one identical RGB value for every pixel. Sunlit and shadowed areas should remain visibly different while the flooring remains recognisably the same product colour across roomshots.

## Rollout Plan

- Add a report-only mode that measures flooring consistency without modifying images.
- Compare several room types and lighting conditions using the same variant.
- Establish product- and camera-aware Delta E tolerance bands.
- Add bounded correction behind an explicit feature flag.
- Add rejection and review diagnostics for low-confidence masks.
- Persist calibration metadata with the render manifest, not raw provider payloads or duplicate image bytes.

## Current Behaviour

The implemented colour-design feature uses the selected colour name and canonical uppercase hex in a repeated FLUX prompt lock. Supporting palette colours are restricted to non-flooring elements. This is the current control and must not be described as pixel-level calibration.

## Trigger for Implementation

Reconsider this direction when side-by-side roomshots show product-colour drift beyond an agreed tolerance, and when the team has approved the segmentation provider, correction ownership, confidence thresholds, retention of calibration metadata, and review or regeneration behaviour.
