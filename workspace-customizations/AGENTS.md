# Product Enrichment Workspace Rules

## Intent

Build a trustworthy product-enrichment system that preserves M2CRM commercial identity, grounds content in vendor evidence, and keeps every pipeline outcome recoverable and reviewable before Sanity publication.

## Routing

- Shared queue, request, storage, registry, or Sanity projection contracts belong in `website-product-data` and are built before consumers.
- Azure owns durable queue, ledger, extraction, recovery, and publication orchestration.
- Render is stateless and owns Playwright browser capture only; it does not own Azure Table or downstream orchestration logic.
- UI owns crawl operations UX and server-side Azure access; it does not own Sanity writes or browser automation.
- Studio owns Sanity schema, Studio UX, and Blueprint functions.

## Commands

Verify the working directory before every package-manager command. Use npm in Data, Azure, and Render. Use pnpm in UI and Studio. For a non-trivial repeatable operation, search the project and repository script indexes before creating a one-off procedure.

## Code Style

Add JSDoc when a function's contract, options, return semantics, side effects, ownership, or invariant are not obvious from its name and types. Do not add narration comments. Treat roughly 300-400 lines or three responsibilities as a review signal: split into cohesive, independently testable helpers only when it improves readability. Keep orchestrators slim, use direct internal imports, colocate focused tests, and expose minimal barrel APIs.

## Safety

Read-only M2CRM queries and snapshots are permitted when relevant, without exposing secrets. Ask for fresh approval before resetting or clearing shared Azure state, enqueueing or draining shared queues, deploying, reconfiguring services, applying migrations, or any workflow that can write Sanity. Preserve unrelated dirty changes. Do not commit, push, tag, or delete branches unless explicitly authorized.

Canonical sources are in `website-product-data/workspace-customizations/`. Run `npm run workspace:sync` to publish them and `npm run workspace:sync:check` to detect drift.
