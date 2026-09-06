---
name: codebase-design
description: "Use when designing or restructuring a Website Product Enrichment module, choosing an interface or dependency seam, reducing pass-through layers, or making behavior testable through a smaller public surface."
---

# Codebase Design

Design cohesive modules that hide meaningful behavior behind a small interface. Apply this reference when a request changes structure or public contracts; do not turn a narrow bug fix into an unsolicited architecture rewrite.

## Local Constraints First

Read the target repository `AGENTS.md` and load Product Enrichment Architecture when ownership or shared contracts are involved. Data-first contracts, repository ownership, durable workflow boundaries, direct internal imports, and minimal barrel exports take precedence over generic module advice. A durable ownership change requires an explicit architecture decision and significant restructuring requires an approved plan.

## Vocabulary

- **Module**: cohesive behavior with an interface and implementation, at any useful scale.
- **Interface**: everything callers must understand, including types, invariants, ordering, failures, configuration, and material performance characteristics.
- **Implementation**: behavior hidden behind the interface.
- **Seam**: a location where behavior can vary without callers editing the implementation.
- **Adapter**: a concrete implementation selected at a seam.
- **Depth**: useful behavior exposed through a comparatively small interface.
- **Leverage**: capability callers gain from the module without relearning its implementation.
- **Locality**: the concentration of change, diagnosis, and verification in the module that owns the behavior.

Use established repository and domain terms in code. This vocabulary supports design discussion; it does not rename existing product concepts gratuitously.

## Design Tests

1. **Ownership**: Does the behavior live in the repository and lifecycle stage that owns its durable outcome?
2. **Deletion**: If the module disappeared, would its complexity reappear across several callers? If not, it may be a pass-through layer.
3. **Interface**: Can callers know less while retaining the required behavior? Remove configuration and sequencing knowledge that the module can own safely.
4. **Variation**: Is a seam backed by real variation, testing need, external dependency, or lifecycle isolation? Avoid speculative adapters with one fixed implementation.
5. **Testing**: Can representative behavior be exercised through the same interface callers use? A need to test through internals is evidence that the interface or ownership may be wrong.
6. **Locality**: Will a future fix occur once in the owning module, or be repeated across callers and tests?

## Testability

Accept genuinely variable dependencies at explicit seams instead of constructing them deep inside business logic. Separate deterministic decisions from side-effecting adapters where that matches the existing architecture. Prefer returning a decision or result that an orchestrator applies over mixing policy, transport, persistence, and telemetry in one function.

Keep internal helpers private unless callers need them. Add a public abstraction only when it hides real complexity, removes meaningful duplication, or represents an established domain contract.

## Completion

A design or restructuring proposal is complete when it names the owning module, its interface and invariants, the behavior hidden behind it, required adapters, representative tests through the interface, affected callers, migration order, and focused validation. For a routine edit, apply only the relevant tests above and keep the change local.

## Attribution

Adapted for this workspace from Matt Pocock's `codebase-design` skill. See [UPSTREAM.md](UPSTREAM.md) for source and license information.