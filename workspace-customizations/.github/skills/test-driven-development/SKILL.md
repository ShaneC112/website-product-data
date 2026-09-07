---
name: test-driven-development
description: "Use when an approved Website Product Enrichment plan adds logic, changes behavior, or fixes a bug that can be proven through a focused red-green test cycle."
---

# Test-Driven Development

Use one behavior slice at a time: establish a test that can fail for the intended reason, make the smallest implementation pass it, then improve the code only while the same behavior remains green. This skill defines test construction; `product-enrichment-validation` selects repository commands and broader gates.

## Start At A Public Seam

Read the target repository instructions, neighboring tests, and the plan's acceptance criterion. Choose the narrowest stable interface through which a caller observes the behavior. Prefer returned state, persisted outcomes, emitted contracts, or rendered user behavior over private helpers and collaborator call sequences.

Before implementation:

1. State the behavior and seam under test.
2. Identify an independent expected value from the plan, a worked example, or established behavior.
3. Run the focused test and confirm it fails because the behavior is absent or incorrect. A compile failure is valid red evidence when the planned contract does not exist yet.

Do not require a new test for documentation-only, generated-only, or mechanical changes with no behavioral effect. For legacy code where a red-first test is impractical, characterize current behavior before changing it and state why a true red step was unavailable.

## Red-Green Cycle

1. **Red:** Add one focused test for one observable behavior. Confirm its failure is specific and expected.
2. **Green:** Implement only enough production code to satisfy that behavior. Run the same focused check.
3. **Inspect:** Confirm the test would fail if the new behavior were removed or inverted. Reject tautological assertions and snapshots that merely restate implementation output.
4. **Continue:** Add the next behavior only after the current slice passes.
5. **Refine:** Once the behavior is green, simplify task-owned code without changing the contract, rerunning the focused check after each substantive edit.

Use real implementations where cheap and deterministic, then fakes, stubs, and finally interaction mocks. Mock external or nondeterministic boundaries, not the logic under test. Keep tests descriptive and independent even when modest setup duplication improves readability.

## Delegated Tests

A parent `Project Implementor` may assign a low-cost worker to write a reproduction or contract test when the seam and expected behavior are explicit. The worker receives the exact files, behavior, focused command, and instruction not to implement the fix or delegate further. The parent must inspect the test and witness the expected failure before implementation begins.

Do not run test authoring concurrently with implementation of the same behavior. That removes the independent red signal and creates overlapping edits.

## Completion Evidence

- The focused test failed for the expected reason before implementation, or a justified characterization exception is recorded.
- The same test passes after implementation.
- The test observes behavior through a stable seam and would detect regression.
- No test, assertion, threshold, or validation command was weakened to obtain green.
- The broader checks selected by `product-enrichment-validation` pass after the slice is integrated.

## Attribution

Adapted for this workspace from Matt Pocock's `tdd` skill and Addy Osmani's `test-driven-development` skill. See [UPSTREAM.md](UPSTREAM.md) for source revisions and licenses.