# Future Directions

This folder contains accepted design directions that are intentionally not implemented. Each note must name its trigger for reconsideration and preserve current architecture boundaries.

## Current Directions

- [Vendor and trade stage flows](vendor-trade-stage-flows.md): a future-only option for sparse vendor/trade business-process extensions, reconsidered only after a concrete exception cannot be addressed by existing vendor modules, shared contracts, or bounded configuration.
- [Prompt guidance and feature provider boundaries](prompt-guidance-and-feature-provider-boundaries.md): future prompt versioning, deterministic validation, provider-neutral contracts, and post-image scene persistence built on the system-prompt groundwork already added to Azure v2.
- [FLUX prompt response caching](flux-prompt-response-caching.md): future SHA-256 fingerprinting of complete FLUX requests with validated Blob Storage reuse to avoid duplicate image-generation calls.
- [Flooring colour calibration](colour-calibration.md): future post-render flooring-region measurement and bounded colour correction for consistent product colour across roomshots.

No future design authorizes a runtime schema, registry, handler, or behavior change by itself. Record an accepted implementation decision before work begins and keep shared queue, ledger, recovery, telemetry, validation, and publication behavior common unless that decision explicitly changes an ownership boundary.
