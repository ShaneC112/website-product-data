# A batch AI call needs its own system prompt, not the single-item prompt with a batched user message

- **ID:** `azure-a-batch-ai-call-needs-its-own-system-prompt-not-the-single-item-prompt-with-a-batched-user-message`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## A batch AI call needs its own system prompt, not the single-item prompt with a batched user message

`extractTradeDetailsBatch` batches multiple pages into one AI call by sending a
JSON `items[]` array in the user message, and expects one `{ urlKey, status,
fields }` result per item wrapped in `{ "results": [...] }`. It reused
`prepared.contract.systemPrompt` verbatim for this call - the exact same prompt
used for a single-item request, which explicitly instructs the model to return `{
"fields": [...] }` (no wrapper, no per-item keying). Every mocked unit test passed,
because the mocks always constructed the `{ results: [...] } ` response shape the
code expected - they never modeled what the *prompt itself* actually asked the
model to return.

Against real Azure OpenAI, the model correctly followed its only instructions and
returned `{ "fields": [...] }` for (apparently) one item, never the `results[]`
wrapper. Every item in the batch registered as `status: 'missing'`, which is
exactly why the batch-quantity architecture reduces to "always retries, always
splits, always falls back to the single-item path" if not caught - a live symptom
that looks like a flaky/underpowered batch, not a structurally broken one, since
the plumbing (retry → split → fallback) hides the failure by design.

**Fix:** added a dedicated `batchSystemPrompt` (built by `buildBatchSystemPrompt`
in `tradeContracts.ts`), sharing the same evidence/hallucination rules as the
single-item prompt but describing the `{ "results": [{ urlKey, status, fields,
error? }] }` wrapper and instructing the model to echo each item's `urlKey` back
unchanged. `extractTradeDetailsBatch` now uses `contract.batchSystemPrompt`, never
`contract.systemPrompt`.

**How it was found:** a direct, unmocked call to `extractTradeDetailsBatch` against
2 real rendered pages (bypassing the full render/queue pipeline to keep the
diagnostic to one AI call) reproduced `status: 'missing'` for both items
immediately; logging the raw AI response content (see next entry) showed the
model's `{ "fields": [...] }` reply verbatim.

**Lesson:** when a batched/multi-item AI call reuses a single-item prompt "because
the facts/rules are the same," the *response shape instructions* still need to be
batch-specific - a model will follow the wire-format instructions it was actually
given, not the wire-format the calling code hopes for. A mocked test that only
returns the shape the code expects cannot catch a real prompt/parser mismatch;
this needs either a live/integration check or an explicit assertion on the prompt
text itself (see `tradeContracts.test.ts`'s `batchSystemPrompt` describes the batch
results wrapper" test, added as a direct regression guard).

