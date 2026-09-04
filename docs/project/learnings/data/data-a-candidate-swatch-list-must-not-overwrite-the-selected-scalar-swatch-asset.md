# A candidate swatch list must not overwrite the selected scalar swatch asset

- **ID:** `data-a-candidate-swatch-list-must-not-overwrite-the-selected-scalar-swatch-asset`
- **Applies to:** `website-product-data`
- **Status:** Canonical learning detail.

## Learning

## A candidate swatch list must not overwrite the selected scalar swatch asset

A Lano capture can retain a full popup image and a thumbnail as swatch candidates. Treating every
candidate as the scalar Sanity `swatchImage` upload target let the later thumbnail upload replace
the selected full-size image.

**Fix:** `swatchImageUrl` is authoritative for the scalar swatch target; secondary candidates stay
available for gallery classification but cannot claim that target. Surface-appearance palette
entries are also assigned stable `_key` values before entering Sanity arrays.

**Best practice:** preserve candidate evidence separately from the field that records a selection.
Any generated Sanity array item must receive a stable `_key` at the mapping boundary.

