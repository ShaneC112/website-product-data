# Extension Boundaries

The baseline pipeline is shared. Extensions are allowed only where vendor-specific business processing genuinely requires them.

## Vendor Modules

Render vendor modules are the current extension mechanism for deterministic browser interaction and vendor parsing. A module may handle host-specific DOM behavior and emit structured artefacts, but it cannot own durable ledgers, queue routing, recovery, publication gates, or shared contracts.

Before adding a module, first determine whether generic rendering, an existing module, a shared schema, or bounded configuration can solve the issue. Keep vendor knowledge close to its browser interaction code and record the proven source of truth in its vendor documentation.

Before adding a new capability to solve a symptom like "missing widths" or "missing specs/features," check whether the generic mechanism already exists and is only unwired for this vendor: `GenericVendorState.specRows` for vendor facts not in static HTML, the `AI_PRODUCT_PDF_SOURCES` allowlist for curated PDFs, and the registry's array-typed measurement fields for multi-value widths (see [Evidence and extraction](evidence-and-extraction.md#width-and-vendor-specification-evidence-confirmed-do-not-re-add)). A vendor-specific bug is usually a missing allowlist entry or an unpopulated `specRows`, not a missing pipeline feature.

Every vendor module that requires live browser interaction (clicking, waiting on client-rendered content, popups) to reach evidence not present in static HTML must anchor that workflow in a repeatable live test (a `*.probe.test.ts` against the real vendor site) plus a vendor README section recording the confirmed test URL and expected result (for example, an expected colour count after full pagination, and confirmation that one variant's popup/modal capture produced expected fields). A vendor without both is unconfirmed: the implementation may work, but has no evidence it works repeatably, and must be recorded as such in the vendor index.

## Deferred Vendor And Trade Flows

The vendor/trade stage-flow registry is an accepted future direction, not a runtime feature. If eventually justified by a concrete exception, selection precedence is vendor-and-trade, vendor-only, trade-only, then generic default. The selected patch must fail and retry on error; silent fallback would hide a processing defect.

Even under that future model, queue identity, ledgers, persistence, dispatch, retries, recovery, telemetry, validation, publication gates, and shared contracts stay common. Only bounded business-processing logic would vary.

Read the complete deferred design in [Vendor and trade stage flows](../future/vendor-trade-stage-flows.md).