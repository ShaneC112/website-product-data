# Studio learning 02: The new recovery action's Azure receiver resolves `sourceGroupKey` from the product's `i

- **ID:** `studio-02-the-new-recovery-action-s-azure-receiver-resolves-sourcegroupkey-from-the-product-s-i`
- **Applies to:** `website-product-enrichment-sanity-studio`
- **Status:** Canonical learning detail.

## Learning

- The new recovery action's Azure receiver resolves `sourceGroupKey` from the product's
	`importMeta.styleCode` (documented assumption, matching `crawlRequestDispatcher`'s own
	`sourceGroupKey ?? styleCodeRaw` fallback) rather than storing `sourceGroupKey` directly on the
	Sanity product. If a product's `sourceGroupKey` is ever set explicitly and diverges from its
	styleCode, this action would target the wrong group - acceptable for now since that divergence
	doesn't currently occur in practice, but worth re-checking if `sourceGroupKey` becomes an
	independently-editable concept.
