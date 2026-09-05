# Evidence And Extraction

Render captures vendor evidence in a real browser, while Azure interprets that evidence through common contracts and registry rules.

## Capture Boundary

Render accepts Azure-assigned render jobs, performs generic or vendor-specific browser interaction, and stores deterministic artefacts such as `page.html`, `page.jpg`, `elements.json`, `capture-manifest.json`, and, where needed, `vendor-state.json`. It also produces hidden-aware visible text. The completion message carries blob paths, page role, identity metadata, and the relevant capture counts.

Vendor-specific DOM selectors, popups, galleries, and label parsing stay in the corresponding Render vendor module. Azure stays vendor-agnostic and consumes structured artefacts through generic contracts.

## Bounded Storage

Full-fidelity evidence belongs in blobs. Azure Table records are compact indexes and operator previews, so they must never contain unbounded vendor text. For example, a compact product-page row records `widthCount`, while complete detail remains in `composed-detail.json`.

Transient render, extraction, and working artefacts use the crawl retention window. Durable product detail and run summaries remain available after transient state expires, keeping published-facing output traceable to its source evidence.

## Extraction Rules

Azure prefers Render's visible text to a fixed raw-HTML excerpt for model input, while retaining the original artefacts for review and diagnostics. Registry fields carry structural value types: a measurement list remains structured values rather than an ambiguous string. Prompt examples are format guidance, not data; realistic values must not be used as examples because a model can copy them into uncertain output.

## Width And Vendor-Specification Evidence (Confirmed, Do Not Re-Add)

Multi-width support already exists and is not something a repeated M2CRM row per width needs to solve on its own. A registry width field is an array (`ExtractedScalarMeasurement[]`), and `vendorProductPage.widths` is populated from that array, so one extraction pass over one page already carries every distinct width the page or its curated PDF states in one place (for example, a spec sheet stating "Available in 5 widths: 1m, 3.66m, 4m, 4.57m & 5m" parses into five separate width entries from a single row/urlKey). Confirm this before adding any new cross-row or cross-M2CRM-SKU width-aggregation feature; the gap is very likely narrower than "widths are missing."

`GenericVendorState.specRows` (`Array<{label, value}>`) is the established, vendor-agnostic channel for key/value vendor facts that are not present in static HTML at all (client-side-populated specification blocks, JS-hydrated modals, etc.). Render populates it per vendor; Azure's `readVendorSpecValue`/`readVendorSpecRows` already read it generically with zero vendor-specific Azure code (see `website-product-enrichment-azure/src/02-source-extract/process/tradeExtraction.ts`). Adding a new vendor's `Suitability`/`Widths`/etc. facts means producing `specRows` in that vendor's Render module, not adding an Azure-side parser. `vendor-state.json` is only uploaded when the vendor state is non-empty; a vendor whose only concept is `specRows` (no galleries) needs that upload gate to also check for non-empty `specRows`, not only `galleries.length > 0`.

A vendor's curated technical/specification PDF is only used by AI extraction when the Render module tags its captured `documentCaptures` entry with a `source` string present in Azure's `AI_PRODUCT_PDF_SOURCES` allowlist (see `tradeExtraction.ts`). A vendor-specific `source` tag (for example `westex-range-specification`) that is not in that allowlist is silently dropped before the AI ever sees the PDF - this looks like "missing specs" but is actually a one-line allowlist gap, not a render or extraction capability gap.

A curated PDF must be downloaded and sent to the model as inline file content, never as a URL. The model cannot fetch an arbitrary URL itself; `downloadPdfInputs` retrieves each curated PDF URL and returns it as an `input_file` with base64 `file_data`, and this is the only supported input shape for a PDF - `file_url` must never be sent. Treat a failed multimodal (PDF) call as recoverable, not fatal: fall back to the existing text-only extraction path and trace which path a given extraction took, rather than failing the whole extraction when the PDF download or multimodal call itself fails.

A vendor hint field's trust tier (bias-only, needing AI confirmation against page evidence, versus authoritative, overriding whatever the AI itself extracted) is a per-field business decision, not something to copy from an existing hint field's plumbing. `pileWeightHint`/`packInfoHint`/width hints are bias-only; `brandNameHint` is authoritative and force-overwrites the extracted `brandName` whenever present. Confirm the correct tier explicitly for a new hint field instead of pattern-matching an existing one.

Some vendor specification/feature content is injected client-side (by a WordPress plugin, a JS-rendered modal, etc.) and is genuinely absent from both the static page response and any curated PDF. That evidence can only be recovered by Render interacting with the live page (click, wait, read, close) - this is exactly why Render exists as its own browser-driven stage rather than a static fetch; do not attempt to recover this kind of evidence in Azure by fetching or regex-scanning HTML.

Authoritative output can be range-owned while its evidence is only present on a variant page (or vice versa); when that happens, lift the evidence into the range/variant contract with explicit origin metadata rather than leaving it stranded on the page that happened to expose it. A lower-authority absence must never downgrade a higher-authority already-resolved value (for example, a range pass finding no swatch must not overwrite a dedicated variant page's already-approved swatch) - source authority and current membership both matter in an asynchronous, multi-pass crawl.

Extraction batching, retry splitting, and final single-item fallback remain Azure orchestration concerns. The UI displays final extraction output and confidence for human review but does not normalize away evidence that operators need to inspect.

See Render's [repository README](../../../../website-product-enrichment-render/README.md) and Data's [shared storage reference](../../../README.md#storage-and-messaging-reference).