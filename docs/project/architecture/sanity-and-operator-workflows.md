# Sanity And Operator Workflows

Azure and Studio apply separate gates to different decisions. This distinction prevents internal pipeline quality scoring from becoming an opaque editorial publishing rule.

## Draft Ingestion And Publish

After composition, Azure invokes the shared bridge mapper and evaluates `evaluateBridgeEligibility`. A product that fails this internal gate is held in Azure and no Sanity document is created. A passing product is written as a deterministic Sanity draft, using the shared identity to avoid duplicate drafts from concurrent delivery.

Studio applies the independent `evaluateStudioPublishReadiness` gate to editor-visible, fixable content. Editors publish through normal Studio workflow only after that gate passes. Pipeline-only scores and blockers are not persisted as Studio publication fields.

## Editorial Preservation

Re-crawls preserve editor changes at the `(variantId, field)` level. Unrelated source updates can still apply, while a conflicting source change is presented for an editor to accept or retain. The bridge contract is a compatibility boundary: a Studio change that removes or changes an Azure-written guaranteed field must update the shared bridge schema and its Studio guard test.

## Registry Synchronization

The Data field registry is authoritative. Azure projects eligible code-managed definitions into Sanity, while UI exposes the dry-run and approved apply operation. Directly mapped fields are not duplicated as Feature or Specification choices. UI never receives a Sanity write token; it validates and forwards the request to Azure's authenticated endpoint.

## Operator Surfaces

UI reads shared Azure storage through Data schemas and exposes validation, review, matching, swatch, and recovery workflows. Its writes are validated server-side and sent to Azure-owned functions. Studio Blueprint functions send narrow action references to Azure queues; browser code never receives Azure storage credentials or Function keys.

## Operator Action Transport

An operator action starts as a Sanity write, never a direct browser call to Azure. Studio writes a request document - either an append-only entry on an existing product (`sanityActionRequests[]`) for actions that target content already in Sanity, or a dedicated top-level document (for example `styleCodeImportRequest`) when the action must create content that does not exist in Sanity yet. A Blueprint document-event handler validates that request against the shared contract and forwards only a minimal reference (the document ID and request ID) to the `sanity-actions` queue, using server-only credentials the browser never sees.

Azure's queue worker treats the Sanity request document as the authoritative source of truth: it reads the current request from Sanity rather than trusting a fat queue payload, resolves live source data as needed, does the work, and patches progress and results back onto that same Sanity document as it proceeds - `processing`, then terminal outcomes, with structured per-outcome results (for example excluded, failed, held, or draft-created rows) rather than a single terminal status string that would make a mixed outcome unreadable. A destructive action that removes its own request document (a rebuild) logs its terminal outcome instead of attempting a status patch against a document that no longer exists.

The import-by-style-code workflow is the reference example: Studio's `Import by Style Code` pane creates a top-level `styleCodeImportRequest` document; the existing `sanity-actions` Blueprint function forwards its reference to Azure; Azure resolves the live M2CRM style-code group, fans out one crawl per eligible source row, and patches bounded `progressMessages` plus structured `successResults`/`failureResults` back onto that request document as each row's crawl reaches a terminal outcome. See `website-product-enrichment-azure/src/operator-actions/sanity/import-style-code/README.md` for the full walkthrough.

See the [UI README](../../../../website-product-enrichment-ui/README.md), [Studio README](../../../../website-product-enrichment-sanity-studio/README.md), and Data's [Sanity documentation](../../sanity/README.md).