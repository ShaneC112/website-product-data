# Script Catalog

Use a documented repository script for repeatable non-trivial work. Each catalog entry should state its purpose, inputs, side effects, safety level, prerequisites, and validation command.

## Current Workspace Tools

| Repository | Command | Purpose | Inputs | Side effects | Safety | Prerequisites | Validation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Data | `npm run workspace:sync` | Publish explicit canonical workspace customizations | Managed source mappings | Writes managed files in the workspace root | Writes workspace-visible files | None | `npm run workspace:sync:check` |
| Data | `npm run workspace:sync:check` | Detect customization drift | Managed source mappings | Read-only | Read-only | None | Exit status 0 |
| Data | `npm run project:inventory` | Validate the project map against package metadata and Git roots | Project map and sibling package metadata | Read-only | Read-only | Five repositories are adjacent to Data | Exit status 0 |
| Data | `npm run learnings:<area>:migrate` | Normalize the canonical area details and scan-first index, preserving each learning body | Existing canonical details | Writes `docs/project/learnings/<area>/` | Documentation-only write | Run from Data with npm | `npm run learnings:<area>:check` |
| Data | `npm run learnings:<area>:check` | Verify canonical detail metadata, preserved learning body, and index membership | Canonical details and index | Read-only | Read-only | Canonical details exist | Exit status 0 |
| Data | `npm run learnings:roots:check` | Block unallowlisted active references to root learning catalogs | Scoped repository text files | Read-only | Read-only | Five repositories are adjacent to Data | Exit status 0 |

Repository-specific tooling will be indexed here as the existing runbooks are migrated.
