# Product-Family Vocabulary Registry

This folder defines the Data-owned product-family keys, route identifiers, eligibility terms, and version vocabulary that Azure V3 uses to validate requests and choose a workflow definition.

**Exports:**
- `imageGenerationV3FamilyKeySchema` and enum: family identifiers (`plain-carpet`, future values)
- `imageGenerationV3RouteKeySchema` and enum: FLUX route/provider identifiers
- `imageGenerationV3WorkflowVersionSchema`: pinned workflow/family/route version identity
- `imageGenerationV3EligibilitySchema`: predicate to check if a request can run on a given family

Existing V2 registry vocabulary remains in the sibling `website-product-data/src/image-generation/registry/` folder.
