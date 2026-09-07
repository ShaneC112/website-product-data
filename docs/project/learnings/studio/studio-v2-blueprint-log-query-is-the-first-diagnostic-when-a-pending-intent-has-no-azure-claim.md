# V2 Blueprint log query is the first diagnostic when a pending intent has no Azure claim

- **ID:** `studio-v2-blueprint-log-query-is-the-first-diagnostic-when-a-pending-intent-has-no-azure-claim`
- **Applies to:** `website-product-enrichment-sanity-studio`
- **Status:** Canonical learning detail.

## Learning

A V2 request with `submissionState: 'pending'`, an empty `sanity-image-submission-v2` queue,
and no Azure submission-claim row has not reached Azure. Inspect the deployed
`request-ai-images-v2` Sanity Function before changing queues, replaying an intent, or assuming
Azure consumed the message:

```bash
pnpm blueprints:logs:v2
pnpm exec sanity functions logs request-ai-images-v2 --utc --limit 50
pnpm exec sanity blueprints logs --since <ISO-8601> --limit 100
```

Use the commands in this order:

1. `pnpm exec sanity functions logs request-ai-images-v2 --utc --limit 50`
	 Use this first when a payload was appended to the product but no top-level
	 `aiImageGenerationRequest` document, Azure queue activity, or Azure submission claim appears.
	 This is the fastest way to confirm whether the deployed function ran and whether it threw.
2. `pnpm exec sanity blueprints logs --since <ISO-8601> --limit 100`
	 Use this when the function log is empty, when you need deployment-time context, or when you
	 need to confirm the active Stack was updated before the failing request was sent.
3. `pnpm blueprints:logs:v2`
	 Use this repo shortcut when you want the project-standard V2 Blueprint log view without
	 remembering the raw CLI arguments.

Signals to look for in the remote logs:

- `INFO Function invocation started`
	The deployed Blueprint function saw the document event.
- `ERROR Invoke Error` with `errorType: "ZodError"`
	The function failed before queue submission, usually while parsing the event payload or a reread
	document against a strict shared schema.
- `queue submission failed`
	The function parsed the request but failed while sending the Azure queue message; this should
	usually correspond to a bounded failed outcome patch on the safely parsed intent.
- no function log entry at all for the request window
	The issue is earlier than Azure and earlier than handler logic: wrong Blueprint deployment,
	wrong filter/projection, wrong dataset/project, or the event never matched the deployed trigger.

The authoritative evidence is the deployed remote Blueprint/Function log stream, not the local
Studio dev server. A payload can fail inside the online Blueprint runtime without surfacing in the
browser or local Studio console, so "payload appended but nothing reached Azure" should trigger a
remote log query first.

The V2 handler rereads a Sanity document, and the document event itself can also carry Sanity
transport metadata such as `_createdAt`, `_updatedAt`, and `_rev`. Passing those metadata keys into
a strict Data-owned Zod schema fails the Function before queue submission. In that failure mode,
there may be no bounded failed outcome patched back onto the product-local payload because the
handler can die before it reaches the queue-send error path. Queue-send failures should still patch
the safely parsed pending intent to a bounded failed outcome and log the function-side error; they
must not leave a silent pending command.
