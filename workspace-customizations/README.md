# Website Product Enrichment

This workspace turns authoritative M2CRM product and commercial data plus vendor-site evidence into validated, reviewable Sanity product content. The durable pipeline renders vendor pages, extracts and classifies evidence, composes product detail, then publishes through controlled review and recovery paths.

## Repositories

- `website-product-data`: shared runtime contracts, storage schemas, registry data, and canonical project documentation.
- `website-product-enrichment-azure`: queue-driven orchestration, extraction, classification, composition, recovery, and publishing.
- `website-product-enrichment-render`: stateless Playwright rendering and vendor evidence capture.
- `website-product-enrichment-ui`: Nuxt operational interface for the crawl pipeline.
- `website-product-enrichment-sanity-studio`: Sanity schemas, Studio UX, and Blueprint actions.

## Working Rules

Shared contracts change in `website-product-data` first. Data, Azure, and Render use npm; UI and Studio use pnpm. Read-only M2CRM inspection is permitted when relevant. Shared Azure state changes, queue actions, deployments, migrations, and Sanity-affecting workflows require fresh approval.

See the tracked project documentation in `website-product-data/docs/project/` and run `npm run workspace:sync` from that repository to publish this workspace navigation and agent configuration.
