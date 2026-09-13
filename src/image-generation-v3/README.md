# Image Generation V3 Contracts

This folder holds only the V3 contracts that genuinely cross the Studio ⟷ Azure boundary, plus the shared vocabulary and versioning that V3 requires:

- **`contracts/`**: Guarded-control operations that Studio and Azure both parse and validate.
- **`registry/`**: Product-family keys, eligibility terms, route/version vocabulary owned by Data, independent of whether Studio reads it directly.
- **`versioning/`**: Per-contract upcast rules and compatibility dispositions, following existing `website-product-data` conventions.
- **`cache-compatibility/`**: Compatible optional metadata fields for existing reusable template cache entries.

All other V3 types — master requests, workflow plans, feature results, FLUX events, provider operations, journals, milestone receipts — are Azure-internal and live in `website-product-enrichment-azure/src/sanity-images-v3/shared-contracts/` and `journals/`, not here. They are never read or written by Studio.
