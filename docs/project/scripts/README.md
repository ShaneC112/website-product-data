# Script Catalog

Use a documented repository script for repeatable non-trivial work. Each catalog entry should state its purpose, inputs, side effects, safety level, prerequisites, and validation command.

## Current Workspace Tools

| Repository | Command | Purpose | Inputs | Side effects | Safety | Prerequisites | Validation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Data | `npm run workspace:sync` | Publish explicit canonical workspace customizations | Managed source mappings | Writes managed files in the workspace root | Writes workspace-visible files | None | `npm run workspace:sync:check` |
| Data | `npm run workspace:sync:check` | Detect customization drift | Managed source mappings | Read-only | Read-only | None | Exit status 0 |
| Data | `npm run agents:check` | Run the agent-governance coverage check | Canonical workspace customizations and agent-governance docs; `check-agent-governance.mjs` | Read-only | Read-only | Run from Data with npm | Exit status 0 |
| Data | `npm run agents:evaluate:check` | Validate the versioned read-only agent evaluation corpus | Agent evaluation fixture | Read-only | Read-only | Run from Data with npm | Exit status 0 |
| Data | `npm run agents:evaluate -- --case <id> --response <json-file>` | Screen a saved agent response against one scenario's required evidence criteria | Selected fixture case and a saved structured response | Read-only | Read-only; no agent is invoked by this command | Response JSON follows [agent evaluation](../agents/agent-evaluation.md) | Review scorecard; required failure scores `0` |
| Data | `npm run project:inventory` | Validate the project map against package metadata and Git roots | Project map and sibling package metadata | Read-only | Read-only | Five repositories are adjacent to Data | Exit status 0 |
| Data | `npm run project:documentation:inventory` | Generate the checked-in migration inventory, including the current dirty-path snapshot | Five scoped repository roots and project map | Documentation-only local write | No remote access; does not read environment values | Five repositories are adjacent to Data | `npm run project:documentation:inventory:check` |
| Data | `npm run project:documentation:inventory:check` | Validate package, Git, README, learning redirect, script, and agent/customization facts in the generated migration inventory | [Documentation inventory](../migration/project-documentation-inventory.json) and five scoped repository roots | Read-only | Read-only; dirty paths remain an inventory-time snapshot | Five repositories are adjacent to Data | Exit status 0 |
| Data | `npm run learnings:<area>:migrate` | Normalize the canonical area details and scan-first index, preserving each learning body | Existing canonical details | Writes `docs/project/learnings/<area>/` | Documentation-only write | Run from Data with npm | `npm run learnings:<area>:check` |
| Data | `npm run learnings:<area>:check` | Verify canonical detail metadata, preserved learning body, and index membership | Canonical details and index | Read-only | Read-only | Canonical details exist | Exit status 0 |
| Data | `npm run learnings:roots:check` | Block unallowlisted active references to root learning catalogs | Scoped repository text files | Read-only | Read-only | Five repositories are adjacent to Data | Exit status 0 |
| Data | `npm run scripts:index:check` | Enforce the manifest classification and owning-index coverage of all top-level Data, Azure, Render, and Studio script sources | [Script index manifest](script-index.json) and owning script indexes | Read-only | Read-only | Four repositories are adjacent to Data | Exit status 0 |
| Azure | [Azure scripts index](../../../../website-product-enrichment-azure/scripts/README.md) | Catalog operational Azure scripts, helper-only modules, test modules, and their npm aliases | Azure `scripts/` and `package.json` | Documentation-only | Read-only index | Build before direct TypeScript execution | Run `npm run verify` in Azure |
| Render | [Render scripts index](../../../../website-product-enrichment-render/scripts/README.md) | Catalog operational Render scripts, test modules, and npm aliases | Render `scripts/` and `package.json` | Documentation-only | Read-only index | npm in Render | Run `npm run verify` in Render |
| Studio | [Studio scripts index](../../../../website-product-enrichment-sanity-studio/scripts/README.md) | Catalog operational Studio scripts and pnpm aliases | Studio `scripts/` and `package.json` | Documentation-only | Read-only index | pnpm in Studio | Run `pnpm verify` in Studio |

Each owning index links back here; `npm run scripts:index:check` rejects a missing backlink, unindexed source, missing documented/helper classification, or an incorrectly classified test source.
