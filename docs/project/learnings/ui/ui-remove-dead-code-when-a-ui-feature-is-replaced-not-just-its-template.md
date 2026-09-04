# Remove dead code when a UI feature is replaced, not just its template

- **ID:** `ui-remove-dead-code-when-a-ui-feature-is-replaced-not-just-its-template`
- **Applies to:** `website-product-enrichment-ui`
- **Status:** Canonical learning detail.

## Learning

## Remove dead code when a UI feature is replaced, not just its template

Replacing the "Field confidence" table (`reviewFieldRows`/`fieldColumns`/
`mapFieldRows` in `AiReviewDrawer.vue`, backed by `fieldRows` in the API response and
`AiReviewDetailField` in the shared types) with a direct JSON view of
`registryFields` left the old `fieldRows` plumbing computed and shipped over the
wire but never read by anything. Removed it end-to-end (server route, shared type,
route test) once confirmed nothing else referenced it - `grep` across `app/` and
`server/` for the old symbol names before deleting is the safest way to confirm a
type/field is truly dead, not just unused in the one file you were looking at.

