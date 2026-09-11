# V2 image fixtures must track current pipeline contracts

- **ID:** `studio-v2-image-fixtures-must-track-current-pipeline-contracts`
- **Applies to:** `website-product-enrichment-sanity-studio`
- **Status:** Canonical learning detail.

## Learning

A fixture change is part of the pipeline contract, not disposable test data. When the generated image workflow changes its scene, colour, or media assumptions, the fixture must be reviewed and validated with the same Studio script and contract checks that create it.

## Prevention

- Keep fixture identity and selected variant values explicit.
- Validate the fixture through the supported Studio fixture command after changes.
- Do not treat a successful file edit as evidence that the Azure or Sanity projection contract still accepts the fixture.
- Keep generated fixture artifacts separate from source schemas and review their diff before committing.
