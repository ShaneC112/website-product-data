# Documentation Link Migration Manifest

Status: canonical learning migration and active inbound-reference cleanup completed.

This manifest records the migration from large repository root READMEs and LEARNINGS files to indexed detail documentation. Before replacing a source document, record its headings, inbound links, and final disposition here.

## Scope

- `website-product-data`
- `website-product-enrichment-azure`
- `website-product-enrichment-render`
- `website-product-enrichment-ui`
- `website-product-enrichment-sanity-studio`

## Generated Inventory

The machine-readable [project documentation inventory](project-documentation-inventory.json) is the authoritative record of scoped repository package metadata, Git roots, root README headings and anchors, root-learning redirect state, recursive script sources, package aliases, AGENTS/customization status, and the dirty paths present when the inventory was generated. It also records the allowed migration disposition categories and each repository's disposition.

Generate the inventory with `npm run project:documentation:inventory`; validate stable facts with `npm run project:documentation:inventory:check`. Dirty paths are intentionally preserved as an inventory-time snapshot, so validation does not compare them to the current worktree. Neither mode reads or emits environment values.

## Link Rewrite Rule

Replace a generic root-learning navigation or README reference with the applicable area index. When the exact learning title is evident, link directly to its canonical detail. The detail pages and indexes are authoritative; their original source text is preserved as migration evidence.

Root learning catalogs are intentionally retained as redirects. `check-learning-root-references.mjs` blocks active inbound root references, including canonical learning detail pages. Historical plans and changelogs are explicitly outside this active-reference check.

## Script Index Follow-up

The shared [script catalog](../scripts/README.md) and every owned top-level `scripts/README.md` now form a bidirectional index. `script-index.json` records the complete executable-source inventory for Data, Azure, Render, and Studio, including helper-only and test-only modules; `npm run scripts:index:check` enforces that inventory and the owning-index coverage.
