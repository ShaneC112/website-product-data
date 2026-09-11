---
name: image-v2-flux-prompt-review
description: "Use when asked to `review flux pipeline`, reviewing Image Generation V2 FLUX prompt quality, tracing Vision AI or cached prompt fragments into final assembly, diagnosing prompt-versus-image adherence, or locating the producer responsible for a weak flooring roomset instruction."
---

# Image V2 FLUX Prompt Review

Review prompt quality as a provenance chain, not as an isolated final string. Current Azure code, shared Data contracts, and durable artifacts define local behavior. Black Forest Labs guidance defines FLUX prompting characteristics but does not override product, evidence, safety, provider, or ownership rules.

## Provider Invariant

Image Generation V2 uses BFL `FLUX.2-pro` through Azure AI Foundry:

- `website-product-data/src/ai/task-routing.ts` maps `image.render.direct` to `flux-2-pro-image-generation`.
- `website-product-data/src/ai/model-registry.ts` identifies `flux-2-pro` as an `azure-ai-image` provider-family model.
- `website-product-enrichment-azure/src/core/ai/configuration.ts` binds Azure endpoint, key, and deployment environment variables.
- `website-product-enrichment-azure/src/core/ai/adapters/azureAiImage.ts` sends `FLUX.2-pro` requests to an Azure Foundry provider, project, or Azure OpenAI-compatible image endpoint.

This is not a direct BFL API integration. Never recommend `api.bfl.ai`, BFL credentials or billing, the hosted `https://mcp.bfl.ai` service, `flux-mcp` generation/history tools, or bypassing Azure as a fix. Diagnose and propose changes only within the Azure route, deployment, adapter, quota, payload, response, and observability boundaries. A possible upstream feature does not prove that Azure exposes it or that the local adapter implements it.

## Establish Scope

Record the available request ID, run ID, run epoch, template ID/revision, product and variant identity, room, aspect ratio, prompt hash, and output image. Treat Azure-hosted BFL FLUX.2 Pro as the expected route and report any current route evidence that conflicts with that invariant.

If the review starts from code or a prompt without run artifacts, state which provenance and visual claims cannot be proven. Read-only inspection is allowed. Generating an image, connecting to BFL or FLUX MCP, enqueueing work, clearing shared state, deployment, and Sanity writes require fresh approval or are outside this review skill.

## Full Pipeline Command

When the user says `review flux pipeline`, perform a static review of the complete active prompt-construction path. Do not stop because no request ID, final prompt, trace, or image was supplied, and do not reduce the task to reviewing `03-assemble/direct/handler.ts` alone.

Build an inventory with one row per active contribution or section:

| Review field | Required evidence |
| --- | --- |
| Stage and responsibility | Generate feature, deterministic policy, Sanity input, renderer, or assembly |
| AI instruction | Exact system prompt and user prompt builder, or `not AI-generated` |
| Inputs | Evidence images and authoritative product, room, colour, creative-direction, or brand fields |
| Output contract | Provider response schema and runtime parser, or deterministic type/schema |
| Guards | Normalization, sanitization, deterministic constraints, validation, and blocked/fallback behavior |
| Cache | Key scope, evidence identity, semantic fingerprint, prompt/schema version, and validation before reuse |
| Final destination | Exact assembled section and ordering in the FLUX prompt |
| Quality finding | Earliest defect, downstream symptom, and confidence |

Inspect active prompt producers for texture, colour design, scene, pattern, camera, brand identity, product/flooring facts, room/user intent, and exclusions. Verify active contribution planning in `02-generate`, resolution in `03-assemble/registry.ts`, section rendering in `prompt-features/*/render.ts`, and final ordering in `03-assemble/direct/handler.ts`. Follow imports to the controlling implementation rather than assuming every feature is Vision-generated.

For every AI-produced contribution, review all of these as one contract:

1. Evidence selection and image normalization.
2. System prompt scope, authority, exclusions, and safety guidance.
3. User prompt specificity, ordering, examples, room/product context, and requested output semantics.
4. JSON schema field meaning, requiredness, bounds, and agreement with the runtime parser.
5. Provider-output normalization, deterministic augmentation, rejection, and fallback.
6. Cache invalidation inputs and persisted-schema validation.
7. Rendering of structured fields into natural-language FLUX instructions.
8. Assembly order, duplication, contradictions, priority, colour binding, negative phrasing, and total prompt focus.

A field being present in structured output is not enough. Verify that its semantics survive normalization and rendering, and that the final assembly gives it appropriate priority without competing instructions.

### Project Knowledge

Before recommendations, scan `website-product-data/docs/project/learnings/azure/README.md` for prompt, Vision, cache, schema, image-generation, user-hint, and provider learnings. Open only applicable details. At minimum, account for these current invariants when their paths are involved:

- prompt provenance and render handoffs are separate boundaries;
- cache identity does not replace persisted-schema validation;
- prompt guidance needs deterministic guards before persistence;
- every Vision boundary must normalize and size-bound its own image inputs;
- strict provider schemas and runtime parsers must agree;
- prompt presence does not prove provider output or visual adherence.

Also inspect relevant Azure and Data `AGENTS.md`, nearest stage READMEs, shared contracts, and focused tests. Treat plans and completed-plan notes as historical context unless current implementation confirms them.

### Recommendation Rule

Improve the earliest layer that owns the defect:

- Change a Vision system prompt when role, authority, prohibited inference, or response behavior is wrong across requests.
- Change a Vision user prompt builder when evidence context, room/product requirements, ordering, or task-specific detail is missing or ambiguous.
- Change the response schema when the assembly needs information that is absent, overloaded, weakly typed, or not separable into locked and variable concerns.
- Change normalization or deterministic guards when model output must be sanitized, completed, bounded, or rejected regardless of prompt compliance.
- Change cache identity/versioning when corrected prompt semantics could reuse stale artifacts.
- Change a section renderer when structured content is accurate but converted into weak, repetitive, negative-heavy, or poorly prioritized FLUX prose.
- Change final assembly when good sections conflict, repeat, appear in the wrong order, or lack a clear hierarchy.

Do not recommend editing a materialized final prompt by hand. Every proposed improvement must name the producer file or assembly function, explain why that layer owns the change, and state which final FLUX section and expected image behavior it improves. Separate confirmed defects from hypotheses requiring run artifacts or output-image evidence.

## Trace Provenance

Follow the first applicable source in this order:

1. `website-product-enrichment-azure/src/sanity-images-v2/02-generate/registry.ts` and `02-generate/worker.ts` establish generated contributions and terminal contribution summaries.
2. `prompt-features/texture/textureAnalysis.ts` supplies the Vision system/user prompts and strict response schema. `texture/handler.ts` selects evidence, cache, Vision, or deterministic fallback; `texture/cache.ts` binds generated text to asset refs, source fingerprint, model, and prompt version.
3. `prompt-features/colour-design/vision.ts` extracts a swatch palette. `colour-design/handler.ts` distinguishes `sanity-cache`, `vision-palette`, and deterministic sources before `colour-design/render.ts` creates prompt text.
4. `prompt-features/scene/sceneAnalysis.ts` builds the scene design question and structured response. `scene/handler.ts` normalizes directives, adds required room content, and creates the scene artifact; `scene/render.ts` orders the direct FLUX scene instructions.
5. `prompt-features/camera/handler.ts` resolves camera policy and `camera/render.ts` renders it. `prompt-features/brand-identity/handler.ts` reads validated Sanity identity and `brand-identity/render.ts` renders it. These are separate from scene Vision output.
6. `03-assemble/registry.ts` resolves the artifacts and dependency details. `03-assemble/direct/handler.ts` assembles product, colour, texture, pattern, scene, camera, brand, flooring-colour lock, and exclusions. `03-assemble/common/structural-validation.ts` checks only required headings and unresolved placeholders; it is not a semantic quality gate.
7. `04-render/registry.ts` rehydrates `inputReference`, records the prompt hash, builds the canonical image operation through `04-render/direct/handler.ts`, and invokes the Azure-configured provider route.
8. `core/ai/adapters/azureAiImage.ts` is the final provider request authority. The canonical operation currently carries evidence `references`, but this adapter serializes prompt and output settings rather than reference images. Treat the active direct render as text-to-image unless current adapter evidence shows otherwise; do not apply BFL direct-API multi-reference limits or `input_image` field advice to this path.

For each final section, record:

| Field | Meaning |
| --- | --- |
| Section | Final prompt heading or bounded excerpt |
| Origin | Vision-generated, cached Vision output, Sanity-authored, deterministic policy, or fallback |
| Producer | Exact file and function that first creates the content |
| Inputs | Evidence assets and approved product, room, colour, or creative-direction fields |
| Identity | Prompt/schema version, source/semantic fingerprint, template revision, or route version |
| Transformations | Validation, normalization, sanitization, rendering, and assembly steps |
| Finding | Defect at the earliest responsible layer, or `none observed` |

Do not blame a downstream renderer for content already missing from its input. Do not blame a producer when its requirement survives assembly and transport but the image omits it.

## Review Each Layer

### Evidence And Vision Generation

- Confirm selected image roles and asset refs match the intended texture or swatch evidence.
- Check whether cache identity covers the evidence set, prompt version, template revision, and semantic inputs that can change the output.
- Review system and user prompts for a single responsibility, explicit exclusions from the analysis domain, sufficient visual specificity, and instructions that match the strict response schema.
- Check parsed provider output before normalization. Distinguish an underconstrained prompt from provider noncompliance, schema rejection, sanitization, stale cache reuse, and deterministic fallback.
- Ensure scene content separates locked architecture/flooring/camera facts from variable furnishings and style.

### Assembly And FLUX Readiness

Use the official BFL prompt shape as a completeness heuristic:

```text
[Subject] + [Action/Pose] + [Style/Medium] + [Context/Setting] + [Lighting] + [Camera/Technical]
```

For an interior roomset, interpret this as product/flooring subject, installed presentation and room activity, design style, architectural/furnishing context, explicit lighting, and camera/composition policy.

- Prefer specific natural-language instructions over disconnected keyword lists.
- Check that the highest-priority product, furniture, and composition requirements appear early because FLUX gives earlier content greater weight. They must not be diluted by repeated lower-priority prose.
- Require explicit lighting and coherent camera direction. Detect contradictions between scene-generated camera details and the separate camera policy.
- Use `#RRGGBB` values with colour names and bind each colour to a specific object where exact colour matters. Prefer a limited coherent palette and confirm supporting palette colours are not allowed to recolour the flooring.
- FLUX has no separate negative-prompt mechanism. Flag long `do not`/`avoid` lists, double negatives, and exclusion-heavy wording that could be restated as a positive target. Do not recommend deleting a local invariant; propose a positive formulation or a narrowly retained prohibition.
- Check canonical references and prompt intent separately from provider transport. Do not claim a source image influenced FLUX unless the Azure adapter payload actually includes it. If reference conditioning is expected, identify the missing Azure adapter capability rather than suggesting direct BFL access.
- Check for ambiguity, duplication, internal contradiction, impossible simultaneous requirements, invented dimensions/products, unresolved placeholders, and excessive prompt length or hierarchy collapse. BFL describes roughly 30-80 words as a normal effective range and 512 tokens as a model ceiling; treat those figures as review heuristics, not permission to remove local invariants or as proof of Azure request limits.
- Typography and multi-reference rules apply only when those features are actually requested. Quote required visible text; identify each reference role unambiguously.

Do not recommend switching to FLUX.2 Max, Flex, Klein, a FLUX.1 model, or a direct BFL endpoint. If the selected Pro model has a material limitation, report the limitation against the current Azure-hosted contract and leave any model or provider change as an explicit architecture decision outside this review.

## Upstream Applicability

Use only the provider-independent portions of `black-forest-labs/skills/flux-image-best-practices`: prompt structure, specificity, natural prose, front-loading, lighting, camera/composition language, positive alternatives, object-bound hex colours, and conceptual reference-role clarity.

Do not import or follow:

- the `bfl-api` skill's direct endpoints, polling, webhooks, authentication, rate limits, or payload examples;
- FLUX MCP installation, OAuth, BFL billing, generation, editing, variations, history, credits, or skill-query tools;
- BFL direct-API `input_image*` fields, reference-count/megapixel limits, response URLs, or pricing;
- model-selection recommendations, FLUX 3 video workflows, virtual try-on, inpainting, or unrelated generation modes.

`black-forest-labs/flux-mcp` adds no review capability that is not already available from the static official prompting skill. Its operational tools target BFL's hosted service and are intentionally excluded from this Azure Foundry workflow.

### Transport And Visual Adherence

- Compare `assembled-prompt-ready` and `render-input-rehydrated` hashes and bounded metadata. A mismatch is a handoff defect; a match proves only unchanged transport.
- Treat provider acceptance, operation reuse, and materialization separately from semantic adherence.
- When an output image exists, compare it with authoritative evidence and the final prompt for flooring identity, colour, texture, installation scale, room architecture, mandatory furnishings, palette, lighting, camera, unwanted floor coverings, artifacts, and reference leakage.
- Classify a visible omission as `visual adherence` when the instruction is specific, prioritized, present in the provider input, and consistent with references. Otherwise assign it to the earliest deficient provenance layer.

## Severity And Verdict

- `Critical`: wrong product/evidence identity, stale cross-template cache, prompt transport mismatch, or a recommendation that could corrupt authoritative flooring representation.
- `High`: missing or contradictory product, colour, texture, architecture, mandatory room content, or camera constraint likely to invalidate the image.
- `Medium`: weak hierarchy, generic Vision output, excessive exclusions, duplication, or reference ambiguity likely to reduce adherence.
- `Low`: clarity or maintainability issue with limited expected image impact.

Return `READY` only when provenance is coherent, required information survives into the verified provider input, FLUX guidance is satisfied or consciously overridden by a local invariant, and any available image passes adherence review. Return `REVISE` when a concrete defect has an owned fix location. Return `INSUFFICIENT EVIDENCE` when missing artifacts prevent the requested claim.

## Report Format

1. Findings, highest severity first, with layer, evidence, impact, smallest responsible fix location, and expected downstream improvement.
2. Prompt-pipeline inventory and provenance matrix.
3. Stage recommendations: current weakness, producer-level change, assembly consequence, expected FLUX improvement, confidence, and validation needed.
4. FLUX readiness verdict and concise rationale.
5. Applicable project learnings and evidence gaps.
6. Knowledge-retention ledger: candidate, novelty search, evidence status, Project Knowledge handoff, canonical destination, and disposition.

For `review flux pipeline`, finish with a prioritized improvement sequence. Put producer prompt/schema/guard corrections before renderer and assembly refinements when downstream quality depends on those corrections. Do not provide a rewritten final prompt that bypasses its generating stages.

## Preserve New Knowledge

Run this gate after the technical review and before the final response:

1. Extract findings that may be durable beyond the reviewed request: recurring failure modes, non-obvious provider or adapter constraints, prompt-to-schema invariants, cache invalidation traps, cross-stage ownership rules, and proven differences between prompt presence and image adherence.
2. Search `website-product-data/docs/project/learnings/README.md`, the applicable repository learning index, architecture pages, decisions, operations, and future notes for the same fact or invariant.
3. Mark duplicates `already documented` and cite the existing canonical source.
4. Mark a discovery `new and evidence-backed` only when current code plus a test, reproducible run, trace, provider contract, or other concrete evidence establishes the symptom, cause, invariant, and prevention. A code smell or recommendation alone is not a learning.
5. For each `new and evidence-backed` discovery, invoke **Project Knowledge** with a bounded documentation handoff. Ask it to verify overlap and facts, then create or amend the canonical document and index using the existing hierarchy and learning template. Include external-source attribution when the knowledge depends on BFL or Azure documentation.
6. Review Project Knowledge's returned disposition and paths. If it rejects or merges the item, preserve that reason. If it creates or updates documents, include its validation result.
7. Keep unverified discoveries in the final ledger as `candidate awaiting proof`, with the missing evidence and a focused verification step. Never silently omit them and never promote them prematurely.

Use this handoff shape:

```text
Review and preserve this Image V2 FLUX knowledge candidate.

Finding: <concise durable claim>
Symptom/impact: <demonstrated consequence>
Root-cause evidence: <current code, test, trace, or run paths>
Invariant: <rule that should remain true>
Prevention/verification: <focused guard or check>
Related canonical docs: <existing sources searched>
External source and revision: <when applicable>

Independently verify the evidence and search for overlap. Accept, merge, relocate,
reject, or block the candidate. If accepted, create or amend the canonical focused
document and required index, then run the applicable documentation checks. Do not
change implementation code or infer unproven behavior.
```

Project Knowledge owns the destination and wording. The reviewer owns ensuring the handoff happens and that its disposition appears in the final review.

Use bounded excerpts and hashes. Do not reproduce full prompts, source images, provider payloads, credentials, or sensitive run data.

## Attribution

FLUX prompting guidance is adapted from Black Forest Labs' `flux-image-best-practices` skill. See [UPSTREAM.md](UPSTREAM.md) for the reviewed source and MIT license.