# Image Generation Contracts

## Purpose

Owns shared runtime contracts, registries, schemas, and versioned vocabulary for Image Generation V2 across Data, Azure, Render, UI, and Studio.

## Ownership

Data owns the public contract and validation boundary. Consumers implement adapters and workflow behavior in their owning repositories; they must not recreate these schemas locally.

## Public Boundary

The `image-generation` package export exposes the stable shared contract surface, including cache schemas, request/operation contracts, policy registries, and observability contracts. Changes here require Data build/tests before consumer validation.

## Observability Relationship

`observability/` owns the typed `flux:*` trace envelope, event taxonomy, process-map types, and candidate comparison manifest. Azure owns collection and emission; deterministic reports and baseline approval remain Azure script concerns.

## Neighboring Components

- `ai/`: model and task routing contracts used by image operations.
- `cache/`: reusable normalized feature and artifact schemas.
- `contracts/`: cross-repository request, operation, and prompt contribution contracts.
- `sanity/`: Sanity-facing image-generation schemas and fingerprints.
