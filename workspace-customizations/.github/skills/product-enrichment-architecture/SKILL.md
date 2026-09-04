---
name: product-enrichment-architecture
description: "Use when routing a Website Product Enrichment feature, bug, contract, stage, or ownership decision across Data, Azure, Render, UI, and Studio."
---

# Product Enrichment Architecture

Read `website-product-data/docs/project/architecture/README.md` and `project-map.json`. Shared contracts begin in Data; Azure owns durable orchestration; Render owns stateless capture; UI owns crawl operations; Studio owns Sanity schemas and Studio workflows. Verify volatile symbols and current commands in the target repository before editing.
