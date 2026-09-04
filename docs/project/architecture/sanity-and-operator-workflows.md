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

See the [UI README](../../../../website-product-enrichment-ui/README.md), [Studio README](../../../../website-product-enrichment-sanity-studio/README.md), and Data's [Sanity documentation](../../sanity/README.md).