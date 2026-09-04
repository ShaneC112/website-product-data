# Future Directions

This folder contains accepted design directions that are intentionally not implemented. Each note must name its trigger for reconsideration and preserve current architecture boundaries.

## Current Directions

- [Vendor and trade stage flows](vendor-trade-stage-flows.md): a future-only option for sparse vendor/trade business-process extensions, reconsidered only after a concrete exception cannot be addressed by existing vendor modules, shared contracts, or bounded configuration.

No future design authorizes a runtime schema, registry, handler, or behavior change by itself. Record an accepted implementation decision before work begins and keep shared queue, ledger, recovery, telemetry, validation, and publication behavior common unless that decision explicitly changes an ownership boundary.
