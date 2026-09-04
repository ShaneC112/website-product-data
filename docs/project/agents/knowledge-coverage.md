# Agent and Skill Coverage

| Item | Purpose | Loads progressively | Excludes | Verification |
| --- | --- | --- | --- | --- |
| Project Engineer | Implements scoped product-enrichment changes with plan, dirty-worktree, scope, and cost gates | Target AGENTS, code, tests, architecture, and bounded low-cost subagents where sufficient | Significant unplanned changes, live writes, and commits without approval | Targeted build/test and scope gate |
| Project Knowledge | Keeps docs, scripts, learnings, and customizations current | Owning docs, scripts, and current implementation | Production behavior, versions, changelogs, commits | Docs, script-index, sync checks |
| Project QA Commit | Reviews readiness and creates authorized local commits | Changed paths, relevant rules, tests, and session evidence | Push, tag, deploy, live writes | Focused and repository verification |
| Architecture skill | Routes ownership and shared contracts | Project architecture and map | Volatile details | Project map check |
| Learnings skill | Finds demonstrated traps selectively | Learning indexes and details | Unverified assumptions | Link validation |
| Scripts skill | Reuses or safely creates repeatable procedures | Script catalogs and indexes | Embedded secrets and unguarded writes | Script-index check |
| M2CRM inspection skill | Uses read-only M2CRM tooling | Azure runbook and package scripts | Queue/state mutations | Alias resolution |
| Validation skill | Chooses focused verification | Target package scripts and tests | Remote writes | Repository verify |
| Live E2E skill | Plans approval-gated end-to-end runs | Azure runbooks and safety policy | Any live mutation without fresh approval | Explicit user approval |
