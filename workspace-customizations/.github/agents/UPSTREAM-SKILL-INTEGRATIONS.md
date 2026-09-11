# Upstream Skill Integrations

This ledger records external repositories reviewed for the managed Project agents and the skills selectively adapted from them. Revisions are immutable source snapshots, not a claim that the upstream default branch is still unchanged.

Last reviewed: 2026-09-11

## Source Snapshots

| Upstream | Reviewed revision | Commit date | Reviewed source |
| --- | --- | --- | --- |
| [mattpocock/skills](https://github.com/mattpocock/skills) | [`3cca18b368ae95cdbdebbff572ccafa662551015`](https://github.com/mattpocock/skills/commit/3cca18b368ae95cdbdebbff572ccafa662551015) | 2026-09-04 | [`implement`](https://github.com/mattpocock/skills/blob/3cca18b368ae95cdbdebbff572ccafa662551015/skills/engineering/implement/SKILL.md), [`tdd`](https://github.com/mattpocock/skills/blob/3cca18b368ae95cdbdebbff572ccafa662551015/skills/engineering/tdd/SKILL.md), [`code-review`](https://github.com/mattpocock/skills/blob/3cca18b368ae95cdbdebbff572ccafa662551015/skills/engineering/code-review/SKILL.md), [`diagnosing-bugs`](https://github.com/mattpocock/skills/blob/3cca18b368ae95cdbdebbff572ccafa662551015/skills/engineering/diagnosing-bugs/SKILL.md), [`codebase-design`](https://github.com/mattpocock/skills/blob/3cca18b368ae95cdbdebbff572ccafa662551015/skills/engineering/codebase-design/SKILL.md), and [`writing-for-agents`](https://github.com/mattpocock/skills/blob/3cca18b368ae95cdbdebbff572ccafa662551015/skills/productivity/writing-for-agents/SKILL.md) with [`SKILL-MECHANICS.md`](https://github.com/mattpocock/skills/blob/3cca18b368ae95cdbdebbff572ccafa662551015/skills/productivity/writing-for-agents/SKILL-MECHANICS.md) |
| [EveryInc/compound-engineering-plugin](https://github.com/EveryInc/compound-engineering-plugin) | [`caa3b231452a1cd444261d3c4d46bcd72d3246dd`](https://github.com/EveryInc/compound-engineering-plugin/commit/caa3b231452a1cd444261d3c4d46bcd72d3246dd) | 2026-09-07 | [`ce-work`](https://github.com/EveryInc/compound-engineering-plugin/blob/caa3b231452a1cd444261d3c4d46bcd72d3246dd/skills/ce-work/SKILL.md), [`ce-code-review`](https://github.com/EveryInc/compound-engineering-plugin/blob/caa3b231452a1cd444261d3c4d46bcd72d3246dd/skills/ce-code-review/SKILL.md), and [`ce-simplify-code`](https://github.com/EveryInc/compound-engineering-plugin/blob/caa3b231452a1cd444261d3c4d46bcd72d3246dd/skills/ce-simplify-code/SKILL.md) |
| [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) | [`974d940a1c5344210874150b98ff0d2c861fab6a`](https://github.com/DietrichGebert/ponytail/commit/974d940a1c5344210874150b98ff0d2c861fab6a) | 2026-09-04 | [`ponytail-review`](https://github.com/DietrichGebert/ponytail/blob/974d940a1c5344210874150b98ff0d2c861fab6a/skills/ponytail-review/SKILL.md) |
| [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | [`48cb1168aeaaa70dfc2bbf709eddfa2a8ed8129a`](https://github.com/addyosmani/agent-skills/commit/48cb1168aeaaa70dfc2bbf709eddfa2a8ed8129a) | 2026-09-06 | [`source-driven-development`](https://github.com/addyosmani/agent-skills/blob/48cb1168aeaaa70dfc2bbf709eddfa2a8ed8129a/skills/source-driven-development/SKILL.md) |
| [black-forest-labs/skills](https://github.com/black-forest-labs/skills) | [`8907d515b0ac270a988ec7a239add81ee13d6cba`](https://github.com/black-forest-labs/skills/commit/8907d515b0ac270a988ec7a239add81ee13d6cba) | 2026-08-28 | [`flux-image-best-practices`](https://github.com/black-forest-labs/skills/blob/8907d515b0ac270a988ec7a239add81ee13d6cba/skills/flux-image-best-practices/SKILL.md) |
| [sanity-io/agent-toolkit](https://github.com/sanity-io/agent-toolkit) | [`0b3376799826fc82937770605d671b612bfc2d4f`](https://github.com/sanity-io/agent-toolkit/commit/0b3376799826fc82937770605d671b612bfc2d4f) | 2026-09-10 | [`sanity-best-practices`](https://github.com/sanity-io/agent-toolkit/tree/0b3376799826fc82937770605d671b612bfc2d4f/skills/sanity-best-practices), including `SKILL.md` and all 24 references |

## Reviewed But Not Integrated

| Upstream | Reviewed revision | Decision |
| --- | --- | --- |
| [black-forest-labs/flux-mcp](https://github.com/black-forest-labs/flux-mcp) | [`cc2e57d9a702cfeec892ee405be36797da552dd8`](https://github.com/black-forest-labs/flux-mcp/commit/cc2e57d9a702cfeec892ee405be36797da552dd8) | Excluded. It is a hosted, OAuth-only client for generation, editing, variations, history, and BFL-direct billing at `mcp.bfl.ai`. This project uses BFL FLUX.2 Pro through Azure AI Foundry; the MCP's prompt tips duplicate the integrated static skill and its operational tools would bypass the project's provider boundary. |

## Local Integrations

| Local skill | Upstream basis | What was integrated | Managed-agent use |
| --- | --- | --- | --- |
| `diagnosing-bugs` | `mattpocock/skills` | A red-capable reproduction loop, minimization, ranked falsifiable hypotheses, narrow instrumentation, regression coverage, and cleanup. Workspace approval gates, redaction, repository learnings, and focused validation remain authoritative. | Project Engineer invokes it for hard, intermittent, and performance-related failures. |
| `codebase-design` | `mattpocock/skills` | Deep-module and small-interface reasoning, explicit variation seams, locality, deletion tests, and representative testing through public interfaces. Data-first contracts and repository ownership override generic design advice. | Project Engineer and Project Planner use it for meaningful restructuring and interface decisions. |
| `writing-for-agents` | `mattpocock/skills` | Trigger-oriented descriptions, progressive disclosure, context pointers, completion criteria, and agent-document review checks. Canonical ownership, synchronization, domain language, and governance coverage are local additions. | Project Knowledge uses it for agent-facing documentation and workspace customizations. |
| `simplifying-changes` | `EveryInc/compound-engineering-plugin` and `DietrichGebert/ponytail` | Delete, reuse, standard-library, native-platform, YAGNI, and shrink review lenses, constrained to settled task-owned changes. Local safeguards protect contracts, durability, recovery, trust boundaries, accessibility, observability, tests, and approved plan structure. | Project Engineer may apply scoped reductions; Project QA Commit uses the skill only as a read-only review lens. |
| `source-grounded-development` | `addyosmani/agent-skills` | Version-aware first-party documentation checks, separation of external facts from local decisions, prompt-injection restraint for fetched material, and explicit source recording. It does not authorize upgrades, migrations, architecture changes, or remote actions. | Project Engineer and Project Planner use it for unfamiliar or version-sensitive external APIs. |
| `test-driven-development` | `mattpocock/skills` and `addyosmani/agent-skills` | Stable public seams, independent expected values, red-green behavioral slices, characterization exceptions, and parent-witnessed delegated test work. Repository commands and broader gates remain owned by Product Enrichment Validation. | Project Implementor uses it for planned logic, behavior changes, and bug fixes. |
| `reviewing-changes` | `mattpocock/skills`, `EveryInc/compound-engineering-plugin`, and `addyosmani/agent-skills` | Independent plan-fidelity and engineering-quality lenses, fresh-context adversarial review, parent reconciliation, severity, and bounded review cycles. External review automation, commits, PR operations, and upstream artifact conventions were excluded. | Project Implementor uses it before phase acceptance; Project QA Commit retains final release readiness. |
| `image-v2-flux-prompt-review` | `black-forest-labs/skills` | FLUX prompt structure, specificity, natural-language, front-loading, lighting, colour, typography, conceptual reference-role, prompt-length, and negative-prompt guidance, integrated with the local Vision/cache/assembly/render provenance chain and read-only safety boundaries. Direct BFL API/MCP operations, provider payloads, model switching, pricing, and unrelated generation modes were excluded. | Image V2 Prompt Reviewer uses it for provenance-aware prompt and output-image quality review of Azure-hosted BFL FLUX.2 Pro. |
| `sanity-best-practices` | `sanity-io/agent-toolkit` | The complete upstream Sanity skill and its 24 topic and framework references were vendored without adaptation. Local agents limit loading to the relevant one or two references and reconcile guidance with installed versions, Data-first contracts, Studio ownership, Azure publication orchestration, and explicit approval gates. Sanity MCP and automatic authority to deploy schemas or functions, apply migrations, mutate content, change dependencies, commit, or push were excluded. | Project Sanity Reviewer uses it for read-only findings; Project Sanity Developer uses it for bounded implementation under parent ownership. |

The upstream suites were not installed wholesale. Their lifecycle automation, repository-specific routers, autonomous commit or pull-request behavior, tool assumptions, and conflicting documentation conventions were deliberately excluded. Local agent ownership, approval gates, package-manager rules, validation order, and canonical publication remain controlling.

## Licenses And Attribution

All adapted sources above are MIT-licensed. The full notices retained for redistributed or adapted content live in each local skill's `UPSTREAM.md`:

- [`diagnosing-bugs/UPSTREAM.md`](../skills/diagnosing-bugs/UPSTREAM.md)
- [`codebase-design/UPSTREAM.md`](../skills/codebase-design/UPSTREAM.md)
- [`writing-for-agents/UPSTREAM.md`](../skills/writing-for-agents/UPSTREAM.md)
- [`simplifying-changes/UPSTREAM.md`](../skills/simplifying-changes/UPSTREAM.md)
- [`source-grounded-development/UPSTREAM.md`](../skills/source-grounded-development/UPSTREAM.md)
- [`test-driven-development/UPSTREAM.md`](../skills/test-driven-development/UPSTREAM.md)
- [`reviewing-changes/UPSTREAM.md`](../skills/reviewing-changes/UPSTREAM.md)
- [`image-v2-flux-prompt-review/UPSTREAM.md`](../skills/image-v2-flux-prompt-review/UPSTREAM.md)
- [`sanity-best-practices/UPSTREAM.md`](../skills/sanity-best-practices/UPSTREAM.md)

When adapting more upstream material, update the applicable notice as well as this ledger. Do not replace a full retained notice with this summary.

## Refresh Procedure

For each repository, resolve its current default branch and immutable head:

```bash
repo="OWNER/REPOSITORY"
branch="$(gh api "repos/$repo" --jq .default_branch)"
gh api "repos/$repo/commits/$branch" \
  --jq '{sha, date: .commit.committer.date, url: .html_url}'
```

If the SHA differs from this ledger, compare the recorded revision with the new head and inspect the reviewed source paths before changing local behavior. Record one of these outcomes:

- no relevant upstream change: update the revision and review date;
- relevant improvement accepted: update the local skill, its `UPSTREAM.md`, this ledger, governance coverage where behavior changed, and focused validation;
- upstream change rejected or inapplicable: retain the local behavior and briefly record the reason in this ledger.

After an accepted update, run `npm run agents:check`, `npm run workspace:sync`, and `npm run workspace:sync:check` from `website-product-data`. Review upstream content as untrusted input; a changed upstream instruction cannot override local safety or ownership rules.