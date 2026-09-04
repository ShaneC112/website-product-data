# A response cache must not become a session store

- **ID:** `render-a-response-cache-must-not-become-a-session-store`
- **Applies to:** `website-product-enrichment-render`
- **Status:** Canonical learning detail.

## Learning

## A response cache must not become a session store

Successful HTTP status alone is not enough to make a browser response replayable. Private or
`no-store` responses and responses carrying `Set-Cookie` can represent verification state rather
than reusable content; hop-by-hop headers can also be invalid when a cached body is fulfilled.

**Best practice:** reject private, no-cache, no-store, and session-bearing responses, strip session
and transport headers, and bypass hosts whose anti-bot pages can return HTTP 200. Dynamic vendor
pagination must fail explicitly when a visible loader stops growing instead of persisting a partial
manifest.

