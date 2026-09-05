# Agent Governance

Canonical managed-agent sources are `website-product-data/workspace-customizations/.github/agents/`. `npm run workspace:sync` publishes them to the workspace path `.github/agents/`; `npm run workspace:sync:check` detects drift. Root agents absent from the canonical source are legacy, unmanaged files and are deliberately preserved by sync.

| Agent | Authority |
| --- | --- |
| Project Engineer | Owns routine implementation routing, scope classification, focused validation, and plan/QA escalation. It cannot commit, deploy, push, or perform protected live actions without fresh authorization. |
| Project Knowledge | Owns canonical documentation, scripts, learnings, project maps, and workspace-customization maintenance in Data. It cannot invent behavior or perform remote mutations or commits. |
| Project Planner | Researches significant changes and writes approval-ready overview, phase, and documentation-handoff files. It recommends evidence-backed project-documentation changes for Project Knowledge review, but cannot edit canonical documentation, implementation files, or execute a phase. |
| Project QA Commit | Owns final readiness review, validation sufficiency, documentation reconciliation, and SemVer recommendations. It may make a local commit only after explicit authorization; it never pushes or performs remote mutations. |

Specialized plan implementation agents in the workspace root are legacy one-off files, not managed agents or standing dependencies. See [knowledge coverage](../../docs/project/agents/knowledge-coverage.md) and [acceptance scenarios](../../docs/project/agents/acceptance-scenarios.md).
