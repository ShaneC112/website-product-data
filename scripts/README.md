# Data Scripts

See the [cross-repository script catalog](../docs/project/scripts/README.md) for the workspace index.

| Source module | Package alias | Purpose | Side effects | Validation |
| --- | --- | --- | --- |
| `check-documentation.mjs` | `npm run docs:check` | Verify canonical documentation, metadata, Markdown links, learning indexes, and active root-learning references. | **local-read** | Exit status 0 |
| `check-agent-governance.mjs` | `npm run agents:check` | Verify canonical managed agents and skills are documented and every required acceptance scenario is present. | **local-read** | Exit status 0 |
| `evaluate-agent-response.mjs` | `npm run agents:evaluate:check` | Validate the versioned, structured read-only agent-evaluation corpus. | **local-read** | Exit status 0 |
| `evaluate-agent-response.mjs` | `npm run agents:evaluate -- --case <id> --response <json-file>` | Screen a saved structured agent response against one scenario's weighted evidence criteria. | **local-read** | Review the emitted scorecard; a missed required criterion produces score `0`. |
| `check-script-index.mjs` | `npm run scripts:index:check` | Verify the manifest coverage and classification of all top-level script sources. | **local-read** | Exit status 0 |
| `project-inventory.mjs` | `npm run project:inventory` | Validate package managers, stable commands, Git roots, and versions. | **local-read** | Exit status 0 |
| `project-documentation-inventory.mjs` | `npm run project:documentation:inventory` | Generate the read-only five-repository documentation migration inventory. | **documentation-only local-write**; writes the checked-in manifest only. | `npm run project:documentation:inventory:check` |
| `project-documentation-inventory.mjs` | `npm run project:documentation:inventory:check` | Validate stable inventory facts while preserving dirty paths as an inventory-time snapshot. | **local-read** | Exit status 0 |
| `migrate-data-learnings.mjs` | `npm run learnings:<area>:check` | Verify canonical learning details and index membership for `data`, `azure`, `render`, `ui`, or `studio`. | **local-read** | Exit status 0 |
| `migrate-data-learnings.mjs` | `npm run learnings:<area>:migrate` | Normalize canonical learning details and indexes for `data`, `azure`, `render`, `ui`, or `studio`. | **documentation-only local-write**; run only with an explicit documentation migration request. | Run the matching `:check` alias |
| `check-learning-root-references.mjs` | `npm run learnings:roots:check` | Block unallowlisted active references to root learning catalogs. | **local-read** | Exit status 0 |
| `sync-workspace-customizations.mjs` | `npm run workspace:sync:check` | Detect managed workspace-customization drift. | **local-read** | Exit status 0 |
| `sync-workspace-customizations.mjs` | `npm run workspace:sync` | Publish canonical workspace customizations. | **local-write**; approval required before publishing. | `npm run workspace:sync:check` |

Standard package aliases are `npm run build`, `npm test`, and `npm run verify`; they are local build/test commands. `verify` runs the read-only checks above and must follow the package's npm workflow.
