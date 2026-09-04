# Retention begins when orchestration becomes terminal, not when it is created

- **ID:** `azure-retention-begins-when-orchestration-becomes-terminal-not-when-it-is-created`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## Retention begins when orchestration becomes terminal, not when it is created

Creation-time TTLs can expire while work is still blocked or being recovered. Deleting that active
ledger row also weakens generation fencing because an absent row is intentionally treated as an
unmanaged legacy message.

**Fix:** terminal transitions refresh retention, purge filters preserve active rows, queued
dispatches are removed before ledger rows, and timestamp fallbacks clean up terminal rows created
before TTL metadata existed.

**Best practice:** retention for coordination records must be state-aware. Never infer that old
means inactive when the same record participates in fencing, fan-in, or recovery decisions.

