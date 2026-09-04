# Sanity object arrays need deterministic item keys

- **ID:** `data-sanity-object-arrays-need-deterministic-item-keys`
- **Applies to:** `website-product-data`
- **Status:** Canonical learning detail.

## Learning

## Sanity object arrays need deterministic item keys

A live Azure-to-Sanity draft was successfully written but Studio could not edit its
`Available widths` list because the mapped `measurement` objects had no `_key`.

**Fix:** `buildSanityIngestionPlan` assigns a stable key to every product and
variant width object before it crosses the publishing boundary. The ingestion tests
assert the keys explicitly. Sanity may normalize the literal key when it writes a
document, but every array item must retain a unique `_key`.

**Best practice:** whenever ingestion creates an array of Sanity object values,
give each item a deterministic `_key` at the shared mapper. Test the serialized
plan, not only mock publisher call counts, because Sanity accepts a keyless write
that later becomes uneditable in Studio.

