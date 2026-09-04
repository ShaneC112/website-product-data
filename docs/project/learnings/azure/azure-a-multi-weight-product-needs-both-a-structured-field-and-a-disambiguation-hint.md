# A multi-weight product needs both a structured field and a disambiguation hint

- **ID:** `azure-a-multi-weight-product-needs-both-a-structured-field-and-a-disambiguation-hint`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## A multi-weight product needs both a structured field and a disambiguation hint

Victoria Carpets' Burford Twist is sold at two weights (40oz, 50oz) from one shared range page.
Two related but separate problems surfaced once real data was pulled through the pipeline:

1. `pileWeight` was a free-text registry field, so it round-tripped as `"40oz and 50oz"` - a
   description of *both* weights glued together, not a usable per-product value. Fixed by making
   it a structured `measurement` field (`{ value: number, unit: string }`), exactly like
   `pileHeight`/`thickness`/`totalHeight` already were. This immediately surfaced a second, smaller
   bug: the shared single-measurement regex used in three places (`normalizeRegistryField.ts`'s
   `parseScalarMeasurement`, `tradeExtraction.ts`'s `readAiMeasurementField`, and the new
   `parsePileWeightMeasurement`) only accepted unit characters `[a-zA-Z%²/]+` - excluding digits -
   so ASCII `"g/m2"` (as opposed to the unicode `"g/m²"` superscript already used in registry
   examples) silently failed to parse. Broadened all three to `[a-zA-Z0-9%²/]+`.
2. Even with a structured field, the model still has no way to know **which** weight a given
   group's own copy should describe, since both weights share the exact same rendered page/
   evidence. Since the group-scoped `urlKey` fix (above) already makes each weight its own fully
   independent extraction run, the natural fix is a per-request hint: `pileWeightHint` on the
   crawl-request message, threaded onto the claimed `webcrawlpages` row, and appended to that
   group's AI system prompt only ("This is a multi-weight product; the weight you are extracting
   details for is 40oz."). A value of `"None Specified"` (any case) or blank/missing is normalised
   away entirely - ordinary single-weight products see no prompt change. There is no automatic
   m2crm-product-change sync trigger in this repo yet (only manual `/api/crawl/enqueue`), so for
   now the hint must be set manually per multi-weight product until that trigger exists and can
   read a recommended `properties.pile_weight` m2crm field (mirroring the existing
   `properties.website_crawl_*` convention).

**Lesson:** a field that concatenates multiple valid values into one string (here, two weights
glued together) is a strong signal the field is actually identity-dependent - the *value itself*
needs a caller-supplied disambiguator, not just a better parser. Fixing the data shape alone would
have left the model still guessing which of several equally-valid answers to give.

