# Prompt allowed values still require a persistence guard

- **ID:** `azure-prompt-allowed-values-still-require-a-persistence-guard`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## Prompt allowed values still require a persistence guard

The Sanity room list, AI extraction output, and room-image requests need exactly the
same keys. Adding `allowedValues` to prompt guidance narrows model output but does
not guarantee it. Registry normalization now canonicalizes case and removes values
outside the shared `suitableRooms` list, and `normalizeAiFields` applies that guard
before the field is persisted.

**Best practice:** treat prompt enums as instructions and registry normalization as
the contract. Any value used by a static downstream schema must pass both.

