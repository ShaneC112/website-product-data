# Azure Learning: UserHint Prompt Presence Does Not Guarantee Provider Output Will Contain The Requested Scene Detail

## What happened

The room-image pipeline was updated so a validated `userHint` survives request construction, passes Azure validation, and is promoted into the prompt as a required constraint. Even after that, generated roomshots could still omit the requested seasonal or editorial detail in the final image.

## Why it happened

Prompt preparation and provider generation are separate guarantees.

- Azure can guarantee that a safe `userHint` is present in the prepare command.
- Azure can guarantee that the final generation prompt explicitly preserves that hint as required scene content.
- Azure cannot currently guarantee that the downstream image model will faithfully render every requested non-flooring scene detail.

This means "the hint is in the prompt" and "the image visibly contains the requested detail" are not the same contract.

## Prevention / future development

Treat this as a future-development gap, not a solved deterministic guarantee.

- Keep the current validation and prompt-preservation behavior so safe hints are not silently dropped.
- If editorial fidelity to `userHint` becomes a product requirement, add a post-generation verification step that checks whether required scene details are present in the output image.
- That verification should produce a structured outcome such as `verified`, `missing-required-detail`, or `needs-review`, rather than relying on manual visual inspection alone.
- Do not claim end-to-end `userHint` fidelity in docs or UI until that verification layer exists.

## Applies to

- `website-product-enrichment-azure`
- Sanity image generation prepare/generate flow