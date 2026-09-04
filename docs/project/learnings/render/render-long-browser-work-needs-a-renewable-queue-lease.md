# Long browser work needs a renewable queue lease

- **ID:** `render-long-browser-work-needs-a-renewable-queue-lease`
- **Applies to:** `website-product-enrichment-render`
- **Status:** Canonical learning detail.

## Learning

## Long browser work needs a renewable queue lease

Westex pagination can legitimately run longer than the original fixed queue visibility timeout.
Without renewal, another worker can claim the same message while the first render is still active,
creating duplicate completions and storage writes.

**Best practice:** renew queue visibility at a bounded interval, use the newest pop receipt for
deletion, and log claim, renewal, completion enqueue, deletion, and failure with message and run
identity. Manual drain endpoints should await the drain so polling failures reach the caller.

