---
name: reviewing-changes
description: "Use after a Website Product Enrichment implementation slice settles, especially for agent-authored or cross-repository changes, to review plan fidelity and engineering quality independently before acceptance."
---

# Reviewing Changes

Review a settled diff against two independent questions: did it implement the approved plan, and is the implementation safe and maintainable in this codebase? A green test run is evidence, not a substitute for either review.

## Fix The Review Scope

Record the baseline and changed paths before reviewing. For plan work, use the phase file as the requirements source and the applicable repository `AGENTS.md`, architecture sources, and nearby conventions as engineering standards. Exclude unrelated pre-existing changes; stop if the diff cannot be attributed safely.

Read tests before implementation where practical because they expose the claimed behavior and missing cases. Then inspect every task-owned hunk and the controlling callers or contracts needed to assess it.

## Independent Lenses

Run these lenses independently, in parallel when separate read-only subagents are available:

### Plan Fidelity

- missing, partial, or incorrectly implemented requirements;
- behavior or files outside the approved scope;
- unmet acceptance criteria, dependency order, or rollout and recovery requirements;
- undocumented deviations between the plan and current repository evidence.

### Engineering Quality

- correctness, edge cases, error paths, race or state inconsistencies;
- repository ownership and established local patterns;
- security and trust-boundary validation;
- durability, retry, idempotency, cleanup, and redelivery behavior where applicable;
- tests that genuinely detect regressions rather than implementation details;
- avoidable duplication, speculative abstractions, pass-through layers, or new dependencies;
- unbounded work, obvious performance regressions, missing observability, or documentation drift.

Give each reviewer only the diff, governing sources, and review contract. Ask it to find defects, not validate the author's conclusion. Use the lowest-cost capable reviewer for a small deterministic diff; use a strong model for cross-repository contracts, durable state, security, migrations, or ambiguous behavior. A worker that wrote the slice must not be its only reviewer.

## Reconcile Findings

The parent owns the verdict. Verify every finding against current code and classify it as:

- **Critical:** security, data loss, broken contract, or unsafe operation;
- **Required:** correctness, plan fidelity, regression, or material maintainability issue;
- **Optional:** worthwhile improvement that is not needed for acceptance;
- **Noise:** unsupported or based on missing context.

Fix Critical and Required findings within the approved scope, then rerun the narrowest affected check. Do not expand the phase to address unrelated observations. Record justified plan deviations and residual risks explicitly.

Stop after one clean review cycle or three cycles with substantive findings. Three unresolved cycles indicate that the slice is too large, the contract is unclear, or user/planner input is required; do not recurse indefinitely.

## Completion Evidence

- Both lenses reviewed the same fixed scope.
- The parent verified rather than rubber-stamped reviewer output.
- Critical and Required findings are resolved or reported as blockers.
- Focused checks were rerun after review-driven edits.
- Acceptance criteria are tied to concrete code and validation evidence.
- Review remained read-only unless the invoking parent owned and applied the fixes.

## Attribution

Adapted for this workspace from Matt Pocock's `code-review`, Every's `ce-code-review`, and Addy Osmani's `code-review-and-quality` and `doubt-driven-development` skills. See [UPSTREAM.md](UPSTREAM.md) for source revisions and licenses.