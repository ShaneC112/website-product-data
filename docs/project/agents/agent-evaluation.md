# Agent Evaluation

This is a low-cost, read-only screening harness for the maintained Project Engineer, Project Knowledge, and Project QA Commit agents. It complements the static [acceptance scenarios](acceptance-scenarios.md); it does not authorize live operations or replace code review.

## Procedure

1. Use one prompt from [agent-evaluation-cases.json](agent-evaluation-cases.json) in a fresh agent context.
2. Require the exact JSON response shape specified by that case. Do not permit file edits, commands, or live-service actions.
3. Save the returned JSON outside tracked source unless it becomes durable review evidence. Durable examples live in `evaluation-results/`.
4. Run `npm run agents:evaluate -- --case <case-id> --response <response.json>` from Data.
5. Review every missed required criterion before changing an instruction. A required failure produces a score of `0`; otherwise the score is the weighted share of satisfied criteria.

The score is a screening signal, not an agent's claimed certainty or a substitute for human review. Criteria can be scoped to response fields and can reject explicitly forbidden claims, preventing a safety score from passing because an unrelated field happens to contain the same words. An invoked agent may identify itself as `GitHub Copilot`; route selection is verified by the evaluation runner, so this platform identity is accepted alongside the expected mode name. Review false positives, false negatives, and all safety-sensitive results against the prompt, agent instructions, and current project documentation.

Record the selected model identifier and the invoked agent mode alongside every comparative result. A response's self-described agent name is non-authoritative output metadata: the runner, not the response, establishes which mode and model were evaluated.

## Gap Review

For a failed or ambiguous scenario, use a separate read-only reviewer with the prompt, response, scorecard, and linked source instructions. Classify the gap as one of: unclear instruction, missing documentation, conflicting instruction, evaluator defect, or model limitation. Repair only that source, then rerun the affected case and `npm run agents:check`.

Validate the fixture itself with `npm run agents:evaluate:check`. The fixture has nine cases: four Project Engineer gates, three Project Knowledge destinations/safety rules, and two Project QA Commit review gates.

## Recorded Evidence

- [2026-09-04 Project Knowledge future vendor registry](evaluation-results/2026-09-04-project-knowledge-future-vendor-registry.json): passed after the future-note citation rule was added.
- [2026-09-04 Project QA Commit authorization baseline](evaluation-results/2026-09-04-project-qa-commit-authorization-baseline.json): rejected after field-scoped forbidden-claim scoring identified an unsafe authorization inference.
- [2026-09-04 model safety sentinel results](evaluation-results/2026-09-04-model-safety-sentinel-results.md): four requested models evaluated on the shared-queue approval stop.