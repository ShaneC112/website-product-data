# Shared read responses need runtime contracts too

- **ID:** `data-shared-read-responses-need-runtime-contracts-too`
- **Applies to:** `website-product-data`
- **Status:** Canonical learning detail.

## Learning

## Shared read responses need runtime contracts too

Sharing only a recovery request schema left the Azure response and Nuxt consumer coupled through
duplicate TypeScript types, which could not detect an older or malformed response at runtime.

**Fix:** added a shared recovery-plan schema built from the canonical pipeline stage/state enums and
used it at both the Azure producer and Nuxt proxy boundaries.

**Best practice:** when multiple services exchange operational read models, share and execute a
runtime schema at both boundaries; TypeScript aliases alone do not protect rolling deployments.

