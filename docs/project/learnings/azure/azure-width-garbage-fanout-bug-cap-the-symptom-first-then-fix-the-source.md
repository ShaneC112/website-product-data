# Width garbage-fanout bug: cap the symptom first, then fix the source

- **ID:** `azure-width-garbage-fanout-bug-cap-the-symptom-first-then-fix-the-source`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## Width garbage-fanout bug: cap the symptom first, then fix the source

A live E2E run against real vendor sites (Abingdon, Alternative Flooring) surfaced a
pipeline bug where the AI review UI showed hundreds of garbage "widths" (raw CSS
selector text like `.ast-header{background-color:#0170B3;}...`). This had already
been partially addressed in an earlier pass (capping the compact table-row summary
to `widthCount` instead of a full array, to stop an Azure Table `PropertyValueTooLarge`
crash) — but the *display* bug remained, because `buildWidthSlots` in
`tradeExtraction.ts` still took whatever raw text the `width` field extracted and
blindly split it on `-`/`/`/" to ". One bad string (e.g. mis-captured CSS) split on
hyphens turns into dozens of fake width entries.

**Fix:** made `width` a structured registry field (`measurement-list`, i.e.
`Array<{ value: number, unit: string }>`) instead of free text, end-to-end:
extraction (`parseWidthMeasurements`), the AI fallback path (`readAiWidthField`,
which accepts a structured array from the model directly per the updated registry
prompt guidance, with a text-parsing fallback), and `buildWidthSlots` (now a
straight `.map()`, not a parser). This closes the bug at the source rather than
only containing its blast radius.

**Lesson:** when a defensive regex/cap fixes a *crash*, check whether the
*underlying bad data* is still being produced and surfaced elsewhere (in this case,
the AI review UI, once a separate blob-read bug was fixed and the garbage became
visible for the first time). Capping is not the same as fixing.

