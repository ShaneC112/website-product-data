# Operations

This index routes operators to the repository-owned procedures for repeatable work. It does not replace a runbook or authorize its side effects.

## Safety Boundary

- Read-only M2CRM inspection and local diagnostics are permitted when relevant.
- Queue actions, shared Azure writes or resets, deployments, migrations, and Sanity mutations require fresh approval.
- Start local workers only after confirming their storage target; active queue triggers can consume shared messages.
- Use a repository-owned documented script for repeatable non-trivial work rather than copying an ad hoc command.

## Runbook Index

| Procedure | Owning documentation | Side effects |
| --- | --- | --- |
| Shared command and script discovery | [Cross-repository script catalog](../scripts/README.md) | Follow the individual entry's safety label. |
| Source inspection and snapshot creation | [Azure M2CRM inspection and snapshots](../../../../website-product-enrichment-azure/scripts/m2crm-inspection-and-snapshots.md) | Remote read; snapshots write ignored local artifacts. |
| Local pipeline investigation | [Azure local live E2E](../../../../website-product-enrichment-azure/scripts/local-live-e2e.md) | Remote writes, possible resets, and possible Sanity drafts; fresh approval required. |
| Focused evidence and provider diagnostics | [Azure diagnostics](../../../../website-product-enrichment-azure/scripts/diagnostics.md) | Varies; image requests can be billable remote writes. |
| Campaign summaries | [Azure campaign and reporting](../../../../website-product-enrichment-azure/scripts/campaign-and-reporting.md) | Local-only reporting. |
| Queue clearing and state reset | [Azure reset and clear operations](../../../../website-product-enrichment-azure/scripts/reset-and-clear-operations.md) | Destructive remote write; fresh approval required. |

The full [Azure script and runbook index](../../../../website-product-enrichment-azure/scripts/README.md) remains the canonical operational inventory. Architecture and ownership boundaries are documented in [Architecture](../architecture/README.md).
