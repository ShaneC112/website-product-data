# Multimodal (PDF) AI extraction had no fallback if the multimodal call itself failed

- **ID:** `azure-multimodal-pdf-ai-extraction-had-no-fallback-if-the-multimodal-call-itself-failed`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## Multimodal (PDF) AI extraction had no fallback if the multimodal call itself failed

`extractTradeDetailWithAi`'s curated-PDF path called `requestResponse` (multimodal)
directly; a thrown error (network, provider outage, bad file URL) failed the whole
extraction with no retry, even though the plain-text `requestChatCompletion` fallback
path already existed for pages with no curated PDFs.

**Fix:** wrapped the multimodal call in `try`/`catch`; on failure, log a warning,
trace a `pdf_input_failed` event, and fall through to the existing text-only
extraction path instead of failing outright. Added matching `text_fallback_started`/
`text_fallback_completed` trace events so a text-fallback extraction (whether by
choice or by PDF-failure) is distinguishable from a successful multimodal one in
telemetry.

