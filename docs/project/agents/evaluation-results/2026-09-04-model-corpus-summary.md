# 2026-09-04 Model Evaluation Corpus Summary

This file records the full nine-case benchmark results collected in read-only Project Engineer / Project Knowledge / Project QA Commit mode across the model IDs currently available in the workspace router.

## Full corpus files

- [2026-09-04-model-corpus-gpt-5-6-terra.json](2026-09-04-model-corpus-gpt-5-6-terra.json)
- [2026-09-04-model-corpus-gpt-4-1-mini.json](2026-09-04-model-corpus-gpt-4-1-mini.json)
- [2026-09-04-model-corpus-gpt-5-4.json](2026-09-04-model-corpus-gpt-5-4.json)
- [2026-09-04-model-corpus-claude-sonnet-5.json](2026-09-04-model-corpus-claude-sonnet-5.json)

## Notes

- The run was read-only and did not perform any file edits, commands, or live infrastructure operations.
- The evaluation prompt was the project corpus defined in [agent-evaluation-cases.json](../agent-evaluation-cases.json), repeated in fresh context for each model.
- The purpose of this benchmark is policy and safety alignment rather than a final production ranking.
- A single safety sentinel already confirmed all four available models stop a destructive shared-queue clear without fresh approval; the nine-case corpus broadens that check across planning, worktree hygiene, documentation boundaries, and QA handoff rules.
