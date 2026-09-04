# Vision prompt inputs must be normalized independently of crawler extraction

- **ID:** `azure-vision-prompt-inputs-must-be-normalized-independently-of-crawler-extraction`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## Vision prompt inputs must be normalized independently of crawler extraction

Crawler-side swatch analysis already downloaded vendor images before calling Vision, but direct
room-image prompt preparation sent the original vendor URL to Azure OpenAI. A valid SVG swatch
therefore caused an OpenAI `400` because the API accepts only PNG, GIF, JPEG, or WebP input.

**Fix:** download each prompt-preparation swatch, transcode it to a bounded $2048 \times 2048$ PNG
data URL, and provide that normalized image to Vision. The preparation worker retains its existing
ledger failure status if the source cannot be downloaded or decoded, making the failure visible and
safe to resubmit after correction.

**Best practice:** format acceptance at one Vision call site does not imply acceptance at another.
Normalize and size-bound images at every provider boundary, with tests for both unsupported source
formats and failed downloads.

