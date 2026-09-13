# V3 Guarded-Control Schemas

This folder holds the recovery-control operation schema and any other V3-specific guarded operations that cross the Studio ⟷ Azure boundary.

**Recovery control** (`recovery.schema.ts`, defined in Phase 2a): the only new V3 guarded operation, allowing operators to safely retry/reconcile terminal image runs from the Sanity UI. Studio persists this in the existing `aiImageGenerationControlIntent` document; Azure reads and executes it through the retained external submission queue.

No other cross-boundary control operations are planned in the first V3 slice.
