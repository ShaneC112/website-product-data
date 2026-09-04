# Extension Boundaries

The baseline pipeline is shared. Extensions are allowed only where vendor-specific business processing genuinely requires them.

## Vendor Modules

Render vendor modules are the current extension mechanism for deterministic browser interaction and vendor parsing. A module may handle host-specific DOM behavior and emit structured artefacts, but it cannot own durable ledgers, queue routing, recovery, publication gates, or shared contracts.

Before adding a module, first determine whether generic rendering, an existing module, a shared schema, or bounded configuration can solve the issue. Keep vendor knowledge close to its browser interaction code and record the proven source of truth in its vendor documentation.

## Deferred Vendor And Trade Flows

The vendor/trade stage-flow registry is an accepted future direction, not a runtime feature. If eventually justified by a concrete exception, selection precedence is vendor-and-trade, vendor-only, trade-only, then generic default. The selected patch must fail and retry on error; silent fallback would hide a processing defect.

Even under that future model, queue identity, ledgers, persistence, dispatch, retries, recovery, telemetry, validation, publication gates, and shared contracts stay common. Only bounded business-processing logic would vary.

Read the complete deferred design in [Vendor and trade stage flows](../future/vendor-trade-stage-flows.md).