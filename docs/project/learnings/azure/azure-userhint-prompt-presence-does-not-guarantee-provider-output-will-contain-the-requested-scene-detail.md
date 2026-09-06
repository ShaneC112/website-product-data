# UserHint prompt presence does not guarantee provider output will contain the requested scene detail

- **ID:** `azure-userhint-prompt-presence-does-not-guarantee-provider-output-will-contain-the-requested-scene-detail`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## UserHint prompt presence does not guarantee provider output will contain the requested scene detail

The room-image pipeline was updated so a validated `userHint` survives request construction,
passes Azure validation, and is promoted into the prompt as a required constraint. Even after
that, generated roomshots could still omit the requested seasonal or editorial detail in the
final image.

Prompt preparation and provider generation are separate guarantees.

- Azure can guarantee that a safe `userHint` is present in the prepare command.
- Azure can guarantee that the final generation prompt explicitly preserves that hint as required
	scene content.
- Azure cannot currently guarantee that the downstream image model will faithfully render every
	requested non-flooring scene detail.

This means "the hint is in the prompt" and "the image visibly contains the requested detail" are
not the same contract.

**Fix:** keep the current validation and prompt-preservation behavior so safe hints are not
silently dropped, but treat editorial fidelity to `userHint` as an unsolved verification gap.

**Best practice:** if `userHint` fidelity becomes a product requirement, add a post-generation
verification step that checks whether required scene details are present in the output image and
returns a structured outcome such as `verified`, `missing-required-detail`, or `needs-review`.
Do not claim end-to-end `userHint` fidelity in docs or UI until that verification layer exists.