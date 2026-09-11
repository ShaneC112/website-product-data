# Project Metadata Changelog

All notable cross-repository documentation, workflow, and workspace-customization changes are recorded here.

## Unreleased

- Added the canonical Azure structured-logging policy, split repository implementation guidance from durable policy decisions, and required implementation and review agents to enforce logger, context, redaction, message-quality, and level rules for Azure server changes.
- Added a read-only Image V2 Prompt Reviewer and provenance-aware FLUX review skill, adapted from provider-independent official Black Forest Labs guidance, with a `review flux pipeline` mode that audits Vision system/user prompts, schemas, guards, caches, renderers, final assembly, Azure AI Foundry FLUX.2 Pro transport, and applicable project learnings while explicitly excluding direct BFL and FLUX MCP access. New evidence-backed FLUX discoveries now require a verified Project Knowledge documentation handoff and an explicit retention disposition.
- Required Project Engineer, Project Planner, Project Implementor, and Project QA Commit to use the read-only Image V2 Prompt Reviewer as a prompt-quality regression gate whenever work may affect the Image Generation V2 prompt contract or final FLUX prompt quality, including seemingly mechanical typo/copy fixes and structured-output changes. Added the `image-v2-prompt-change-orchestrator-gate` acceptance scenario and a reviewer aim, decisions, and sources overview page.

## 0.2.0 - 2026-09-06

- Documented the source-verified image-generation v2 queue-only Sanity-to-Azure boundary, Azure direct projection ownership, removed write HTTP ingress, and the remaining Phase 18 readiness gaps; no deployment or live verification is claimed.
- Added focused diagnosis, codebase-design, simplification, source-grounding, and agent-writing skills with managed-agent routing and upstream attribution.
- Added quality-floor review checks for weakened tests, suppressions, stubs, thresholds, validation commands, and package-manager drift.
- Added canonical cross-repository domain language under the architecture hierarchy without introducing a parallel context-document system.
- Expanded managed-agent governance to eleven skills, twenty-four acceptance scenarios, and seventeen read-only evaluation cases with an explicit host-observed execution contract.

## 0.1.0 - 2026-09-04

- Established the Data-hosted canonical project documentation and workspace customization source.
- Added the project implementation, knowledge maintenance, and review-and-commit agents.
- Added explicit workspace synchronization with non-destructive drift checking.
