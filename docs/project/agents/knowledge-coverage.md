# Agent and Skill Coverage

Maintained responsibility matrix for the managed workspace agents and skills. Canonical sources are listed in [workspace customizations](../../../workspace-customizations/agents/README.md); legacy root agents are excluded.

## Project Engineer

| Responsibility | Coverage |
| --- | --- |
| Purpose and triggers | Primary implementation, debugging, and review agent for product-enrichment work. |
| Owned decisions | Routine versus significant scope, local implementation path, focused validation, and when to recommend a plan or QA review. |
| Always-known facts | Data owns shared contracts; durable order is render, extract, classify, compose, publish; no unapproved live writes or Git actions. |
| Progressively loaded sources | Target `AGENTS.md`, closest code/test, then Data for shared behavior; architecture and relevant skills only as needed. |
| Excluded knowledge | Assumed volatile commands, undocumented ownership, or standing dependence on legacy agents. |
| Related repositories/plans | Data, Azure, Render, UI, Studio; architecture and approved significant-change plans. |
| Allowed tools/actions | Read, edit, search, execute, todo, and bounded read-only subagents; scoped code and test changes. |
| Overlap/hand-off | Hands durable docs/scripts to Project Knowledge; sends release readiness and mixed-worktree review to Project QA Commit; uses Architecture for ownership. |
| Latest verification evidence | Canonical agent source; `npm run agents:check`; [acceptance scenarios](acceptance-scenarios.md). |

## Project Knowledge

| Responsibility | Coverage |
| --- | --- |
| Purpose and triggers | Maintains project docs, README hierarchy, AGENTS, reusable scripts, learnings, maps, and workspace customizations. |
| Owned decisions | Canonical knowledge destination, hierarchy, planner-handoff acceptance/revision/rejection, evidence-backed learning shape, script documentation, and customization publication source. |
| Always-known facts | Canonical cross-repository knowledge lives in Data; customizations are edited only under `workspace-customizations/`. |
| Progressively loaded sources | Project README, relevant repository README/learning index, and closest operational script or implementation. |
| Excluded knowledge | Invented commands, guarantees, architecture, production behavior, versions, or changelog claims. |
| Related repositories/plans | All five product repositories; docs, scripts, learnings, migration, future, and decision plans. |
| Allowed tools/actions | Read, edit, search, execute, todo, and bounded discovery; documentation and customization maintenance. |
| Overlap/hand-off | Reviews Planner documentation recommendations, independently verifies facts and duplication, owns canonical edits, receives durable knowledge changes from Engineer, and supplies documentation review evidence to QA Commit. |
| Latest verification evidence | `npm run docs:check`; `npm run scripts:index:check`; `npm run workspace:sync:check`; `npm run agents:check`. |

## Project Planner

| Responsibility | Coverage |
| --- | --- |
| Purpose and triggers | Researches significant or unclear changes and writes implementation-ready plans before code changes begin. |
| Owned decisions | Plan decomposition, dependency order, explicit assumptions and unknowns, acceptance criteria, approval boundaries, rollback/recovery requirements, and self-contained implementation handoff detail. |
| Always-known facts | Repository ownership, durable stage order, Data-first shared contracts, and the absolute prohibition on implementing a phase. |
| Progressively loaded sources | Workspace/Data instructions, architecture README and project map, relevant detail pages and learnings, repository docs, then controlling code and tests; phase files retain the targeted sources the implementer needs. |
| Excluded knowledge | Unverified current behavior, implicit product decisions, implementation authority, and permission to mutate live services or Git state. |
| Related repositories/plans | All five product repositories, `plan/<topic>/` overview/phase sets, and canonical current-state architecture docs. |
| Allowed tools/actions | Broad read-only repository/web/MCP research; writes only to the active plan topic folder, including a documentation recommendation handoff. |
| Overlap/hand-off | Receives significant-change routing from Project Engineer; submits `documentation-handoff.md` to Project Knowledge for independent review and final canonical decisions; stops after requesting plan approval, then hands approved execution back to Engineer or a named plan implementer. |
| Latest verification evidence | Canonical agent source; `npm run agents:check`; [acceptance scenarios](acceptance-scenarios.md). |

## Project QA Commit

| Responsibility | Coverage |
| --- | --- |
| Purpose and triggers | Final review, commit-ready assessment, SemVer recommendation, changelog review, and explicitly authorized local commits. |
| Owned decisions | Readiness findings, validation scope, SemVer recommendation, and whether documentation/release evidence is complete. |
| Always-known facts | Current code and tests are truth; session evidence suggests review candidates; commits, pushes, tags, and branch rewrites require explicit authorization. |
| Progressively loaded sources | Status/diff, controlling code/tests, current session evidence, then affected docs, indexes, maps, and changelogs. |
| Excluded knowledge | Authority to deploy, push, tag, mutate remote state, or infer commit approval. |
| Related repositories/plans | Changed product repositories, release metadata, and Project Knowledge outputs. |
| Allowed tools/actions | Read, edit, search, execute, todo, and review-oriented subagents; local commit only after explicit authorization. |
| Overlap/hand-off | Invokes Project Knowledge for durable documentation change; receives Engineer's focused validation and dirty-worktree escalation. |
| Latest verification evidence | Canonical agent source; targeted checks and affected repository `verify`; `npm run agents:check`. |

## Product Enrichment Architecture

| Responsibility | Coverage |
| --- | --- |
| Purpose and triggers | Routes features, bugs, contracts, stages, and ownership across product repositories. |
| Owned decisions | Shared-contract owner and repository/stage boundary; requires an ADR before moving durable responsibility. |
| Always-known facts | Data owns shared contracts; Azure durable orchestration; Render capture; UI operations; Studio schemas/workflows. |
| Progressively loaded sources | Architecture README and project map, then target implementation for volatile symbols and commands. |
| Excluded knowledge | Volatile symbols or commands not verified in the target repository. |
| Related repositories/plans | Data, Azure, Render, UI, Studio; architecture and decision records. |
| Allowed tools/actions | Read-only routing guidance; no implementation or remote action authority. |
| Overlap/hand-off | Guides Project Engineer; Project Knowledge records approved architecture decisions. |
| Latest verification evidence | [architecture](../architecture/README.md); `npm run docs:check`; `npm run agents:check`. |

## Product Enrichment Learnings

| Responsibility | Coverage |
| --- | --- |
| Purpose and triggers | Investigates recurring failures, regressions, invariants, and known traps. |
| Owned decisions | Which repository index/detail applies and whether evidence supports a durable learning. |
| Always-known facts | A learning needs symptom, root cause, invariant, prevention, and evidence. |
| Progressively loaded sources | Learnings README, only the applicable repository index, then its detail. |
| Excluded knowledge | Unverified experiments and future proposals. |
| Related repositories/plans | Repository learning indexes/details and recovery investigations. |
| Allowed tools/actions | Read-only knowledge lookup and evidence routing. |
| Overlap/hand-off | Project Knowledge maintains accepted learnings; Engineer validates against current code. |
| Latest verification evidence | `npm run learnings:roots:check`; `npm run docs:check`; `npm run agents:check`. |

## Product Enrichment Scripts

| Responsibility | Coverage |
| --- | --- |
| Purpose and triggers | Reuses, extends, indexes, or safely creates non-trivial repeatable scripts/runbooks. |
| Owned decisions | Reuse versus new-script choice, safety classification, guard requirement, and catalog/index coverage. |
| Always-known facts | New write/destructive scripts need clear inputs, no secrets, confirmation guard, and index entry. |
| Progressively loaded sources | Cross-repository script catalog, then owning `scripts/README.md`. |
| Excluded knowledge | Ordinary product code, disposable one-line inspection, embedded secrets, and unguarded writes. |
| Related repositories/plans | Data, Azure, Render, Studio script indexes and operational runbooks. |
| Allowed tools/actions | Documentation and script-routing guidance; creation only under the documented safety gate. |
| Overlap/hand-off | Project Knowledge maintains entries; M2CRM and Live E2E supply operational boundaries. |
| Latest verification evidence | `npm run scripts:index:check`; `npm run agents:check`. |

## M2CRM Product Inspection

| Responsibility | Coverage |
| --- | --- |
| Purpose and triggers | Inspects M2CRM products, custom fields, and crawl snapshots, including a Victoria Carpets lookup. |
| Owned decisions | Selection of a documented read-only Azure alias and applicable runbook. |
| Always-known facts | Credentials stay secret; queue/state reset, deploy, and downstream writes need fresh approval. |
| Progressively loaded sources | Azure scripts index and M2CRM inspection/snapshot runbook. |
| Excluded knowledge | Queue/state mutation and undocumented live access. |
| Related repositories/plans | Azure operational scripts and vendor evidence plans. |
| Allowed tools/actions | Documented read-only inspection only. |
| Overlap/hand-off | Live E2E governs escalation to side-effecting work; Engineer uses findings as evidence. |
| Latest verification evidence | Canonical skill source; [acceptance scenarios](acceptance-scenarios.md); `npm run agents:check`. |

## Product Enrichment Validation

| Responsibility | Coverage |
| --- | --- |
| Purpose and triggers | Selects focused validation for product-enrichment changes. |
| Owned decisions | Smallest behavior-scoped check and when broader repository verification is warranted. |
| Always-known facts | Build Data before consumers after shared changes; retry Azure's isolated cross-file `TS2451` once. |
| Progressively loaded sources | Target package scripts, focused tests, and relevant validation commands. |
| Excluded knowledge | Remote writes and claims beyond executed evidence. |
| Related repositories/plans | All five repositories and acceptance/rollout plans. |
| Allowed tools/actions | Local builds, tests, lint/type checks, and repository `verify`. |
| Overlap/hand-off | Engineer executes selected checks; QA Commit assesses their release sufficiency. |
| Latest verification evidence | `npm run verify`; `npm run agents:check`. |

## Product Enrichment Live E2E

| Responsibility | Coverage |
| --- | --- |
| Purpose and triggers | Plans or performs a live end-to-end pipeline run. |
| Owned decisions | Side-effect inventory and approval stop before each protected live operation. |
| Always-known facts | Local validation/read-only inspection may proceed; reset, enqueue/drain, deploy, migration, and Sanity write need fresh approval. |
| Progressively loaded sources | Azure local live-E2E runbook and safety policy. |
| Excluded knowledge | Implied approval for protected remote actions. |
| Related repositories/plans | Azure E2E runbook, Render capture, UI operations, and rollout plans. |
| Allowed tools/actions | Planning, local validation, and read-only inspection; protected actions only after approval. |
| Overlap/hand-off | M2CRM inspection remains read-only; Engineer stops and asks for approval at a protected boundary. |
| Latest verification evidence | Canonical skill source; [acceptance scenarios](acceptance-scenarios.md); `npm run agents:check`. |
