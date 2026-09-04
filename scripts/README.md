# Data Scripts

| Script | Purpose | Side effects | Validation |
| --- | --- | --- | --- |
| `check-documentation.mjs` | Verifies canonical documentation presence, JSON metadata, local Markdown links, learning catalog integrity, and active root-learning references | local-read | `npm run docs:check` |
| `check-script-index.mjs` | Verifies required Data script catalog entries | local-read | `npm run scripts:index:check` |
| `project-inventory.mjs` | Validates repository package managers and stable commands, then reports their Git roots and versions | local-read | `npm run project:inventory` |
| `migrate-data-learnings.mjs <area> --write` | Normalizes canonical learning metadata and the area index while preserving every learning body | local-write: rewrites canonical files under `docs/project/learnings/<area>/` | `npm run learnings:<area>:check` |
| `migrate-data-learnings.mjs <area> --check` | Verifies canonical learning metadata, preserved learning bodies, and index membership | local-read | `npm run learnings:<area>:check` |
| `check-learning-root-references.mjs` | Blocks unallowlisted active references to root learning catalogs | local-read | `npm run learnings:roots:check` |
| `sync-workspace-customizations.mjs --check` | Reports managed workspace customization drift | local-read | `npm run workspace:sync:check` |
| `sync-workspace-customizations.mjs --write` | Publishes managed workspace customizations | local-write | `npm run workspace:sync` |
| `migrate-data-learnings.mjs <profile> --write` | Generates indexed detail pages from a root learning catalog | local-write | `npm run learnings:<profile>:check` |

Use the [cross-repository catalog](../docs/project/scripts/README.md) before creating a new repeatable script.
