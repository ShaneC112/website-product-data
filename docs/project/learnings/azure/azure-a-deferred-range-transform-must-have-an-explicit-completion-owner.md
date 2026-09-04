# A deferred range transform must have an explicit completion owner

- **ID:** `azure-a-deferred-range-transform-must-have-an-explicit-completion-owner`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## A deferred range transform must have an explicit completion owner

Range composition has two competing timing requirements: the range urlKey must be transformed because it owns the source product link, but explicit variant-page groups must not compose before their child details and swatches arrive. The image-classification batch provides the correct barrier and queues the range key after the full batch persists.

The first deferral keyed only on `variantUrls.length`, which was safe in the live batched configuration but stranded the range key when batching or the image-classification operation was disabled. Variant transforms do not substitute for the range transform because they do not own its source url-link.

**Solution:** defer only when batch mode and the `image_classification` operation explicitly own the completion barrier; otherwise queue the range transform immediately. Log which owner was selected and test both configurations.

**Best practice:** never remove an immediate queue handoff because another asynchronous path usually completes it. Encode and test the ownership condition that guarantees the replacement handoff.

