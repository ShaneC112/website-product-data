# FLUX Prompt Observability Contract

## Purpose

Defines the shared, runtime-validated vocabulary for tracing Image Generation V2 prompt construction from producer input through assembly and provider render input.

## Ownership

Data owns the Zod envelope, stage/event taxonomy, event-ID helpers, process-map node and edge types, and candidate comparison manifest. Azure owns collectors, production emission, deterministic fixture execution, and local baseline reports.

## Inputs and Outputs

Inputs are normalized JSON-safe producer values, bounded prompt text, parsed structured outputs, cache/guard decisions, rendered contributions, assembly sections, and provider render-input metadata. Outputs are validated `FluxPromptTraceEnvelope` records and typed process-map/comparison contracts.

Trace content must not contain credentials, authorization headers, cookies, SAS/signing values, image bytes, data URLs, or arbitrary raw provider payloads. Prompt content is eligible only for validated trace-level `flux:*` records under the Azure logging policy.

## Public Boundary

The contract is exported through `@shane-corrigan/website-product-data/image-generation`. Consumers should validate envelopes before emission and should use the event-ID helpers rather than constructing incompatible IDs.

## Neighboring Components

- Azure `prompt-observability/`: collector and production logging adapter.
- Azure `scripts/flux-prompt-review/`: deterministic runner, process-map validation, baselines, and candidate reports.
- Azure prompt features and assembly/render stages: event producers and source-edge owners.

This folder does not own provider calls, baseline approval, queue state, Sanity writes, or visual-adherence judgments.
