# V2 submissions must reread authoritative intent and reproject durable results

- **ID:** `azure-v2-submissions-must-reread-authoritative-intent-and-reproject-durable-results`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

The v2 external queue carries only an immutable submission reference. Azure must reread the
referenced Sanity request or guarded-control intent, validate its current pending state and
identity, and durably claim the stable submission ID before mutating state or releasing internal
lifecycle work. Queue payloads are not an authoritative request snapshot.

Commit the bounded result to the submission claim before projecting it to Sanity. A duplicate
delivery of a completed claim then reprojects the durable acknowledgement without repeating
dispatch or the guarded command.

Every v2 queue envelope and durable row must enter through the versioning/read boundary. Missing
or unsupported schema versions, and malformed supported-version rows, are quarantined rather than
being guessed into a worker path. The current version-one upcasters establish that behavior for
the implemented row types; bounded version/upcast/quarantine coverage for every durable row type
remains an open Phase 18 requirement.