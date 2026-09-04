# Studio learning 17: `documentEventHandler`/`scheduledEventHandler`/`pubSubEventHandler` from `@sanity/functi

- **ID:** `studio-17-documenteventhandler-scheduledeventhandler-pubsubeventhandler-from-sanity-functi`
- **Applies to:** `website-product-enrichment-sanity-studio`
- **Status:** Canonical learning detail.

## Learning

- `documentEventHandler`/`scheduledEventHandler`/`pubSubEventHandler` from `@sanity/functions` do no wrapping - calling the exported `handler` with a `{context, event}` object in a test is equivalent to invoking it in production, which makes these Functions straightforward to unit test without any Sanity-specific test harness.
