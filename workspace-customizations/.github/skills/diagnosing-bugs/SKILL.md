---
name: diagnosing-bugs
description: "Use when diagnosing a hard, intermittent, or performance-related Website Product Enrichment bug that needs a reproducible feedback loop, ranked hypotheses, instrumentation, and a regression test."
---

# Diagnosing Bugs

Use this discipline for difficult bugs. Routine failures with an obvious local cause can follow Project Engineer's normal hypothesis-and-validation loop.

## Safety And Evidence

Read the target repository `AGENTS.md` and any applicable Product Enrichment learning before debugging. Redact credentials, authorization headers, endpoints, customer data, and other sensitive values from commands, logs, fixtures, and reports. Keep secrets in environment variables. Protected Azure, queue, deployment, migration, M2CRM, and Sanity actions still require the approvals defined by workspace instructions.

## 1. Build A Red-Capable Loop

Create the smallest agent-runnable command that drives the real failing path and detects the user's exact symptom. Prefer, in order, a focused test, HTTP or CLI fixture, headless browser assertion, captured-event replay, minimal harness, seeded stress loop, or differential/bisection check.

Tighten the loop until its verdict is specific, repeatable, and fast enough to rerun after each change. For intermittent failures, measure and raise the reproduction rate instead of claiming deterministic reproduction.

This step is complete when one command has been run and shown capable of distinguishing the reported failure from success. If no safe local loop is possible, state what was attempted and request the minimum redacted artifact, access, or instrumentation approval needed. Do not mutate a protected environment merely to obtain a reproduction.

## 2. Reproduce And Minimize

Run the loop and confirm it observes the reported symptom rather than a nearby failure. Remove inputs, configuration, dependencies, and steps one at a time, rerunning after each removal. Keep only elements required to preserve the failure.

This step is complete when the remaining scenario is minimal enough to constrain the likely controlling path, or when a documented external dependency prevents further reduction.

## 3. Rank Falsifiable Hypotheses

Write three to five hypotheses for a genuinely ambiguous bug. For each, state the observable prediction that would support or disprove it. Rank them by fit with the minimized evidence, cost of the discriminating check, and blast radius. Share the ranking when user or domain knowledge could materially reorder it, but continue with the cheapest strong check when no answer is needed.

This step is complete when the next action changes or observes one variable and can distinguish at least the leading hypotheses.

## 4. Instrument Narrowly

Prefer debugger or direct state inspection, then targeted logs at boundaries that distinguish hypotheses. Tag temporary diagnostics with a unique searchable prefix and avoid broad log collection. For performance regressions, establish a baseline and use profiling, timing, query plans, or bisection before changing code.

This step is complete when evidence identifies the controlling defect or falsifies the current hypothesis and names the next local check.

## 5. Fix Through The Real Seam

Where a representative test seam exists, turn the minimized reproduction into a failing regression test before applying the fix. Change the controlling implementation, run the focused test, then rerun the original loop. If no representative seam exists, document that design limitation rather than adding a shallow test that cannot catch the bug.

This step is complete when the regression check and original reproduction pass without weakening assertions or bypassing production behavior.

## 6. Clean Up

Remove temporary diagnostics and throwaway harnesses unless they are intentionally retained as documented tests or reusable tools. Run the affected repository's focused validation and broader verification when warranted. Report the root cause, evidence, validations, residual risk, and any missing test seam. Do not commit unless the user separately authorizes Project QA Commit to do so.

## Attribution

Adapted for this workspace from Matt Pocock's `diagnosing-bugs` skill. See [UPSTREAM.md](UPSTREAM.md) for source and license information.