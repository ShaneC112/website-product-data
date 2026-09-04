# `crawlUrlLinkTableSchema` doesn't own every field `CrawlUrlLinkEntity` actually persists

- **ID:** `data-crawlurllinktableschema-doesn-t-own-every-field-crawlurllinkentity-actually-persists`
- **Applies to:** `website-product-data`
- **Status:** Canonical learning detail.

## Learning

## `crawlUrlLinkTableSchema` doesn't own every field `CrawlUrlLinkEntity` actually persists

`price`/`vatRate` (and now `boxSalesPrice`/`boxUnit`) are read/written by
`website-product-enrichment-azure`'s `crawlUrlLinksStore.ts` via a locally-declared
`CrawlUrlLinkEntity = CrawlUrlLinkTable & {...}` type extension, not via this package's
shared `crawlUrlLinkTableSchema` in `src/storage/url-link.schema.ts`. This is an
existing, asymmetric pattern (contrast with `crawlPageTableSchema`/`crawlProductDetailTableSchema`,
which both own their `price`/`vatRate` fields directly) - there is no runtime
zod validation of these fields on the `webcrawlurllinks` table today, only a
compile-time TS shape.

**Best practice:** when adding a new field to the box-price/pack-info family, add it
to the consumer-local `CrawlUrlLinkEntity`/`CrawlUrlLinkInput` type (mirroring
`price`/`vatRate`) rather than only to the shared schema - the shared schema
alone will not make the field reach the table today. Promoting these fields into the
shared schema (so they get real runtime validation) is a separate, deliberate future
change, not an automatic consequence of adding one more field this way.

