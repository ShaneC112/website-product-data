# Range-wide specifications can live only inside a client-side modal

- **ID:** `render-range-wide-specifications-can-live-only-inside-a-client-side-modal`
- **Applies to:** `website-product-enrichment-render`
- **Status:** Canonical learning detail.

## Learning

## Range-wide specifications can live only inside a client-side modal

Westex's Suitability/Widths/Qualities specification and Features list are not present in the static
HTML or in any generic document capture; they are injected by a "Request a sample" modal that a
WordPress plugin populates only after a `.product-card` is clicked. The modal content is identical
across every colour in a range, so opening it for the first product card is sufficient evidence for
the whole range - there is no need to open it per colour.

**Fix:** added `captureWestexRangeSpecification()` (`src/vendors/westex/vendorState.ts`), invoked only
for `pageRole === 'range'`, which clicks the first `.product-card`, waits for
`.modal-sample__headline`, reads `.modal-sample__specification` key/value pairs and
`.modal-sample__feature-key` text, then closes the modal. The result is threaded into
`renderPage.ts`'s vendor-state fallback as `specRows`, and the `vendor-state.json` upload gate was
broadened from "only upload when `galleries.length > 0`" to also upload when `specRows.length > 0`,
otherwise this evidence would be captured but silently dropped before reaching Azure.

**Lesson:** a vendor's absence of specification evidence is not always a page-content gap - it can be a
capture gap where the evidence only exists behind a client-side interaction. Confirm this class of
vendor workflow with a real-network probe test (see `workflow.probe.test.ts` and the "Confirmed vs
unconfirmed workflows" convention in `website-product-enrichment-render/src/vendors/README.md`) before
concluding a vendor's evidence genuinely does not exist.
