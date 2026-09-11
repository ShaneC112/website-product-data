# Prompt contracts must follow the persistence boundary

- **ID:** `data-prompt-contracts-must-follow-the-persistence-boundary`
- **Applies to:** `website-product-data`
- **Status:** Canonical learning detail.

## Learning

`website-product-data` should export a prompt-feature type only when the persisted
value genuinely crosses the Sanity/Azure boundary. Those exports are type-only
descriptions of the persisted shape; they are not a home for an Azure feature's
runtime prompt model, Zod parser, or local convenience helper.

For the Flux prompt contracts, room and colour-design persisted values have that
shared boundary. A texture persisted shape may use the same treatment when it has
a shared consumer, while camera policy remains Azure-only. Swatch data is evidence
used by colour-design, not an independent prompt-stage contract.

**Prevention:** before adding or retaining a Data export, identify the persisted
field, producer, consumer, and repository boundary. Keep validation, transforms,
and runtime types in the Azure feature that owns the behavior.

See the Azure companion learning:
[`azure-prompt-feature-transforms-own-validation-and-runtime-shapes`](../azure/azure-prompt-feature-transforms-own-validation-and-runtime-shapes.md).