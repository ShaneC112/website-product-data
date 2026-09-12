# A generate stage must not delete run content before its actual downstream consumer

- **ID:** `azure-a-generate-stage-must-not-delete-run-content-before-its-actual-downstream-consumer`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

A live end-to-end run failed assembly with `Invalid colour-design artifact fingerprint` even though
`generate.colour-design` had already validated and recorded the artifact. `runColourDesignGeneration`
deleted its own run-scoped colour-design content and claim immediately after writing its generate
manifest. `assemble.direct` (the actual consumer of that value) then found no run content, re-resolved
colour-design from the mutable Sanity template cache, and produced a different semantic fingerprint
than the one already validated in the generate manifest, so assembly correctly rejected its own
dependency.

The same premature-cleanup shape existed for `room`: it was deleted by the generate worker right after
generation, before the `scene` stage - its actual consumer - read it.

**Fix:** a fingerprinted artifact's run-scoped content is owned by its actual downstream consumer, not
by the stage that produced it. `room`, `product`, and `scene` content is now retained until `scene`
durably completes; `colour-design` content is retained until `assemble.direct` durably completes
(including its blocked branches) and, on success, until the render dispatch outbox write is durable.
A generic terminal-consumer retirement path (`cleanupRetainedRunContent` /
`deleteRunContentAndClaimForTerminalConsumer`) deletes the content row and its claim in one atomic
Table transaction, so cleanup does not require the original producer's lease and cannot leave a
partially deleted content/claim pair.

A second, related defect surfaced once content was retained: the loader persisted the full
`promptArtifact`, including its `value`, into `artifactMetadataJson`. The strict, metadata-only
`NormalizedPromptArtifactMetadata` schema rejects that extra key, so reloading the retained row failed
with `Unrecognized key(s) in object: 'value'`. Retained metadata must be serialized as metadata only,
matching the room artifact and generate-manifest handling.

**Best practice:** when introducing a validated in-flight artifact that crosses a stage boundary,
identify its actual last consumer before writing any cleanup call next to its producer. "This stage is
done with it" is not the same question as "no remaining stage needs it." Prove the retention boundary
with a test that simulates the mutable backing cache changing between generate and the consumer stage,
and assert the consumer still observes the originally validated value.

### Related Sources

- [Retention begins when orchestration becomes terminal, not when it is created](azure-retention-begins-when-orchestration-becomes-terminal-not-when-it-is-created.md) covers ledger-row TTL/state-awareness; this entry covers cross-stage ownership of in-flight run content, a different boundary.
- [Image-generation V2 prompts and recovery handoffs need explicit boundaries](azure-image-v2-prompt-provenance-and-recovery-handoffs-need-explicit-boundaries.md) covers missing downstream orchestration rows after an interruption; this entry covers premature deletion of an upstream dependency's content before its consumer runs at all.
