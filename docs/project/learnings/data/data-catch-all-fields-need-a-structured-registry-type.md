# Catch-all fields need a structured registry type

- **ID:** `data-catch-all-fields-need-a-structured-registry-type`
- **Applies to:** `website-product-data`
- **Status:** Canonical learning detail.

## Learning

## Catch-all fields need a structured registry type

Live enrichment data exposed `additionalFeatures` as string arrays even though
storage and review consumers require `{ description, value }` objects. Describing
the field as generic `text` left the AI prompt and schema contract in disagreement.

**Best practice:** give structured catch-all fields a distinct registry value type,
state the exact JSON shape in field guidance, and validate that shape before data
crosses a repository boundary. Keep named feature booleans in the `features`
category rather than duplicating them as display strings.

