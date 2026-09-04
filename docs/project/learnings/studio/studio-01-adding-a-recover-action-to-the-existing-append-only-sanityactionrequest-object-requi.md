# Studio learning 01: Adding a `recover` action to the existing append-only `sanityActionRequest` object requi

- **ID:** `studio-01-adding-a-recover-action-to-the-existing-append-only-sanityactionrequest-object-requi`
- **Applies to:** `website-product-enrichment-sanity-studio`
- **Status:** Canonical learning detail.

## Learning

- Adding a `recover` action to the existing append-only `sanityActionRequest` object required
	relaxing its `force` field from `required()` to optional, since a Sanity object schema cannot
	conditionally require one field based on a sibling `action` value the way the zod discriminated
	union (`sanityActionRequestSchema` in `website-product-data`) already does. The zod schema stays
	the actual source of truth for per-action shape; the Studio object schema is a looser superset
	that just needs every field a request MIGHT need to be present and readable in the preview/
	history UI. Don't try to replicate the zod union's strictness in the Sanity schema layer.
