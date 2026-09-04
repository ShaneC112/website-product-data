# Architecture

The enrichment pipeline preserves M2CRM product identity while collecting vendor evidence and producing recoverable, reviewable Sanity product content.

## Durable Stages

1. `source_render`
2. `source_extract`
3. `variant_render`
4. `variant_extract`
5. `image_classify`
6. `compose`
7. `publish`

Azure is the Node 20 Azure Functions v4 application and owns the durable queue and ledger workflow. Render is the Node/TypeScript Fastify and Playwright capture worker run in Azure Container Apps. Data owns shared schemas and identity contracts. UI is the internal Nuxt UI technical operations interface for Sanity publication failures and pipeline queue, Function, Table, blob, and review workflows. Studio is the Sanity CMS for `tcmatthews.ie`; it owns content schemas, Studio UX, and Blueprint functions.

Detailed stage contracts should live with their owning repository and be linked from this index as they are migrated.
