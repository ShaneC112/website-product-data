#!/usr/bin/env node

import { readdir, readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '..')
const managedAgentFiles = [
  'project-engineer.agent.md',
  'project-knowledge.agent.md',
  'project-planner.agent.md',
  'project-qa-commit.agent.md'
]
const requiredScenarioIds = [
  'data-first-contract-routing',
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
  'bounded-low-cost-subagent-use'
]
const agentsDirectory = resolve(repositoryRoot, 'workspace-customizations/.github/agents')
const skillsDirectory = resolve(repositoryRoot, 'workspace-customizations/.github/skills')
const coverage = await readFile(resolve(repositoryRoot, 'docs/project/agents/knowledge-coverage.md'), 'utf8')
const scenarios = await readFile(resolve(repositoryRoot, 'docs/project/agents/acceptance-scenarios.md'), 'utf8')
const evaluationFixture = JSON.parse(await readFile(resolve(repositoryRoot, 'docs/project/agents/agent-evaluation-cases.json'), 'utf8'))

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

if (skillDirectories.length !== 6) {
  throw new Error(`Expected six canonical skills, found ${skillDirectories.length}`)
}

for (const directory of skillDirectories) {
  const name = await frontmatterName(resolve(skillsDirectory, directory.name, 'SKILL.md'))
  requireText(coverage, `## ${titleCase(name)}`, `coverage record for canonical skill ${name}`)
}

for (const scenarioId of requiredScenarioIds) {
  requireText(scenarios, `\`${scenarioId}\``, `acceptance scenario ${scenarioId}`)
}

if (!Array.isArray(evaluationFixture.scenarios) || evaluationFixture.scenarios.length !== 13) {
  throw new Error('Agent evaluation fixture must contain thirteen screening scenarios.')
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