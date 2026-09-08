# Studio learning 34: The `imageGenerationSettings` document is a structure-owned singleton

- **ID:** `studio-34-the-imagegeneration-settings-document-is-a-structure-owned-singleton`
- **Applies to:** `website-product-enrichment-sanity-studio`
- **Status:** Canonical learning detail.

## Learning

Global image-generation settings belong in the fixed `imageGenerationSettings` Studio singleton. The desk structure opens that document by its schema type and document ID, and excludes the type from the generic document list.

## Resolution

The Phase 2a scaffold keeps the document intentionally empty except for a read-only note. Its document actions retain normal update and publish behavior while removing duplicate and delete actions. Future global prompt settings can be added to this document without changing the singleton ownership boundary.

## Best practice

For a Studio singleton, enforce the fixed identity and navigation in Structure, filter the type from generic lists, and enforce mutation restrictions through the document-action resolver. Do not rely on unsupported schema metadata or a hidden ordinary document type to provide singleton behavior.

## Verification checklist

- The schema is registered exactly once.
- Structure opens `imageGenerationSettings` by the fixed ID `imageGenerationSettings`.
- The type is excluded from generic document lists.
- Update and publish remain available, while duplicate and delete are unavailable.
- Focused schema, structure, action, and typecheck tests pass.
