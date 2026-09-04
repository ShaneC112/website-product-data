# ADR 003: Separate Bridge And Editorial Publication Gates

- **Status:** Accepted
- **Date:** 2026-09-04
- **Owners:** Data, Azure, Studio, UI

## Context

The pipeline needs to prevent invalid or untrustworthy automated output from reaching Sanity, while editors need a transparent final publication check based only on information they can see and correct. A single shared gate would either expose internal pipeline scoring as editorial policy or allow ineligible source output into Studio.

## Decision

Azure evaluates the shared `evaluateBridgeEligibility` before draft ingestion. A failed bridge result is held in Azure and produces no Sanity document. Studio independently evaluates `evaluateStudioPublishReadiness` against editor-visible product content; normal Studio publication remains the final editorial approval.

The UI exposes pipeline blockers, evidence, matching, swatch, and recovery workflows through shared schemas and Azure-owned write functions. It does not hold Sanity credentials or make Sanity writes directly.

## Consequences

- Internal pipeline blockers and quality scoring do not become opaque fields on a Studio document.
- A draft can be edited and published only when editor-visible requirements pass.
- Changes to Azure's guaranteed Sanity-write fields require a Data bridge-contract update and Studio compatibility validation.
- Registry synchronization remains an Azure-owned Sanity write, with UI presenting the dry-run and approved apply workflow.

See [Sanity and operator workflows](../architecture/sanity-and-operator-workflows.md).