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

Extraction batching, retry splitting, and final single-item fallback remain Azure orchestration concerns. The UI displays final extraction output and confidence for human review but does not normalize away evidence that operators need to inspect.

See Render's [repository README](../../../../website-product-enrichment-render/README.md) and Data's [shared storage reference](../../../README.md#storage-and-messaging-reference).