# Documentation Link Migration Manifest

Status: canonical learning migration completed; inbound references remain under controlled follow-up.

This manifest records the migration from large repository root READMEs and LEARNINGS files to indexed detail documentation. Before replacing a source document, record its headings, inbound links, and final disposition here.

## Scope

- `website-product-data`
- `website-product-enrichment-azure`
- `website-product-enrichment-render`
- `website-product-enrichment-ui`
- `website-product-enrichment-sanity-studio`

## Initial Inventory

| Repository | Root README headings | Learning entries | Nested README nodes | Disposition |
| --- | ---: | ---: | ---: | --- |
| Data | 121 | 32 | 0 | 32 canonical learning details and index; root `LEARNINGS.md` redirects to the index |
| Azure | 59 | 58 | 18 | 58 canonical learning details and index; root `LEARNINGS.md` redirects to the index |
| Render | 22 | 21 | 15 | 21 canonical learning details and index; root `LEARNINGS.md` redirects to the index |
| UI | 28 | 13 | 0 | 13 canonical learning details and index; root `LEARNINGS.md` redirects to the index |
| Studio | 20 | 31 prose bullets | 0 | 31 canonical learning details and index; root `LEARNINGS.md` redirects to the index |

## Link Rewrite Rule

Replace a generic `LEARNINGS.md` navigation or README reference with the applicable area index. When the exact learning title is evident, link directly to its canonical detail. The detail pages and indexes are authoritative; their original source text is preserved as migration evidence.

Root `LEARNINGS.md` files are intentionally retained as redirects. `check-learning-root-references.mjs` blocks new active inbound root references while a narrow temporary allowlist tracks the remaining contextual references. Historical plans and changelogs are explicitly outside this active-reference check.
