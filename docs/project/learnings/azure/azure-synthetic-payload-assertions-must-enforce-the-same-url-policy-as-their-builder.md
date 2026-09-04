# Synthetic payload assertions must enforce the same URL policy as their builder

- **ID:** `azure-synthetic-payload-assertions-must-enforce-the-same-url-policy-as-their-builder`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## Synthetic payload assertions must enforce the same URL policy as their builder

The `SpecifiedUrls` builder rejected non-HTTPS entries, but `assertSyntheticIdentity` originally checked only for a non-empty array. A hand-authored payload could therefore pass the safety assertion with insecure or non-string entries.

**Fix:** validate every asserted URL as a string, parse it, and require HTTPS. Keep a regression test that exercises both the builder and assertion paths.

