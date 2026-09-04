# Studio learning 03: Decision confirmed with the product owner on 2026-09-03: keep `Create Imagery` and `Requ

- **ID:** `studio-03-decision-confirmed-with-the-product-owner-on-2026-09-03-keep-create-imagery-and-requ`
- **Applies to:** `website-product-enrichment-sanity-studio`
- **Status:** Canonical learning detail.

## Learning

- Decision confirmed with the product owner on 2026-09-03: keep `Create Imagery` and `Requeue
	Product` on separate Azure Storage queues. Both actions use the same safe browser boundary - a
	Studio action persists a request and a Blueprint Function sends a server-authenticated queue
	message - but their durable workflows are different. `request-room-images` owns variant roomset
	creation, immutable image jobs, cost estimates, and image-ledger status on
	`sanity-image-prepare`/`sanity-image-generate`; `sanity-actions` owns M2CRM source resolution
	and crawl/rebuild dispatch. Do not route imagery through `sanity-actions` unless that queue is
	intentionally redesigned into a typed, lifecycle-preserving generic dispatcher.
