# Agent Governance

Canonical managed-agent sources are `website-product-data/workspace-customizations/.github/agents/`. `npm run workspace:sync` publishes them to the workspace path `.github/agents/`; `npm run workspace:sync:check` detects drift. Root agents absent from the canonical source are legacy, unmanaged files and are deliberately preserved by sync.

| Agent | Authority |
| --- | --- |
| Image V2 Prompt Reviewer | Performs read-only provenance and FLUX-quality review for BFL FLUX.2 Pro through Azure AI Foundry across Vision inputs, caches, deterministic renderers, final assembly, render transport, and image adherence. It cannot edit prompts, generate images, connect directly to BFL or FLUX MCP, or mutate pipeline state. |
| Project Engineer | Owns routine implementation routing, scope classification, focused validation, and plan/QA escalation. It cannot commit, deploy, push, or perform protected live actions without fresh authorization. |
| Project Implementor | Executes approved plans phase by phase, delegates bounded independent slices to cost-appropriate workers, and retains integration, review, and validation authority. It cannot infer plan approval or transfer protected-operation authority to a worker. |
| Project Knowledge | Owns canonical documentation, scripts, learnings, project maps, and workspace-customization maintenance in Data. It cannot invent behavior or perform remote mutations or commits. |
| Project Planner | Researches significant changes and writes approval-ready overview, phase, and documentation-handoff files. It recommends evidence-backed project-documentation changes for Project Knowledge review, but cannot edit canonical documentation, implementation files, or execute a phase. |
| Project QA Commit | Owns final readiness review, validation sufficiency, documentation reconciliation, and SemVer recommendations. It may make a local commit only after explicit authorization; it never pushes or performs remote mutations. |
| Project Sanity Developer | Implements bounded Sanity slices using installed-version evidence and focused Studio validation. It cannot delegate, deploy schemas/functions, apply migrations, mutate content, change dependencies, commit, or push without explicit approval; the parent retains integration and acceptance. |
| Project Sanity Reviewer | Performs read-only, version-aware review of Sanity plans, current code, and settled diffs across schemas, GROQ, TypeGen, Studio, Visual Editing, Portable Text, images, migrations, Blueprints, functions, webhooks, and frontend integrations. It cannot edit, execute, deploy, migrate, mutate, or delegate. |

Specialized plan implementation agents in the workspace root are legacy one-off files, not managed agents or standing dependencies. See [knowledge coverage](../../docs/project/agents/knowledge-coverage.md) and [acceptance scenarios](../../docs/project/agents/acceptance-scenarios.md).

External repositories reviewed for managed-agent skills, the exact source revisions, local adaptations, exclusions, licenses, and refresh procedure are recorded in the [upstream skill integration ledger](../.github/agents/UPSTREAM-SKILL-INTEGRATIONS.md).
