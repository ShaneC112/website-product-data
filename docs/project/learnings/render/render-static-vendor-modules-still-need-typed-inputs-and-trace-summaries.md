# Static vendor modules still need typed inputs and trace summaries

- **ID:** `render-static-vendor-modules-still-need-typed-inputs-and-trace-summaries`
- **Applies to:** `website-product-enrichment-render`
- **Status:** Canonical learning detail.

## Learning

## Static vendor modules still need typed inputs and trace summaries

Penthouse and Unnatural parse deterministic HTML and do not need the generic renderer's hydrated `vendorState` or normalized `html`. Casting the orchestrator input to `any` hid that narrower dependency and weakened the render boundary.

**Solution:** define a shared static-manifest input as the generic input without those two runtime-only fields, remove the casts, and emit concise Penthouse manifest trace data matching the existing Unnatural diagnostics.

**Best practice:** model a narrower real dependency with a named type instead of satisfying a broader interface through `any`; log counts and selected evidence at vendor manifest boundaries so live drift can be diagnosed without dumping page content.

