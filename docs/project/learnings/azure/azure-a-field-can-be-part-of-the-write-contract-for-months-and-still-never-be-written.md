# A field can be part of the write contract for months and still never be written

- **ID:** `azure-a-field-can-be-part-of-the-write-contract-for-months-and-still-never-be-written`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## A field can be part of the write contract for months and still never be written

`crawlUrl` was already a defined, optional field on `CrawlUrlLinkTable`
(`website-product-data`), but none of the 5 `upsertCrawlUrlLink` call sites (4 in
`crawlRequestDispatcher.ts`, 1 backfill in `crawlTransformWorker.ts`) ever actually
set it - the field simply never appeared in any upsert payload. This meant every
`webcrawlurllinks` row's `crawlUrl` was permanently `undefined`, which
`website-product-enrichment-ui`'s "canonicalSource.url" derivation depended on to
enable its "Re-queue" button - so re-queueing was silently unavailable for every
group, with no error anywhere (the type system didn't catch it because the field is
optional, and no test asserted it was populated).

**Fix:** added `crawlUrl: canonicalUrl` (or `message.url`/`page.url`, whichever was
in scope) to all 5 call sites, added `crawlUrl` assertions to the existing
dispatcher tests so a future refactor that drops the field again fails fast, and
backfilled the 3 already-crawled groups' existing rows via a one-off script.

**Lesson:** an optional field on a shared schema is easy to add without ever
wiring up a writer for it, and just as easy to forget entirely since nothing
breaks - if a field feeds a UI capability (like an enabled/disabled button), assert
that it's actually populated in the write-path tests, not just that the schema
accepts it.

