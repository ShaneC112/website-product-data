# Changelog

All notable changes to this package are documented in this file.

## [Unreleased]

- add the metadata-only `NormalizedPromptArtifactMetadata` envelope contract (`normalized-prompt-artifact.schema.ts`) for in-flight prompt-artifact identity, and require `templateRevision` on the room and colour-design cache schemas, `RoomPrompt`/`ColourDesignPrompt` Sanity contracts, and strict template schemas so cache reuse can validate template scope
- add reviewer governance for the local FLUX deterministic baseline, N+1 candidate impact checks, typed trace disclosure boundary, and live-operation approval stops
- add the shared FLUX prompt trace contract and comparison-manifest schema for deterministic prompt provenance and candidate-version checks
- document the approved narrow `flux:*` trace-content exception in the canonical Azure logging policy while preserving unconditional redaction for credentials, SAS values, image bytes, and raw provider headers
- document the implemented image-generation v2 queue-only Sanity boundary, dedicated external submission queue, strict shared references/status contracts, and explicit Phase 18 readiness limitations without claiming deployment
- add shared image-generation v2 terminal media status projection coverage and align Azure consumers to the Data-owned contract
- harden the image-generation v2 isolation checker with a disposable temporary workspace, excluded secret/config files, a minimal command environment allowlist, content-sensitive working-tree mutation detection, and structure-aware Studio registration transforms

## [0.1.0]

Initial shared contract package release.
