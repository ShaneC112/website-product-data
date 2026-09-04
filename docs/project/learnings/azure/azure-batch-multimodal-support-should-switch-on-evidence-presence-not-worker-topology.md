# Batch multimodal support should switch on evidence presence, not worker topology

- **ID:** `azure-batch-multimodal-support-should-switch-on-evidence-presence-not-worker-topology`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## Batch multimodal support should switch on evidence presence, not worker topology

Single-item extraction was the easiest place to prove the multimodal PDF path, but leaving batch
extraction on the old text-only path would have created behavior drift: the same product would be
handled differently depending on whether it happened to run singly or in a batch.

The fix was to keep one shared batch flow and branch only at request construction time:

- if no item in the batch has a curated PDF, keep using `requestChatCompletion(...)`
- if any item has a curated PDF, build one Responses API request with the batch JSON as
   `input_text` and the unique curated PDF URLs as `input_file`

This preserves the cheap text-only fast path for unaffected pages while ensuring curated-PDF pages
behave consistently regardless of batching topology.

**Best practice:** richer evidence paths should be selected by the evidence available on the item,
not by which queue or worker happened to process it.

