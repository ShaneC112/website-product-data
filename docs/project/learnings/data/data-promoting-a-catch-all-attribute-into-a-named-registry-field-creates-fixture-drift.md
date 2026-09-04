# Promoting a catch-all attribute into a named registry field creates fixture drift

- **ID:** `data-promoting-a-catch-all-attribute-into-a-named-registry-field-creates-fixture-drift`
- **Applies to:** `website-product-data`
- **Status:** Canonical learning detail.

## Learning

## Promoting a catch-all attribute into a named registry field creates fixture drift

`TOG rating` originally only appeared in downstream tests as an
`additionalSpecifications` entry. Once it was promoted into the Carpet registry as
the named field `togRating` (alongside `suitability` and `warranty`),
the shared registry change itself was straightforward - but consumer fixtures still
encoded the old catch-all representation. The production code was already
registry-driven; the stale assumptions lived in tests and docs.

**Best practice:** when a field graduates from catch-all to named registry entry,
review adjacent consumer fixtures and README examples immediately. Otherwise the
codebase drifts into a confusing state where the registry says one thing and the
tests/documentation still teach the old shape.

