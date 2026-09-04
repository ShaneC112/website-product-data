# A Sanity product is a live M2CRM style-code group, not a snapshot of source IDs

- **ID:** `azure-a-sanity-product-is-a-live-m2crm-style-code-group-not-a-snapshot-of-source-ids`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## A Sanity product is a live M2CRM style-code group, not a snapshot of source IDs

One Sanity product can be composed from several M2CRM products, and that membership changes as
source records are added or removed. A requeue action must therefore resolve the current M2CRM
records from the shared-normalized style code at execution time, validate each record into the
existing crawl payload schema, and only then enqueue eligible members. Retaining the original IDs
would silently omit later additions.

**Best practice:** keep the Studio-to-Azure action contract minimal and discriminated; Azure owns
live source lookup and the full queue payload. For destructive group rebuilds, delete only records
whose group key matches the selected style code, never global pipeline state or another group's
same-URL evidence.

