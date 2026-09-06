---
name: writing-for-agents
description: "Use when Project Knowledge creates or edits Website Product Enrichment AGENTS.md files, custom agents, skills, prompts, hooks, or other documents whose primary reader is an AI agent."
---

# Writing For Agents

Write agent-facing documents so they trigger at the right time, reveal detail progressively, and produce verifiable behavior. This skill refines presentation; Product Knowledge and the existing documentation hierarchy still decide ownership and canonical destination.

## Start With Ownership

For workspace customizations, edit only `website-product-data/workspace-customizations/`, publish with `npm run workspace:sync`, and validate drift with `npm run workspace:sync:check`. For other agent-facing documentation, verify the owning repository and existing hierarchy before editing. Do not introduce `CONTEXT.md`, ADR, issue-tracker, or other parallel conventions unless the workspace has explicitly adopted them.

## Context Pointers

A pointer is always-loaded text that tells an agent what deferred material contains and the distinct conditions that should load it. Skill descriptions and concise references in `AGENTS.md` are pointers.

- Start with the capability or domain term most likely to trigger retrieval.
- Name each distinct trigger branch once; avoid lists of synonyms for one branch.
- Keep identity and procedure in the deferred document rather than repeating them in the pointer.
- Inline only rules that apply broadly enough to justify permanent context cost.

## Information Hierarchy

Order content by when the agent needs it:

1. Put the executable workflow and decision order in the primary file.
2. Keep compact rules beside the step that consumes them.
3. Move branch-specific reference behind a clearly worded link.
4. Split only when separate invocation, ownership, or sequence genuinely reduces irrelevant context.

Keep each fact in one authoritative location. Prefer pointers to duplicated prose. Treat package scripts, configuration, code, and directory structure as live sources; document the reason, invariant, or non-obvious trap rather than caching an easy lookup.

Put durable recurring cross-repository vocabulary in `website-product-data/docs/project/architecture/domain-language.md`. Do not create a parallel `CONTEXT.md` or `CONCEPTS.md`, and do not coin shorthand merely to reduce word count. A useful canonical term has one verified meaning, a clear owner or lifecycle context, and a link to its defining contract or architecture source.

## Steps And Completion Criteria

Write imperative steps in execution order. Give each meaningful phase a checkable completion criterion that distinguishes done from premature completion. State authorization boundaries before the action they constrain. Use positive target behavior for ordinary guidance and reserve explicit prohibitions for hard safety or ownership guardrails.

Descriptions are discovery surfaces. Include concrete trigger phrases and exclusions needed to prevent accidental invocation. Keep the folder name and frontmatter `name` identical, quote YAML values containing colons, and use paths that remain valid after workspace synchronization.

## Review

Before completion:

- Remove duplicated facts, stale commands, generic advice, and narration that does not change behavior.
- Confirm every deferred reference has a pointer and every pointer names a real trigger.
- Confirm ownership, allowed tools, side effects, approval gates, and stop conditions are unambiguous.
- Add or update governance coverage and acceptance evidence for behavioral customization changes.
- Run `npm run agents:check`, `npm run workspace:sync`, and `npm run workspace:sync:check` from `website-product-data` as applicable.

## Attribution

Adapted for this workspace from Matt Pocock's `writing-for-agents` skill and skill-mechanics reference. See [UPSTREAM.md](UPSTREAM.md) for source and license information.