# Not every existing "reprocess" endpoint is a recovery checkpoint in disguise

- **ID:** `azure-not-every-existing-reprocess-endpoint-is-a-recovery-checkpoint-in-disguise`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## Not every existing "reprocess" endpoint is a recovery checkpoint in disguise

Migrating `reprocessGroup`/`publishPreflightTrigger` onto the new recovery executor looked like a
uniform refactor at first. `publishPreflightTrigger` maps cleanly onto the `publish` checkpoint
(its legality rule - group composition is `ready` - is exactly what "preflight" should mean).
`reprocessGroup`'s actual job (recompute after a manual PDF attach/detach) is fundamentally
different: it must work on a group that is still assembling variants or already published, but the
recovery model's `compose` checkpoint is only legal once every expected variant classification is
durably complete.

**Fix:** migrated only `publishPreflightTrigger`. Left `reprocessGroup` as its own distinct,
more-permissive capability with a code comment explaining why, rather than forcing it through a
gate that doesn't fit its use case just to have "one recovery model" everywhere.

**Best practice:** before consolidating two endpoints onto one shared mechanism, check whether they
actually have the same legality/readiness semantics, not just a superficially similar action
("re-run this group's pipeline"). A shared code path that silently narrows one endpoint's real
capability is a regression, even if it looks like a cleanup.

