# Passing the PDF itself is better than parsing it locally first

- **ID:** `azure-passing-the-pdf-itself-is-better-than-parsing-it-locally-first`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## Passing the PDF itself is better than parsing it locally first

The first attempt to improve Victoria extraction added a local `pdf-parse` step in
`renderEvidence.ts`, downloading the curated PDF and injecting extracted text into the AI input.
That proved the missing data was in the PDF, but it was still the wrong long-term boundary:

- it discarded the PDF's visual evidence (badges, icons, layout cues)
- it duplicated work the vision-capable model can already do directly
- it introduced an extra fetch/parse failure mode in the evidence loader

Live probes against the real Azure OpenAI deployment showed `gpt-4.1-mini` could read the Burford
Twist PDF directly as an `input_file`, including both tabular spec data and visual badge claims.
The production fix was therefore to move curated-PDF extraction onto the Responses API and remove
the local PDF text-extraction fallback entirely.

**Best practice:** if the model and deployment already support the original artefact format, pass
the artefact itself instead of building a lossy local pre-parser. Use local parsing only when the
model cannot consume the source format directly.

