# `brandNameHint` is authoritative, unlike `pileWeightHint`/`packInfoHint` - do not assume every m2crm hint field follows the same trust tier

- **ID:** `azure-brandnamehint-is-authoritative-unlike-pileweighthint-packinfohint-do-not-assume-every-m2crm-hint-field-follows-the-same-trust-tier`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## `brandNameHint` is authoritative, unlike `pileWeightHint`/`packInfoHint` - do not assume every m2crm hint field follows the same trust tier

`brandNameHint` was first added following the established "bias hint, not
authoritative" pattern used by `pileWeightHint`/`packInfoHint` (AI must confirm it
against page evidence and may override or omit it). That framing turned out to be
wrong for this field: m2crm's vendor name is trusted as the source of truth for
`brandName`, so the prompt now says "Use it as brandName; it is the authoritative
source value for this product", and `finalizeTradeDetail` force-overwrites (or adds)
the `brandName` field from `page.brandNameHint` with `confidence: 1` whenever the
hint is present, regardless of what the AI itself extracted from the page.

**Best practice:** do not assume a new m2crm-sourced hint field should copy an
existing hint field's trust framing just because the plumbing (queue message,
table schema, system prompt) is identical - trust tier is a per-field business
decision, confirm it explicitly rather than pattern-matching. When it changes,
update every layer that asserted the old framing: the prompt wording in
`field-registry.ts` (repeated per trade), `applyBrandNameHint`'s prompt sentence,
the finalize-time merge behavior, and any LEARNINGS/README prose describing it.

**Best practice:** re-use an established hint pattern's exact trust framing
(bias vs. authoritative) when adding a new m2crm-sourced hint field, rather than
inventing new prompt wording per field - and remember, per the earlier
`manualCrawlEnqueue.ts` lesson, that a new hint field needs updating in the queue
schema, the HTTP-facing `manualCrawlEnqueueSchema`, and the handler's hand-built
queue message object - all three, checked here and confirmed present.

