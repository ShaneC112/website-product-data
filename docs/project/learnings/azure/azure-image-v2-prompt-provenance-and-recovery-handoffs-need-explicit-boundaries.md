# Image-generation V2 prompts and recovery handoffs need explicit boundaries

- **ID:** `azure-image-v2-prompt-provenance-and-recovery-handoffs-need-explicit-boundaries`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

A multi-room image run exposed several failures that initially looked like prompt or room-cache contamination:

- bedroom and sitting-room images could be visually empty even though the final prompt contained the required furniture;
- assembly could start without a usable scene dependency manifest;
- a completed render could exist without a `persist.media` orchestration row;
- a short Vision-generated directive could fail strict scene normalization;
- uncaught worker failures appeared in Azure host output but not in the application Pino trace;
- a stale persist message for a deleted product resurfaced after a state clear.

The evidence showed these were different boundaries and must not be diagnosed as one cache bug.

## Durable findings

### Prompt provenance must be traceable without ordinary-log prompt disclosure

The FLUX prompt is assembled in `03-assemble/direct/handler.ts` from product, colour, texture, pattern, scene, camera, brand, and flooring constraints. The scene text is rendered by `prompt-features/scene/render.ts`; the camera policy is added separately by `prompt-features/camera/render.ts`; `04-render/registry.ts` rehydrates the assembled prompt from the render row's `inputReference`.

The useful diagnostic identity is a shared SHA-256 prompt hash plus bounded metadata:

- request ID and run ID;
- room;
- prompt length and hash;
- required furniture-signal booleans;
- provider reuse versus new provider call;
- provider operation ID.

Ordinary lifecycle and diagnostic logs must not contain full prompts, image bytes, provider payloads, or credentials. The canonical Azure logging policy permits a narrower typed exception for validated `trace` records whose module matches `flux:*`; that exception does not relax redaction or permit signed URLs, raw headers, binary payloads, or credentials.

### Structured scene content can be present while provider output still fails visually

The Vision response and assembled prompt may contain bed, bedside furniture, storage, artwork, or seating while FLUX still produces an empty or under-furnished room. Prompt presence is therefore not proof of visual adherence.

Room-specific guidance belongs in both places:

- `sceneAnalysis.ts` controls the structured design brief and prioritized sections;
- `scene/render.ts` controls the direct FLUX wording and instruction order.

High-priority furnishing instructions should precede architecture and lower-priority metadata. Room-specific requirements should be explicit: bedroom bed/headboard/window relationship, living-room seating, dining table/chairs, and floor-covering rules. Hallway, landing, and stairs retain their explicit runner/stair-treatment exception.

### Strict provider output needs a sanitization seam

Structured provider output can contain short or otherwise unusable directive strings even when the overall response parses. `normalizeScene()` must sanitize provider directives before applying the strict normalized-scene schema. Short directives are discarded with a bounded Pino warning (`scene-directives-sanitized`), while mandatory room directives remain in place.

### Recovery must reconstruct missing downstream rows

A durable outbox can repair a missing queue dispatch only when the downstream orchestration row exists. A process interruption between these operations leaves a completed upstream row but no downstream row, so a recovery worker that scans only queued, failed, or expired rows cannot recover it.

The image V2 recovery worker now reconciles completed render rows with materialized output and recreates a missing `persist.media` row idempotently. The same completion-to-handoff risk applies to:

- `generate.* -> assemble.direct`;
- `assemble.direct -> render.direct`;
- `render.direct -> persist.media`.

Each transition needs either an atomic durable handoff or a recovery reconciliation that logs why a candidate was accepted, skipped, or already present.

### Terminal state must reflect failure class

A provider HTTP rejection with no accepted operation identity is different from an unknown side-effect outcome:

- RAI policy responses are deterministic content rejections and should be terminal immediately; retrying the identical prompt has no value.
- Other bounded HTTP failures, including transient 400/408/409/429/5xx responses, may be retried up to the configured attempt limit.
- Unknown provider acceptance remains terminal (`provider-outcome-unknown`) because repeating the side effect could duplicate an uncertain provider operation.

Recovery must inspect `state` and `recoveryDisposition`; a `blocked/terminal` row is intentionally excluded from automatic retry.

### Clearing Azure state is not a quiescent reset

`npm run clear:sanity-image-v2-state` clears the two V2 Azure Tables, the six V2 queues, and their poison queues. It does not stop workers, delete Sanity documents, or cancel already-claimed work. A worker or recovery process that was already active can recreate downstream rows after the clear and surface stale product errors later.

For a clean local run, stop Azure first, clear the state, then start Azure. Confirm the clear command and Function host use the same storage account.

### Pino must cover host-level failure boundaries

Azure Functions `context.error()` output does not automatically enter the application Pino file. Shared queue and HTTP wrappers, startup provisioning, and diagnostic trace writers must emit through Pino before preserving Azure's host behavior.

The queue wrapper must log structured request/run/work identity and then rethrow so Azure retry and poison-queue semantics remain intact.

## Verification pattern

For a multi-room run, review the rolling `.tracing/azure.*.log` records in this order:

1. room and scene branch selection;
2. `assembled-prompt-ready` furniture signals and prompt hash;
3. `render-input-rehydrated` hash and signals;
4. FLUX provider response/staging;
5. render completion;
6. persist completion or recovery reconciliation;
7. `queue-worker-unhandled-error`, RAI terminalization, or provider retry events.

A matching assembly/render hash proves prompt rehydration fidelity, not visual adherence. Image inspection remains necessary for whether FLUX actually furnished and styled the room.
