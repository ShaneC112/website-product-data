# Static publication taxonomies must be shared with extraction

- **ID:** `data-static-publication-taxonomies-must-be-shared-with-extraction`
- **Applies to:** `website-product-data`
- **Status:** Canonical learning detail.

## Learning

## Static publication taxonomies must be shared with extraction

Free-text room values cannot safely drive a Sanity list, navigation, and room-image
generation at the same time. `suitableRooms` now uses one shared list across every
trade, while Azure filters AI values against the registry's `allowedValues` before
storage. The Sanity product-type mapper similarly transforms pipeline trade labels
instead of exposing them as public taxonomy values.

