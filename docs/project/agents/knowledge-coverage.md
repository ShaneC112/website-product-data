# Agent and Skill Coverage

Maintained responsibility matrix for the managed workspace agents and skills. Canonical sources are listed in [workspace customizations](../../../workspace-customizations/agents/README.md); legacy root agents are excluded.

## Image V2 Prompt Reviewer

| Responsibility | Coverage |
| --- | --- |
| Purpose and triggers | Handles the exact `review flux pipeline` command and read-only quality review of Image Generation V2 FLUX prompts, Vision-generated fragments, cache provenance, render handoff, and final-image adherence. |
| Owned decisions | Full prompt-producer inventory, earliest responsible defect layer, finding severity, provenance completeness, prioritized stage improvements, durable-knowledge candidate classification and handoff, and `READY`, `REVISE`, or `INSUFFICIENT EVIDENCE` verdict. |
| Always-known facts | The project uses BFL FLUX.2 Pro through Azure AI Foundry, never direct BFL or FLUX MCP; final prompt quality cannot be separated from fragment provenance; matching assembly/render hashes prove transport fidelity but not visual adherence; orchestrator quality gates do not transfer implementation ownership. |
| Progressively loaded sources | Image V2 FLUX Prompt Review skill, supplied run artifact or image, Azure instructions, generating prompts and schemas, normalization/cache/renderers, assembly, render route, and the prompt-provenance learning. |
| Excluded knowledge | Prompt edits, image generation, direct BFL/MCP access, model switching, queue/state mutation, deployment, Sanity writes, commits, and direct-API assumptions not implemented by the Azure adapter. |
| Related repositories/plans | Azure Image Generation V2 implementation, Data image-generation contracts, template/run artifacts, and official BFL prompt guidance. |
| Allowed tools/actions | Read, search, bounded local execution, web reference checks, visual inspection, and Project Knowledge delegation for evidence-backed canonical documentation; no implementation edits. |
| Overlap/hand-off | Engineer requests pre-edit and settled-change review; Planner requests current/proposed-impact research and writes checkpoints; Implementor requests pre-change and settled-phase review; QA Commit requests final-diff review and owns release findings. Project Engineer owns fixes, Project Knowledge owns durable discoveries, and the reviewer remains read-only. |
| Latest verification evidence | Canonical agent and skill sources; `image-v2-flux-provenance-review`; `npm run agents:check`; `npm run workspace:sync:check`. |

## Project Engineer

| Responsibility | Coverage |
| --- | --- |
| Purpose and triggers | Primary implementation, debugging, and review agent for product-enrichment work. |
| Owned decisions | Routine versus significant scope, local implementation path, focused validation, and when to recommend a plan or QA review. |
| Always-known facts | Data owns shared contracts; durable order is render, extract, classify, compose, publish; Azure server changes must comply with the canonical logging policy; prompt-affecting work requires read-only Image V2 review before edits and on the settled change; no unapproved live writes or Git actions. |
| Progressively loaded sources | Target `AGENTS.md`, closest code/test, then Data for shared behavior; Azure logging policy for Azure server code; other architecture and relevant skills only as needed. |
| Excluded knowledge | Assumed volatile commands, undocumented ownership, or standing dependence on legacy agents. |
| Related repositories/plans | Data, Azure, Render, UI, Studio; architecture and approved significant-change plans. |
| Allowed tools/actions | Read, edit, search, execute, todo, and bounded read-only subagents; scoped code and test changes. |
| Overlap/hand-off | Hands prompt provenance and quality review to Image V2 Prompt Reviewer without transferring implementation; hands durable docs/scripts to Project Knowledge; sends release readiness and mixed-worktree review to Project QA Commit; uses Architecture for ownership. |
| Latest verification evidence | Canonical agent source; `npm run agents:check`; [acceptance scenarios](acceptance-scenarios.md). |

## Project Sanity Reviewer

| Responsibility | Coverage |
| --- | --- |
| Purpose and triggers | Read-only review of Sanity plans, current code, and settled diffs involving schemas, GROQ, TypeGen, Studio structure/configuration, Visual Editing, Portable Text, images, migrations, Blueprints, functions, webhooks, or Sanity-backed frontend integration. |
| Owned decisions | Finding severity, installed-version compatibility constraints, applicable upstream reference selection, unresolved Sanity-specific risk, and focused validation recommendations. |
| Always-known facts | Upstream guidance is evidence rather than operational authority; Data owns shared contracts before Studio consumers; Studio owns schemas, UX, and Blueprint functions; Azure retains enrichment publication orchestration. |
| Progressively loaded sources | Sanity Best Practices and one or two relevant references, Studio instructions and package manifest, then the closest controlling code and tests. |
| Excluded knowledge | Edit, execute, delegation, deployment, migration application, content mutation, dependency changes, commits, pushes, or authority to accept implementation. |
| Related repositories/plans | Studio and Sanity-backed frontend integration, plus Data contracts and Azure publication boundaries that constrain the reviewed slice. |
| Allowed tools/actions | Read, search, and official web-source checks only. |
| Overlap/hand-off | Planner records findings in plans; Implementor and Engineer own fixes and integration; QA Commit owns release findings; Project Knowledge owns canonical documentation/customizations. |
| Latest verification evidence | Canonical agent and skill sources; `sanity-reviewer-readonly-plan-check`; `npm run agents:check`. |

## Project Sanity Developer

| Responsibility | Coverage |
| --- | --- |
| Purpose and triggers | Bounded implementation of approved Sanity schemas, GROQ, TypeGen, Studio, Visual Editing, Portable Text, image, migration, Blueprint, function, webhook, or frontend-integration slices. |
| Owned decisions | Smallest local implementation within the assigned manifest, installed-version-compatible API usage, and focused Studio validation. |
| Always-known facts | Studio uses pnpm; shared contracts begin in Data; Azure retains publication orchestration; the parent retains diff review, integration, broader validation, and acceptance. |
| Progressively loaded sources | Sanity Best Practices and one or two relevant references, Studio instructions and package manifest, assigned files, nearby tests, and parent-provided acceptance criteria. |
| Excluded knowledge | Agent delegation, unapproved dependency installation/upgrades, schema/function deployment, migration application, content mutation, commits, pushes, or architecture changes. |
| Related repositories/plans | Approved bounded Studio phases and Sanity-backed frontend slices after any required Data contract phase. |
| Allowed tools/actions | Read, edit, search, local execute, and official web-source checks inside the approved file and validation scope. |
| Overlap/hand-off | Implementor or Engineer assigns the slice and retains parent ownership; Sanity Reviewer provides independent read-only findings before and after applicable work. |
| Latest verification evidence | Canonical agent and skill sources; `sanity-developer-routing-and-approval-boundary`; `npm run agents:check`. |

## Project Implementor

| Responsibility | Coverage |
| --- | --- |
| Purpose and triggers | Executes an explicitly approved implementation plan or phase range with dependency-aware delegation, integration, review, and validation. |
| Owned decisions | Phase scheduling, bounded worker assignments, cost-versus-risk model class, integration order, review findings, and acceptance evidence. |
| Always-known facts | Data-first shared contracts; Azure server phases carry canonical logging requirements into assignments and review; prompt-affecting phases require reviewer evidence before changes and on the settled diff; workers cannot transfer approval; the parent owns diff inspection, validation, and acceptance. |
| Progressively loaded sources | Workspace and repository instructions, approved overview and phase files, Azure logging policy when applicable, then TDD, Validation, Reviewing Changes, and other skills only when triggered. |
| Excluded knowledge | Unapproved plan decisions, permission for protected live operations or Git actions, and trust in a worker report without inspecting current code. |
| Related repositories/plans | Approved plans across Data, Azure, Render, UI, and Studio. |
| Allowed tools/actions | Read, edit, search, execute, todo, bounded self-workers, and specialist agents; parallel writes only across independent disjoint manifests. |
| Overlap/hand-off | Receives approved plans from Project Planner or Engineer; uses Image V2 Prompt Reviewer read-only at prompt-affecting phase entry and acceptance, then independently reconciles findings; uses Project Knowledge for durable documentation and Project QA Commit for final release readiness. |
| Latest verification evidence | Canonical agent source; `project-implementor-cost-aware-parallel-review`; `npm run agents:evaluate:check`; `npm run agents:check`. |

## Project Knowledge

| Responsibility | Coverage |
| --- | --- |
| Purpose and triggers | Maintains project docs, README hierarchy, AGENTS, reusable scripts, learnings, maps, workspace customizations, and evidence-backed Image V2 FLUX knowledge handoffs. |
| Owned decisions | Canonical knowledge destination, hierarchy, domain vocabulary, planner and Image V2 reviewer handoff acceptance/merge/relocation/rejection/blocking, evidence-backed learning shape, script documentation, and customization publication source. |
| Always-known facts | Canonical cross-repository knowledge lives in Data; customizations are edited only under `workspace-customizations/`. |
| Progressively loaded sources | Project README, domain language when terminology is involved, relevant repository README/learning index, and closest operational script or implementation. |
| Excluded knowledge | Invented commands, guarantees, architecture, production behavior, versions, or changelog claims. |
| Related repositories/plans | All five product repositories; docs, scripts, learnings, migration, future, and decision plans. |
| Allowed tools/actions | Read, edit, search, execute, todo, and bounded discovery; documentation and customization maintenance. |
| Overlap/hand-off | Reviews Planner recommendations and Image V2 FLUX knowledge candidates, independently verifies facts and duplication, owns canonical edits, receives durable knowledge changes from Engineer, and supplies documentation review evidence to QA Commit. |
| Latest verification evidence | `npm run docs:check`; `npm run scripts:index:check`; `npm run workspace:sync:check`; `npm run agents:check`. |

## Project Planner

| Responsibility | Coverage |
| --- | --- |
| Purpose and triggers | Researches significant or unclear changes and writes implementation-ready plans before code changes begin. |
| Owned decisions | Plan decomposition, dependency order, explicit assumptions and unknowns, acceptance criteria, approval boundaries, rollback/recovery requirements, and self-contained implementation handoff detail. |
| Always-known facts | Repository ownership, durable stage order, Data-first shared contracts, prompt-affecting plans require reviewer research/checkpoints and quality criteria, and the absolute prohibition on implementing a phase. |
| Progressively loaded sources | Workspace/Data instructions, architecture README and project map, relevant detail pages and learnings, repository docs, then controlling code and tests; phase files retain the targeted sources the implementer needs. |
| Excluded knowledge | Unverified current behavior, implicit product decisions, implementation authority, and permission to mutate live services or Git state. |
| Related repositories/plans | All five product repositories, `plan/<topic>/` overview/phase sets, and canonical current-state architecture docs. |
| Allowed tools/actions | Broad read-only repository/web/MCP research; writes only to the active plan topic folder, including a documentation recommendation handoff. |
| Overlap/hand-off | Uses Image V2 Prompt Reviewer read-only for current-pipeline and proposed-impact evidence; submits `documentation-handoff.md` to Project Knowledge; stops after requesting plan approval, then hands approved execution back to Engineer or Project Implementor. |
| Latest verification evidence | Canonical agent source; `npm run agents:check`; [acceptance scenarios](acceptance-scenarios.md). |

## Project QA Commit

| Responsibility | Coverage |
| --- | --- |
| Purpose and triggers | Final review, commit-ready assessment, SemVer recommendation, changelog review, and explicitly authorized local commits. |
| Owned decisions | Readiness findings, validation scope, SemVer recommendation, and whether documentation/release evidence is complete. |
| Always-known facts | Current code and tests are truth; session evidence suggests review candidates; prompt-affecting final diffs require read-only Image V2 review and unresolved regression or missing provenance blocks release; Git actions require explicit authorization. |
| Progressively loaded sources | Status/diff, controlling code/tests, Azure logging policy for Azure server changes, current session evidence, then affected docs, indexes, maps, and changelogs. |
| Excluded knowledge | Authority to deploy, push, tag, mutate remote state, or infer commit approval. |
| Related repositories/plans | Changed product repositories, release metadata, and Project Knowledge outputs. |
| Allowed tools/actions | Read, edit, search, execute, todo, and review-oriented subagents; local commit only after explicit authorization. |
| Overlap/hand-off | Invokes Image V2 Prompt Reviewer for prompt-affecting final diffs while retaining release-readiness ownership; invokes Project Knowledge for durable documentation change; receives Engineer's focused validation and dirty-worktree escalation. |
| Latest verification evidence | Canonical agent source; targeted checks and affected repository `verify`; `npm run agents:check`. |

## Product Enrichment Architecture

| Responsibility | Coverage |
| --- | --- |
| Purpose and triggers | Routes features, bugs, contracts, stages, and ownership across product repositories. |
| Owned decisions | Shared-contract owner and repository/stage boundary; requires an ADR before moving durable responsibility. |
| Always-known facts | Data owns shared contracts; Azure durable orchestration; Render capture; UI operations; Studio schemas/workflows; canonical cross-repository terms live in the architecture domain-language page. |
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

## Diagnosing Bugs

| Responsibility | Coverage |
| --- | --- |
| Purpose and triggers | Disciplined diagnosis for hard, intermittent, or performance-related failures that need more than the routine local hypothesis loop. |
| Owned decisions | Reproduction-loop shape, minimization, ranked falsifiable hypotheses, narrow instrumentation, and representative regression-test seam. |
| Always-known facts | Evidence must detect the user's exact symptom; secrets are redacted; protected live actions retain their approval gates. |
| Progressively loaded sources | Target repository instructions, applicable Product Enrichment learning, closest failing path, and focused validation command. |
| Excluded knowledge | Product ownership changes, unapproved live mutations, shallow tests that cannot reproduce the bug, or commit authority. |
| Related repositories/plans | All product repositories and their repository-specific tests, learnings, and validation commands. |
| Allowed tools/actions | Local tests, fixtures, redacted traces, targeted instrumentation, profiling, and bounded read-only subagents. |
| Overlap/hand-off | Project Engineer retains implementation ownership; Validation selects checks; Project Knowledge records only evidence-backed recurring learnings. |
| Latest verification evidence | Canonical skill source; `hard-bug-red-capable-loop`; `npm run agents:check`. |

## Codebase Design

| Responsibility | Coverage |
| --- | --- |
| Purpose and triggers | Shared design discipline for module interfaces, real dependency seams, pass-through layers, and representative test surfaces. |
| Owned decisions | Interface-depth analysis, seam justification, testability observations, and local restructuring recommendations. |
| Always-known facts | Repository ownership and Data-first shared contracts override generic module advice; routine fixes do not become unsolicited refactors. |
| Progressively loaded sources | Target repository instructions, Product Enrichment Architecture when ownership is involved, controlling callers, and representative tests. |
| Excluded knowledge | Authority to move ownership, approve significant refactors, expose internals for tests, or introduce speculative adapters. |
| Related repositories/plans | All product repositories and significant plans that create or restructure modules. |
| Allowed tools/actions | Read-only design analysis under Planner; scoped implementation under Engineer after applicable change gates. |
| Overlap/hand-off | Architecture owns repository boundaries; Planner records significant designs; Engineer implements approved or routine local changes. |
| Latest verification evidence | Canonical skill source; `deep-module-within-product-ownership`; `npm run agents:check`. |

## Writing For Agents

| Responsibility | Coverage |
| --- | --- |
| Purpose and triggers | Writing discipline for AGENTS files, custom agents, skills, prompts, hooks, and other agent-primary documents. |
| Owned decisions | Pointer wording, progressive disclosure, completion criteria, duplication removal, and customization-specific review. |
| Always-known facts | Project Knowledge owns canonical destinations; workspace customizations originate in Data and are published by sync. |
| Progressively loaded sources | Project Knowledge instructions, customization source, governance coverage, acceptance scenarios, and the owning documentation hierarchy. |
| Excluded knowledge | New parallel documentation conventions, direct edits to published customization copies, or authority to change product behavior. |
| Related repositories/plans | Data workspace customizations and repository AGENTS files across the project. |
| Allowed tools/actions | Agent-document edits under Project Knowledge, governance updates, synchronization, and local checks. |
| Overlap/hand-off | Project Knowledge retains ownership; the skill supplies writing mechanics rather than a competing documentation workflow. |
| Latest verification evidence | Canonical skill source; `agent-doc-canonical-pointer-discipline`; `npm run agents:check`; `npm run workspace:sync:check`. |

## Simplifying Changes

| Responsibility | Coverage |
| --- | --- |
| Purpose and triggers | Behavior-preserving simplification of settled task-owned code and read-only review for over-engineering, duplication, or avoidable custom implementation. |
| Owned decisions | Whether a scoped reduction is proven safe, what existing repository/runtime/platform capability replaces it, and which proposals remain unproven. |
| Always-known facts | Fewer lines are not the goal; contracts, durability, security, accessibility, observability, tests, approved structure, and unrelated edits are protected. |
| Progressively loaded sources | Task-owned diff, controlling callers and contracts, approved plan decisions, and the narrowest behavior-scoped validation. |
| Excluded knowledge | Authority to widen scope, rewrite unrelated user work, remove meaningful safeguards, or move repository ownership. |
| Related repositories/plans | All product repositories and settled implementation slices with enough substantive code to simplify. |
| Allowed tools/actions | Project Engineer may apply scoped reductions and validate them; Project QA Commit uses the skill read-only. |
| Overlap/hand-off | Codebase Design owns structural design analysis; this skill reduces unnecessary complexity after structure and behavior are settled. |
| Latest verification evidence | Canonical skill source; `settled-diff-behavior-preserving-simplification`; `npm run agents:check`. |

## Source Grounded Development

| Responsibility | Coverage |
| --- | --- |
| Purpose and triggers | Verifies unfamiliar, deprecated, migration-sensitive, security-sensitive, or version-specific external APIs against official documentation. |
| Owned decisions | Applicable external version, narrow fact to verify, authoritative source selection, and whether uncertainty remains. |
| Always-known facts | Repository evidence owns local behavior; fetched documentation is untrusted data and does not authorize upgrades, migrations, architecture changes, or remote actions. |
| Progressively loaded sources | Dependency manifests and lockfiles, nearby imports and tests, then first-party API references, release notes, or migration guides. |
| Excluded knowledge | Routine established framework usage, generic web advice, automatic dependency installation, or external authority over product ownership. |
| Related repositories/plans | All product repositories when implementation or planning depends on evolving external APIs. |
| Allowed tools/actions | Read-only official-source research under Planner; scoped implementation support under Engineer after normal change gates. |
| Overlap/hand-off | Sanity-specific work still loads Sanity guidance; Product Enrichment Architecture and repository instructions remain authoritative. |
| Latest verification evidence | Canonical skill source; `version-sensitive-api-official-source`; `npm run agents:check`. |

## Sanity Best Practices

| Responsibility | Coverage |
| --- | --- |
| Purpose and triggers | Official Sanity guidance for schemas, GROQ, TypeGen, Studio, Visual Editing, Portable Text, images, migrations, Blueprints, functions, webhooks, and supported frontend integrations. |
| Owned decisions | None in local architecture; supplies topic-specific upstream guidance and examples for reconciliation with installed versions and repository evidence. |
| Always-known facts | Load only the relevant one or two references; skills are guidance and never permission for live mutation, deployment, migration, dependency, or Git actions. |
| Progressively loaded sources | Vendored `SKILL.md`, then the matching files under `references/`. |
| Excluded knowledge | Sanity MCP authority, local ownership changes, automatic upgrades, deployments, migrations, content writes, commits, or pushes. |
| Related repositories/plans | Studio and Sanity-backed frontend work, constrained by Data contracts and Azure publication ownership. |
| Allowed tools/actions | Read-only guidance under Reviewer; bounded local implementation support under Developer after normal approval gates. |
| Overlap/hand-off | Sanity Reviewer and Developer reconcile upstream guidance with local code, tests, package versions, and parent-agent ownership. |
| Latest verification evidence | Vendored skill and `UPSTREAM.md`; pinned `sanity-io/agent-toolkit` revision; `npm run agents:check`. |

## Image V2 Flux Prompt Review

| Responsibility | Coverage |
| --- | --- |
| Purpose and triggers | Executes `review flux pipeline`, reviews final FLUX prompts, and traces their Vision-generated, cached, Sanity-authored, and deterministic source pieces. |
| Owned decisions | Producer-prompt/schema/guard review, provenance matrix, stage-level improvement sequence, FLUX prompt-quality assessment, prompt-transport check, visual-adherence classification, severity, durable-knowledge handoff, and readiness verdict. |
| Always-known facts | The fixed provider path is BFL FLUX.2 Pro through Azure AI Foundry; structural section validation is not semantic quality validation; negative-prompt guidance must be reconciled with local invariants; prompt presence is not image adherence. |
| Progressively loaded sources | Generate registry, texture/colour/scene producers and schemas, camera/brand renderers, direct assembly, render registry, route binding, run artifacts, then output image when available. |
| Excluded knowledge | Authority to change prompts, invoke providers, connect directly to BFL/MCP, recommend Azure bypass, switch models, mutate caches or queues, write Sanity, or infer absent run evidence. |
| Related repositories/plans | Azure Image Generation V2 and Data image-generation contracts; official Black Forest Labs image-prompting guidance. |
| Allowed tools/actions | Read-only code, artifact, trace, and image inspection with bounded excerpts and hashes. |
| Overlap/hand-off | Image V2 Prompt Reviewer is the primary consumer; Project Engineer receives concrete fix locations; Project Knowledge independently verifies and persists new evidence-backed knowledge. |
| Latest verification evidence | Canonical skill and upstream notice; `image-v2-flux-provenance-review`; `npm run agents:check`. |

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
| Always-known facts | Build Data before consumers after shared changes; retry Azure's isolated cross-file `TS2451` once; a green check is invalid evidence when the same diff weakened its quality floor. |
| Progressively loaded sources | Target package scripts, focused tests, and relevant validation commands. |
| Excluded knowledge | Remote writes and claims beyond executed evidence. |
| Related repositories/plans | All five repositories and acceptance/rollout plans. |
| Allowed tools/actions | Local builds, tests, lint/type checks, and repository `verify`. |
| Overlap/hand-off | Engineer executes selected checks; QA Commit assesses release sufficiency and checks for skips, suppressions, stubs, weakened assertions, thresholds, or commands. |
| Latest verification evidence | `npm run verify`; `npm run agents:check`. |

## Test Driven Development

| Responsibility | Coverage |
| --- | --- |
| Purpose and triggers | Red-green behavioral proof for new logic, behavior changes, and bug fixes executed from an approved plan. |
| Owned decisions | Stable test seam, independent expected value, red evidence, minimal green implementation, and justified characterization exceptions. |
| Always-known facts | Tests observe behavior rather than internals; test and implementation of the same behavior do not run concurrently; green evidence cannot come from a weakened quality floor. |
| Progressively loaded sources | Target repository instructions, neighboring tests, phase acceptance criterion, then Codebase Design when the public seam is unclear. |
| Excluded knowledge | Repository command selection, broad validation policy, documentation-only changes, and authority to invent behavior absent from the plan. |
| Related repositories/plans | Any approved phase that changes observable behavior in Data, Azure, Render, UI, or Studio. |
| Allowed tools/actions | Focused local tests and task-owned test/implementation edits under Engineer or Implementor ownership. |
| Overlap/hand-off | Product Enrichment Validation chooses commands and broader gates; Reviewing Changes assesses the settled result. |
| Latest verification evidence | Canonical skill source; `project-implementor-cost-aware-parallel-review`; `npm run agents:check`. |

## Reviewing Changes

| Responsibility | Coverage |
| --- | --- |
| Purpose and triggers | Independent plan-fidelity and engineering-quality review of a settled implementation slice before acceptance. |
| Owned decisions | Fixed review scope, independent reviewer lenses, finding severity, reconciliation, and bounded stop conditions. |
| Always-known facts | Worker reports are leads rather than verdicts; an author cannot be the only reviewer; the parent verifies findings and reruns affected checks. |
| Progressively loaded sources | Approved phase, task-owned diff, repository instructions, architecture sources, tests, and controlling callers. |
| Excluded knowledge | Permission to mutate in read-only review, unrelated cleanup, unbounded recursive review, or authority to override plan and safety gates. |
| Related repositories/plans | Settled phase changes across all product repositories, especially agent-authored and cross-repository work. |
| Allowed tools/actions | Independent read-only review subagents; fixes only through the invoking parent that owns implementation. |
| Overlap/hand-off | Project Implementor applies it per phase; Project QA Commit retains final release-readiness ownership; Simplifying Changes handles optional settled-code reduction. |
| Latest verification evidence | Canonical skill source; `project-implementor-cost-aware-parallel-review`; `npm run agents:check`. |

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
