# Future Vendor and Trade Stage Flows

Status: future design, not approved for implementation.

## Intent

Allow sparse stage-local business-process patches when vendor evidence or an M2CRM trade requires one, without changing the generic enrichment architecture.

## Selection and Precedence

Selectors use authoritative M2CRM `vendorName` or `brandNameHint` and the upstream `trade` value. Resolution precedence is: vendor-and-trade, vendor-only, trade-only, then the generic default. A selected patch that fails must fail or retry according to the existing stage policy; it must not silently fall back to generic processing.

## Boundary

Only business processing may be patched. Queue identity, ledger persistence, dispatch, retries, recovery, telemetry, shared contracts, validation, and publication gates remain common. Existing Render vendor modules remain internal to generic rendering rather than becoming a cross-stage patch framework.

## Trigger

Reconsider this direction after a concrete Laminate, LVT, or vendor exception cannot be handled cleanly by an existing vendor module, shared contract, or bounded configuration setting. Capture evidence and decide the smallest owner-specific change before introducing a registry.

This note explicitly excludes runtime schemas, registries, handlers, and behavior changes.