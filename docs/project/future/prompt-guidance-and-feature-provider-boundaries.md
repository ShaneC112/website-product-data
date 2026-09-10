# Prompt Guidance and Feature Provider Boundaries

Status: future development direction with partial groundwork implemented; not a new runtime contract.

## Intent

Make every AI-backed image-generation feature explicit about three separate concerns:

1. The feature-owned system instruction that defines the model's role and output shape.
2. The user brief or evidence payload that supplies the current room, product, image, or design context.
3. The provider adapter that sends the prompt using the provider's actual endpoint and request contract.

This keeps prompt ownership understandable as room, product, colour-design, texture, scene, and final image generation evolve independently.

## Work already completed

The current Azure v2 work has established the following groundwork:

- Room analysis uses a room-owned OpenAI adapter and a dedicated system prompt for architectural facts.
- Colour-design and texture retain separate image-analysis provider boundaries.
- Scene has a separate text-only OpenAI seam and a structured interior-design brief builder.
- Room-specific scene guidance covers canonical room types without turning furnishings into mandatory inventories.
- Shared prompt-safety wording is kept in one common helper and appended to feature system prompts without changing the feature-specific instructions.
- The final FLUX prompt is assembled separately from the GPT text and vision analysis prompts.
- The FLUX image transport follows the verified Ops-Hub direct provider request rather than assuming the generic OpenAI SDK image method is interchangeable with the Black Forest Labs endpoint.

This groundwork does not change the shared Data schemas by itself and does not authorize Sanity persistence for future scene/image logs.

## Future work

When the scene design is approved for durable use:

- version each feature system prompt and record the version with the provider operation;
- keep room architecture, product facts, colour/texture constraints, scene design, camera policy, and brand guidance as separately testable prompt sections;
- define a provider-neutral prompt contract before adding provider-specific image or Responses API features;
- add deterministic validation for required protected facts, prohibited structural changes, flooring invariants, and bounded text output before persistence;
- persist the final per-image scene data and FLUX prompt only at the post-image workflow boundary, keyed by the generated image identity;
- add live, non-billable contract probes where possible and explicitly approved billable smoke tests for provider changes.

## Ownership boundary

Room, product, colour-design, texture, scene, camera, and brand identity continue to own their respective inputs. The final assembly stage owns prompt ordering and composition. The image adapter owns provider transport and response staging. No feature may silently replace another feature's facts or use a provider-specific request shape as a shared contract.

## Reconsideration trigger

Revisit this direction when a second image provider, a Responses API image workflow, durable scene persistence, or a new multimodal feature requires a prompt contract that cannot be expressed cleanly through the current feature-owned system prompt and provider-adapter boundaries.
