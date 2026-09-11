# Image V2 Prompt Reviewer

## Aim

The Image V2 Prompt Reviewer improves the final FLUX prompt by checking that every stage of the image-prompt pipeline contributes correct, accurate, and appropriately structured information to final assembly. The intended result is an inspirational and aspirational flooring-product roomshot for [TC Matthews](https://www.tcmatthews.ie/) that helps customers imagine a better home made possible by flooring available from TC Matthews brick-and-mortar shops.

The reviewer evaluates the pipeline rather than polishing one materialized prompt. It identifies the earliest producer responsible for weak, missing, stale, contradictory, or mistransported information and explains how correcting that producer should improve the final prompt and generated image.

## Design Decisions

### Review provenance before prose

A polished final sentence can hide an underconstrained producer, stale cache entry, lossy transformation, or transport gap. The reviewer therefore reconstructs provenance first and assigns a defect to the earliest stage that owns it. A downstream renderer or assembler is changed only when its input is already correct and sufficiently structured.

The exact command `review flux pipeline` intentionally triggers a complete static audit without requiring a request ID, run artifact, final prompt, or output image. The audit inventories every active contribution to the final direct-render prompt, including Vision-generated, cached, Sanity-authored, deterministic, and fallback content.

### Treat every stage as a contract

Vision generation is reviewed as more than prompt text. The system prompt and user prompt are assessed separately because they carry different responsibilities: the system prompt defines durable role, authority, exclusions, and response behavior, while the user prompt supplies request-specific evidence and intent. The structured response is then assessed independently; fluent output does not prove that its schema is expressive, required fields are appropriate, or provider output agrees with the runtime parser.

The review follows information through:

1. evidence selection and image preparation;
2. Vision system and user prompts;
3. structured-output schema and provider response;
4. runtime parsing and normalization;
5. deterministic guards and fallback behavior;
6. cache identity, reuse, and persisted-schema validation;
7. section rendering;
8. final selection, ordering, and assembly;
9. provider-route serialization and transport.

This ordering keeps recommendations producer-first. It also catches facts that exist in an intermediate object but are weakened, discarded, duplicated, or contradicted before reaching FLUX.

### Separate transport from visual adherence

Matching assembly and render prompt hashes establish that prompt text crossed that handoff unchanged. They do not establish that the provider followed the prompt or that the resulting roomshot represents the flooring accurately. The reviewer reports prompt construction, provider transport, and output-image adherence as separate claims, with evidence requirements for each. The canonical boundary learning is [Image-generation V2 prompts and recovery handoffs need explicit boundaries](../learnings/azure/azure-image-v2-prompt-provenance-and-recovery-handoffs-need-explicit-boundaries.md).

### Keep the provider route fixed

The supported route is BFL `FLUX.2-pro` through Azure AI Foundry. The shared [`image.render.direct` task route](../../../src/ai/task-routing.ts) binds to `flux-2-pro-image-generation`, and the [model registry](../../../src/ai/model-registry.ts) identifies `flux-2-pro` as an `azure-ai-image` model. Provider diagnosis stays inside the Azure route, deployment, adapter, quota, request, response, and observability boundaries.

Direct BFL API access and FLUX MCP are not recommended alternatives. The reviewer does not suggest BFL credentials or billing, `api.bfl.ai`, `mcp.bfl.ai`, `flux-mcp`, model switching, or bypassing the Azure adapter. Direct-API payload capabilities are not assumed to exist in the Azure adapter.

### Retain durable knowledge through Project Knowledge

Review findings are not automatically canonical facts. Existing project knowledge is searched first. A new item is handed to Project Knowledge only when implementation plus a test, trace, reproducible run, provider contract, or equivalent evidence establishes the symptom, cause, durable invariant, and verification method. Project Knowledge independently verifies overlap and evidence, chooses the destination, and records whether the candidate was accepted, merged, relocated, rejected, or blocked. Unproven ideas remain explicitly labeled as candidates awaiting proof.

### Remain read-only

The reviewer may inspect code, documentation, bounded prompt excerpts and hashes, run artifacts, traces, and output images. It does not edit prompts or runtime code, generate images, invoke providers, connect to BFL or FLUX MCP, enqueue work, clear shared state, deploy, write Sanity, commit, or push. Protected operations retain the workspace's fresh-approval requirements; invoking a review does not grant that approval.

## Orchestrator Integration

Project Engineer, Project Planner, Project Implementor, and Project QA Commit use the reviewer as a read-only quality regression gate whenever work may change the Image Generation V2 prompt contract or final FLUX prompt quality. The trigger covers prompt inputs, Vision system and user prompts, builders and examples, structured-output schemas and parsers, normalization and deterministic guards, cache identity and versioning, section rendering, assembly, and provider prompt serialization. Seemingly mechanical typo/copy fixes and output-structure changes are not exempt because they can alter semantics, provenance, cache reuse, or downstream assembly.

Engineer requests provenance and quality risks before editing and reviews the settled task-owned change. Planner requests current-pipeline and proposed-impact evidence, then records reviewer checkpoints and prompt-quality acceptance criteria without implementing findings. Implementor identifies affected phases at entry, obtains pre-change evidence, and requests settled-diff review before phase acceptance. QA Commit requests final-diff review and treats unresolved quality regression or missing provenance validation as a release blocker.

Each orchestrator independently verifies and reconciles findings within its own authority. The reviewer never owns implementation, plan approval, phase acceptance, release readiness, edits, or commits, and its invocation does not expand any authorization boundary. The provider remains BFL FLUX.2 Pro through Azure AI Foundry. The canonical reviewer agent and skill define the executable review procedure; this overview records only the integration contract.

## Authoritative Local Sources

- The canonical [reviewer agent](../../../workspace-customizations/.github/agents/image-v2-prompt-reviewer.agent.md) defines triggers, provider and safety invariants, delegation, and report shape.
- The canonical [Image V2 FLUX Prompt Review skill](../../../workspace-customizations/.github/skills/image-v2-flux-prompt-review/SKILL.md) owns the stage-by-stage procedure and should not be duplicated here.
- [Agent and Skill Coverage](knowledge-coverage.md) records ownership and overlap with Project Engineer, Project Knowledge, and Project QA Commit.
- [Agent Governance Acceptance Scenarios](acceptance-scenarios.md) records the static provenance-review and knowledge-retention expectations.
- The [upstream integration ledger](../../../workspace-customizations/.github/agents/UPSTREAM-SKILL-INTEGRATIONS.md) is authoritative for reviewed revisions, local adaptations, exclusions, licenses, and refresh outcomes.

## Web Sources And Applicability

### Integrated sources

- [Black Forest Labs `flux-image-best-practices` at `8907d515b0ac270a988ec7a239add81ee13d6cba`](https://github.com/black-forest-labs/skills/blob/8907d515b0ac270a988ec7a239add81ee13d6cba/skills/flux-image-best-practices/SKILL.md) supplies provider-independent prompt-quality guidance: clear structure, specificity, natural prose, front-loading, lighting, camera and composition language, positive formulations, object-bound colour values, and conceptual reference roles. Local flooring identity, evidence, safety, ownership, and Azure provider constraints override generic advice. The retained license is in the skill's [UPSTREAM notice](../../../workspace-customizations/.github/skills/image-v2-flux-prompt-review/UPSTREAM.md).
- [Matt Pocock's `writing-for-agents` at `3cca18b368ae95cdbdebbff572ccafa662551015`](https://github.com/mattpocock/skills/blob/3cca18b368ae95cdbdebbff572ccafa662551015/skills/productivity/writing-for-agents/SKILL.md) and its [skill-mechanics reference](https://github.com/mattpocock/skills/blob/3cca18b368ae95cdbdebbff572ccafa662551015/skills/productivity/writing-for-agents/SKILL-MECHANICS.md) inform trigger wording, progressive disclosure, context pointers, and checkable completion criteria. They shape agent documentation, not FLUX or provider behavior.

### Reviewed but excluded

- [Black Forest Labs `flux-mcp` at `cc2e57d9a702cfeec892ee405be36797da552dd8`](https://github.com/black-forest-labs/flux-mcp/tree/cc2e57d9a702cfeec892ee405be36797da552dd8) was reviewed and deliberately not integrated. Its hosted OAuth client, generation and editing tools, history, and BFL-direct billing operate outside the project's Azure AI Foundry boundary. Its prompt tips do not add a review capability beyond the integrated static prompting source.

No direct BFL API or MCP procedure is part of the reviewer. The immutable revisions and integration decisions above come from the canonical attribution ledger; update that ledger and the applicable retained notice before claiming a different upstream basis.