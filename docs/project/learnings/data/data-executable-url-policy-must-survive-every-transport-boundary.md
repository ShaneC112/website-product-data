# Executable URL policy must survive every transport boundary

- **ID:** `data-executable-url-policy-must-survive-every-transport-boundary`
- **Applies to:** `website-product-data`
- **Status:** Canonical learning detail.

## Learning

## Executable URL policy must survive every transport boundary

Manual HTTP requests already required HTTPS for specified product URLs and curated PDFs, but the
queue and render schemas accepted any URL scheme. Direct queue producers could therefore bypass
the ingress guarantee before the renderer fetched the resource.

**Best practice:** enforce HTTPS on executable evidence URLs in both ingress and queue/render
contracts. Keep intentionally permissive source fields separate when malformed upstream values
must still travel to a validation ledger.

