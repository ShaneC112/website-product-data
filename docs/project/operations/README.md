# Operations

Operational procedures must identify their side effects and approval boundary.

- Read-only M2CRM inspection and local diagnostics can be used when relevant.
- Shared Azure writes, resets, queue actions, deployments, migrations, and Sanity mutations require fresh approval.
- Use repository-owned scripts for repeatable diagnostics and campaigns rather than copying ad hoc commands.

The detailed Azure M2CRM, live E2E, diagnostics, campaign, and reset runbooks will be migrated from the Azure scripts documentation under the migration manifest.
