---
name: simplifying-changes
description: "Use when simplifying settled Website Product Enrichment code, reviewing a diff for over-engineering, removing speculative abstractions, or replacing custom code with an existing repository, standard-library, or platform capability."
---

# Simplifying Changes

Reduce unnecessary complexity in a settled, explicitly scoped change while preserving its required behavior and operational guarantees. Fewer lines are not the goal; a smaller amount of code that is easier to understand, verify, and maintain is.

## Scope

Use the user-named scope when provided. Otherwise limit inspection to task-owned implementation files changed in the current work. Exclude generated files, vendored code, lockfiles, documentation-only changes, and unrelated pre-existing edits. Ask rather than infer when the owned scope cannot be separated safely.

Project QA Commit uses this skill as a read-only review lens. Project Engineer may apply a clear simplification only within the active task scope and must validate behavior immediately afterward.

## Review Lenses

Inspect in this order:

1. **Delete**: remove dead branches, unused flexibility, compatibility code with no supported caller, and speculative features.
2. **Reuse**: prefer an established repository helper or contract over a local duplicate.
3. **Standard library**: replace hand-rolled behavior when the runtime provides an equally clear, edge-case-correct primitive.
4. **Native platform**: prefer an already-used framework or platform capability over custom infrastructure or a new dependency.
5. **YAGNI**: remove interfaces with one fixed implementation, factories with one product, configuration nobody varies, and wrappers that only forward calls.
6. **Shrink**: simplify control flow, data movement, naming, or concurrency without making the result terse or clever.

Do not add a new abstraction merely to make the current diff shorter. Keep deliberate duplication when it preserves ownership, isolation, or an approved plan decision.

## Protected Behavior

Never simplify away:

- shared contract validation, identity, idempotency, durability, retry, recovery, or publication invariants;
- trust-boundary validation, authorization, secret handling, data-loss prevention, or redaction;
- accessibility behavior, error visibility, observability, rollback support, or operator safeguards;
- tests or assertions that detect meaningful behavior;
- user-requested behavior or an approved plan's explicit structure;
- a dependency seam backed by real variation, external effects, or representative testing.

A proposed reduction must explain what replaces the removed behavior and why the same contract still holds. If that cannot be shown from current code and tests, report the idea as unproven and leave the code unchanged.

## Apply And Verify

For each worthwhile simplification:

1. State the unnecessary complexity and the smaller replacement.
2. Confirm callers, contracts, and tests do not rely on the removed surface.
3. Make the smallest cohesive edit when the current agent has implementation authority.
4. Run the narrowest behavior-scoped check that could detect a regression before considering another reduction.

Stop when the remaining structure has a concrete owner, variation, invariant, or verification purpose. Summarize applied reductions, skipped proposals, validation performed, and residual uncertainty.

## Attribution

Adapted for this workspace from EveryInc's `ce-simplify-code` skill and Dietrich Gebert's `ponytail-review` skill. See [UPSTREAM.md](UPSTREAM.md) for source and license information.
