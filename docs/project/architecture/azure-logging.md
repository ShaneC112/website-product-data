# Azure Logging Policy

This policy governs production server logging in `website-product-enrichment-azure`. It defines the required logger, context, redaction, and level decisions for new and changed Azure code. Repository-specific logger exports, migration examples, and local runtime commands remain in the [Azure logging implementation guide](../../../../website-product-enrichment-azure/docs/logging-architecture.md).

## Required Contract

- Use the shared Pino root logger or a child logger. Production code must not use `console.log`, `console.warn`, or `console.error`.
- Prefer structured properties over string concatenation.
- Request- and stage-scoped code must use a child logger with the available `module`, `requestId`, and `runId`; include the stage or step when relevant.
- Add `productId`, `variantKey`, `room`, `workKey`, or `reasonCode` when the event owns that context.
- Shared helpers receive the caller's contextual logger, preserve inherited context, and add only local fields they own. They must not create a root logger or invent request or run identity.
- Log only the minimum operational data. Omit large blobs, media bytes, and unnecessary payload snapshots.
- Rely on unconditional redaction at the logger boundary for secrets, credentials, authorization data, cookies, SAS values, image bytes, and equivalent nested fields.

## Level Decisions

Choose the level from the workflow outcome, not from the amount of detail in the message.

### `info`: operator-visible lifecycle or state change

Use `info` when normal workflow state changes and an operator needs the event for auditability or recovery:

- queue ingress or exit;
- stage claim, handoff, or completion;
- successful required dependency validation;
- artifact creation or validation milestones;
- terminal completed or skipped outcomes;
- expected recovery actions that materially change workflow state.

Do not use `info` for each function line, local variable, loop iteration, or diagnostic checkpoint.

### `warn`: degraded but continuing workflow

Use `warn` when the workflow continues or remains recoverable, but an important data, policy, dependency, fallback, cleanup, or bounded-retry issue occurred.

Use `warn` at the decision boundary when code converts an expected provider, policy, or dependency outcome into a degraded durable state such as `blocked`, `skipped`, or equivalent non-success terminal handling. This applies even when the surrounding worker invocation completes successfully and Azure Functions reports the function execution as succeeded. The warning must be emitted where the workflow decision is made, not only in a lower-level helper, so operators can see the highlighted terminal outcome in local and hosted logs.

Expected idempotency and concurrency paths that complete normally are `debug`, such as a revision-conflict reread that finds an artifact written by another worker. Promote them to `warn` only when they indicate unexpected contention, delay, or data loss.

### `error`: failed business purpose or unsafe continuation

Use `error` for uncaught exceptions, required dependency or contract failures, failed persistence, exhausted retries, persisted failure states, unexpected invariant breaks, and any final failure that prevents downstream processing.

A scheduled retry is `warn` when it reflects degraded operation and `info` when it is an expected recovery action. An exhausted retry or persisted failure is `error`.

### `debug`: local coordination and investigation

Use `debug` for non-trivial function entry or exit, branch checkpoints, dependency lookups, intermediate state snapshots, optional-value resolution, and other step-by-step diagnostics useful only during investigation.

Normal success events needed in day-to-day operator review are `info`, not `debug`.

### `trace`: temporary deep forensic evidence

Use `trace` only for an active, narrow investigation that requires large object snapshots, exact payload diffs, deep data-shape inspection, or equivalent payload-level evidence. Do not add `trace` as a default pattern in new functions, and do not enable broad trace output in production.

## Durable-State Rule

A log about a durable write or workflow-state change is never merely `debug`.

Request acceptance, stage claims and completion, queue enqueue, artifact validation, final-state writes, policy blocks, exhausted retries, and failures persisted to a ledger must use `info`, `warn`, or `error` according to the outcome rules above.

## Message And Context Quality

Messages must identify the operator-relevant event without requiring the reader to inspect the implementation. Prefer stable messages such as `request accepted`, `stage completed`, or `queue handoff enqueued`; avoid ambiguous messages such as `doing thing`, `callback invoked`, or `finished processing`.

Critical-path logs cover queue boundaries, claims, retries, completion, dependency validation, stage handoffs, terminal block/skip/fail reasons, and recovery or cleanup actions. They carry the available durable request/run identities and stage/module context so operators can correlate one workflow across Azure logs.

## Implementation Review

When adding or changing Azure server code:

1. Read this policy and the repository implementation guide before editing logging behavior.
2. Use the shared logger import path and create the child logger at the first request- or stage-scoped boundary.
3. Classify every added or changed event against the level decisions above.
4. Confirm durable writes and workflow transitions remain visible at `info`, `warn`, or `error`.
5. Confirm structured context is present, messages are operator-readable, payloads are bounded, and sensitive fields are redacted.
6. Run the narrowest logger or affected-worker test, then the repository's stable validation when the scope warrants it.

Local debugging through `LOG_LEVEL` is a convenience. Filter the resulting structured output by fields such as `module`, `requestId`, or `runId`; local filtering does not replace child context or change production level decisions.