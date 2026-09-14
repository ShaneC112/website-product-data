# Architecture README Policy

## Purpose

Architecture should be discoverable where the implementation lives.

Every meaningful implementation boundary must explain:

- why it exists
- what responsibility it owns
- what it receives
- what it produces
- what it does not own
- how it relates to neighboring components

This policy applies to human-authored and agent-authored code. Agents must follow it whenever they create a new architectural boundary, implementation folder, workflow stage, feature, or subsystem.

A README is part of the architecture. It is not merely a file listing.

## Scope

This policy applies across the workspace and all repositories.

A folder requires a README when it represents one or more of the following:

- a domain concept
- a workflow stage
- a feature
- an integration boundary
- a reusable implementation boundary
- a subsystem with its own inputs, outputs, state, or ownership rules

A folder does not require a separate README when it contains only incidental files and has no independently meaningful responsibility. In that case, its parent README must explain the files sufficiently.

## Required Documentation

### Concept-owning folders

Every concept-owning folder must contain a `README.md`.

The README must document the concept represented by the folder, not simply repeat the names of its files.

## README Content Contract

Every README for a concept-owning folder or workflow stage must state the following information under these headings or clear equivalent headings. It may be concise, but it must answer every applicable item in plain language.

1. **Purpose**: the human or business outcome the boundary exists to achieve, not merely the name of a component or file.
2. **Current status**: what is live now, and what is future, inactive, experimental, or otherwise not part of the active workflow. Omit this only when the whole described capability is current.
3. **Inputs**: the authoritative request, evidence, references, or state it receives, including where those inputs came from when that matters.
4. **Outputs and side effects**: the artifacts, references, state transitions, external writes, or other results it produces. State explicitly when rich data is intentionally kept out of a transport or orchestration boundary.
5. **Responsibilities**: the decisions and behavior this folder owns.
6. **Does not own**: consequential responsibilities deliberately performed by a neighboring feature, orchestration, transport, persistence, provider, or UI boundary.
7. **Workflow relationship**: what happens before this boundary, what happens after it, and how the handoff is made.
8. **Public boundary**: the supported entry point, interface, or export surface when the folder exposes one. State that there is no public boundary when it is intentionally private.

Document important files only when their role is not clear from their name. Do not turn a README into a line-by-line source listing.

### Workflow stages

Each meaningful workflow stage must have a README explaining the stage in plain language.

Stage documentation must meet the README Content Contract. It must be understandable without requiring the reader to know the implementation language or framework.

### Nested concepts

A nested folder requires its own README when it represents a distinct concept that a maintainer may need to understand independently.

Examples include:

- direct execution
- validation
- persistence
- provider integration
- normalization
- assembly
- rendering
- recovery

The existence of a folder alone is not sufficient reason to add a README. The deciding factor is whether the folder has a meaningful independent responsibility.

## README Content Rules

READMEs must describe current behavior accurately.

They must distinguish between:

- current implementation and future design
- orchestration and domain behavior
- input resolution and output persistence
- policy and mechanism
- shared contracts and local implementation
- provider interaction and business responsibility
- workflow state and business data

When a boundary is easy to misunderstand, the README must state what the folder does not own.

Examples include:

- queue claiming
- retries
- persistence
- external API calls
- prompt assembly
- lifecycle state
- publishing
- user-interface behavior
- cross-repository contracts

A README must not claim that a capability exists because a similarly named file, handler, schema, or planned design exists elsewhere.

## Agent Implementation Rules

Before making a structural or behavioral change, an agent must identify the nearest documentation boundary.

When creating a new concept-owning folder, the agent must create its README in the same change.

When changing the responsibility, public boundary, inputs, outputs, or ownership of an existing folder, the agent must update that folder's README in the same change.

When splitting a folder into multiple concepts, the agent must:

1. determine whether each new folder has an independent responsibility
2. create READMEs for the new concept-owning folders
3. update the parent README to describe the new relationships
4. remove duplicated or obsolete explanations

Agents must not create architecture documentation for speculative designs unless the change is explicitly a future-design or planning document.

## Evidence and Accuracy

Documentation must be grounded in the current implementation.

Before writing or changing an architectural README, the author should inspect:

- the folder's public entry points
- the controlling implementation
- focused tests
- the nearest caller or parent stage
- relevant shared contracts
- existing documentation for the same concept

Documentation must not be based only on filenames or directory structure.

If implementation and documentation disagree, the implementation must be investigated before either is changed. The author must not silently document an assumption.

## Documentation Hierarchy

Documentation should be maintained at the narrowest useful location.

- Repository READMEs explain repository purpose and major boundaries.
- Subsystem READMEs explain subsystem architecture.
- Folder READMEs explain local ownership and workflow.
- Focused architecture documents explain cross-repository or cross-cutting rules.
- Future documents explain designs that are not currently implemented.
- Operational documents explain repeatable procedures and safety boundaries.

Indexes should route readers to focused documents. They should not become catch-all architecture documents.

The same rule should not be copied into multiple documents. Where a rule is shared, document it once and link to it from local READMEs.

## Style Rules

Use clear, direct language appropriate to the intended reader.

Prefer:

- domain language
- short sections
- explicit ownership boundaries
- stable concepts over temporary implementation details
- links to nearby documentation
- examples only when they clarify a difficult boundary

Avoid:

- line-by-line code descriptions
- copying complete type definitions into prose
- documenting every file when the file names are already clear
- undocumented claims about external systems
- framework-specific detail in non-technical workflow documentation
- repeating the same architecture rule in multiple places
- describing planned behavior as implemented behavior

## Documentation Maintenance

A code change is incomplete when it leaves the architecture documentation inaccurate.

Documentation must be reviewed when a change:

- creates or removes a folder
- changes a folder's responsibility
- changes a public entry point
- changes inputs or outputs
- changes persistence or ownership
- introduces a new workflow stage
- splits or combines concepts
- changes cross-repository behavior
- changes a recovery, retry, or publication boundary

The relevant README or architecture document should be updated as part of the same change, unless the change is explicitly marked as an internal implementation detail with no architectural effect.

## Completion Checklist

Before completing an implementation, the author must confirm:

- meaningful concept-owning folders have READMEs
- every applicable README Content Contract item is answered accurately
- workflow stages explain their human purpose, inputs, outputs, and before/after handoffs
- nested READMEs exist where nested folders represent independent concepts
- ownership and non-ownership are clear
- public boundaries are documented
- current behavior is separated from future plans
- existing documentation was checked for duplication
- links to related documentation are valid
- documentation matches the implementation and focused tests
