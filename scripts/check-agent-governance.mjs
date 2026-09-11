#!/usr/bin/env node

import { readdir, readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '..')
const managedAgentFiles = [
  'image-v2-prompt-reviewer.agent.md',
  'project-engineer.agent.md',
  'project-implementor.agent.md',
  'project-knowledge.agent.md',
  'project-pipeline-developer.agent.md',
  'project-pipeline-reviewer.agent.md',
  'project-planner.agent.md',
  'project-qa-commit.agent.md',
  'project-sanity-developer.agent.md',
  'project-sanity-reviewer.agent.md'
]
const requiredScenarioIds = [
  'data-first-contract-routing',
  'azure-logging-policy-enforcement',
  'selective-recovery-learning-lookup',
  'script-reuse-and-guarded-creation',
  'readonly-victoria-m2crm-lookup',
  'ui-playwright-discovery',
  'live-e2e-approval-stop',
  'vendor-trade-future-note',
  'knowledge-destination-selection',
  'architecture-change-adr',
  'qa-commit-evidence-docs-semver-no-push',
  'significant-change-plan-escalation',
  'planner-plan-only-stop',
  'planner-architecture-gap-documentation',
  'planner-self-contained-handoff',
  'planner-project-knowledge-doc-handoff',
  'dirty-worktree-qa-recommendation',
  'bounded-low-cost-subagent-use',
  'project-implementor-cost-aware-parallel-review',
  'hard-bug-red-capable-loop',
  'deep-module-within-product-ownership',
  'agent-doc-canonical-pointer-discipline',
  'settled-diff-behavior-preserving-simplification',
  'version-sensitive-api-official-source',
  'quality-floor-cannot-self-weaken',
  'canonical-domain-language-no-parallel-context',
  'image-v2-flux-provenance-review',
  'image-v2-flux-knowledge-retention',
  'image-v2-flux-deterministic-baseline',
  'image-v2-flux-candidate-next',
  'image-v2-flux-trace-disclosure-boundary',
  'image-v2-flux-live-approval-stop',
  'image-v2-prompt-change-orchestrator-gate',
  'sanity-reviewer-readonly-plan-check',
  'sanity-developer-routing-and-approval-boundary',
  'pipeline-reviewer-durability-gate',
  'pipeline-developer-routing-and-safety-boundary'
]
const agentsDirectory = resolve(repositoryRoot, 'workspace-customizations/.github/agents')
const skillsDirectory = resolve(repositoryRoot, 'workspace-customizations/.github/skills')
const coverage = await readFile(resolve(repositoryRoot, 'docs/project/agents/knowledge-coverage.md'), 'utf8')
const scenarios = await readFile(resolve(repositoryRoot, 'docs/project/agents/acceptance-scenarios.md'), 'utf8')
const evaluationFixture = JSON.parse(await readFile(resolve(repositoryRoot, 'docs/project/agents/agent-evaluation-cases.json'), 'utf8'))
const upstreamIntegrations = await readFile(resolve(agentsDirectory, 'UPSTREAM-SKILL-INTEGRATIONS.md'), 'utf8')
const requiredUpstreamRevisions = [
  ['https://github.com/mattpocock/skills', '3cca18b368ae95cdbdebbff572ccafa662551015'],
  ['https://github.com/EveryInc/compound-engineering-plugin', 'caa3b231452a1cd444261d3c4d46bcd72d3246dd'],
  ['https://github.com/DietrichGebert/ponytail', '974d940a1c5344210874150b98ff0d2c861fab6a'],
  ['https://github.com/addyosmani/agent-skills', '48cb1168aeaaa70dfc2bbf709eddfa2a8ed8129a'],
  ['https://github.com/black-forest-labs/skills', '8907d515b0ac270a988ec7a239add81ee13d6cba'],
  ['https://github.com/sanity-io/agent-toolkit', '0b3376799826fc82937770605d671b612bfc2d4f']
]

const agentFiles = (await readdir(agentsDirectory, {withFileTypes: true}))
  .filter((entry) => entry.isFile() && entry.name.endsWith('.agent.md'))
  .map((entry) => entry.name)
  .sort()

if (JSON.stringify(agentFiles) !== JSON.stringify(managedAgentFiles)) {
  throw new Error(`Managed agent source mismatch: expected ${managedAgentFiles.join(', ')}, found ${agentFiles.join(', ')}`)
}

for (const fileName of managedAgentFiles) {
  const name = await frontmatterName(resolve(agentsDirectory, fileName))
  requireText(coverage, `## ${name}`, `coverage record for managed agent ${name}`)
}

const skillDirectories = (await readdir(skillsDirectory, {withFileTypes: true}))
  .filter((entry) => entry.isDirectory())
  .sort((left, right) => left.name.localeCompare(right.name))

if (skillDirectories.length !== 16) {
  throw new Error(`Expected sixteen canonical skills, found ${skillDirectories.length}`)
}

for (const directory of skillDirectories) {
  const name = await frontmatterName(resolve(skillsDirectory, directory.name, 'SKILL.md'))
  requireText(coverage, `## ${titleCase(name)}`, `coverage record for canonical skill ${name}`)
}

for (const scenarioId of requiredScenarioIds) {
  requireText(scenarios, `\`${scenarioId}\``, `acceptance scenario ${scenarioId}`)
}

for (const [repositoryUrl, revision] of requiredUpstreamRevisions) {
  requireText(upstreamIntegrations, repositoryUrl, `upstream repository ${repositoryUrl}`)
  requireText(upstreamIntegrations, revision, `upstream revision for ${repositoryUrl}`)
}

if (!Array.isArray(evaluationFixture.scenarios) || evaluationFixture.scenarios.length !== 22) {
  throw new Error('Agent evaluation fixture must contain twenty-two screening scenarios.')
}

for (const scenario of evaluationFixture.scenarios) {
  if (!managedAgentFiles.some((fileName) => fileName.startsWith(scenario.agent.toLowerCase().replaceAll(' ', '-')))) {
    throw new Error(`Agent evaluation fixture references an unmanaged agent: ${scenario.agent}`)
  }
}

console.info(`Agent governance covers ${managedAgentFiles.length} managed agents, ${skillDirectories.length} canonical skills, ${requiredScenarioIds.length} acceptance scenarios, and ${evaluationFixture.scenarios.length} evaluation cases.`)

async function frontmatterName(path) {
  const content = await readFile(path, 'utf8')
  const name = /^name:\s*["']?(.+?)["']?\s*$/m.exec(content)?.[1]
  if (!name) throw new Error(`Canonical customization has no frontmatter name: ${path}`)
  return name
}

function titleCase(value) {
  return value
    .replace(/(^|[-\s])\w/g, (match) => match.toUpperCase())
    .replace(/-/g, ' ')
    .replace('M2crm', 'M2CRM')
    .replace('E2e', 'E2E')
}

function requireText(content, expected, label) {
  if (!content.includes(expected)) {
    throw new Error(`Missing ${label}: ${expected}`)
  }
}