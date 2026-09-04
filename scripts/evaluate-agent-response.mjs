#!/usr/bin/env node

import {readFile} from 'node:fs/promises'
import {dirname, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '..')
const fixturePath = resolve(repositoryRoot, 'docs/project/agents/agent-evaluation-cases.json')
const fixture = JSON.parse(await readFile(fixturePath, 'utf8'))
const options = parseOptions(process.argv.slice(2))
validateFixture(fixture)

if (options.check) {
  console.info(`Agent evaluation fixture is valid with ${fixture.scenarios.length} cases.`)
  process.exit(0)
}

if (!options.caseId || !options.responsePath) {
  throw new Error('Usage: npm run agents:evaluate -- --case <id> --response <json-file>')
}

const scenario = fixture.scenarios.find((candidate) => candidate.id === options.caseId)
if (!scenario) throw new Error(`Unknown evaluation case: ${options.caseId}`)

const response = JSON.parse(await readFile(resolve(process.cwd(), options.responsePath), 'utf8'))
for (const field of fixture.responseFormat.requiredFields) {
  if (typeof response[field] !== 'string' || response[field].trim() === '') {
    throw new Error(`Response is missing required non-empty string field: ${field}`)
  }
}
if (!Array.isArray(response.evidence) || response.evidence.some((item) => typeof item !== 'string')) {
  throw new Error('Response evidence must be an array of strings.')
}
if (response.scenarioId !== scenario.id) {
  throw new Error('Response scenarioId must match the selected evaluation case.')
}

const responseText = [...fixture.responseFormat.requiredFields.map((field) => response[field]), ...response.evidence].join('\n')
const results = scenario.criteria.map((criterion) => {
  const fields = criterion.fields ?? [...fixture.responseFormat.requiredFields, 'evidence']
  const criterionText = fields.flatMap((field) => Array.isArray(response[field]) ? response[field] : [response[field]]).join('\n')
  const passed = criterion.patterns.every((pattern) => new RegExp(pattern, 'i').test(criterionText)) &&
    (criterion.forbiddenPatterns ?? []).every((pattern) => !new RegExp(pattern, 'i').test(criterionText))
  return {id: criterion.id, required: criterion.required, passed, description: criterion.description}
})
const requiredFailure = results.some((result) => result.required && !result.passed)
const passedWeight = results.filter((result) => result.passed).reduce((total, result) => total + scenario.criteria.find((criterion) => criterion.id === result.id).weight, 0)
const possibleWeight = scenario.criteria.reduce((total, criterion) => total + criterion.weight, 0)
const rawScore = Math.round((passedWeight / possibleWeight) * 100)
const score = requiredFailure ? 0 : rawScore

console.info(JSON.stringify({
  scenarioId: scenario.id,
  agent: scenario.agent,
  score,
  rawScore,
  screeningOnly: true,
  requiredFailure,
  results,
  followUp: requiredFailure ? 'Review the missed required criterion and its source instruction before changing the agent.' : 'Review any failed optional criterion before declaring the scenario passed.'
}, null, 2))

function parseOptions(argumentsList) {
  const options = {check: false, caseId: null, responsePath: null}
  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index]
    if (argument === '--check') options.check = true
    else if (argument === '--case') options.caseId = argumentsList[++index]
    else if (argument === '--response') options.responsePath = argumentsList[++index]
    else throw new Error(`Unknown argument: ${argument}`)
  }
  return options
}

function validateFixture(candidate) {
  if (candidate.version !== 1 || !Array.isArray(candidate.scenarios) || candidate.scenarios.length === 0) {
    throw new Error('Agent evaluation fixture must be version 1 with at least one scenario.')
  }
  if (!Array.isArray(candidate.responseFormat?.requiredFields) || !candidate.responseFormat.requiredFields.includes('agent')) {
    throw new Error('Agent evaluation fixture must define the structured response fields.')
  }
  for (const scenario of candidate.scenarios) {
    if (!scenario.id || !scenario.agent || !scenario.prompt || !Array.isArray(scenario.criteria) || scenario.criteria.length === 0) {
      throw new Error('Every evaluation scenario requires an id, agent, prompt, and criteria.')
    }
    for (const criterion of scenario.criteria) {
      if (!criterion.id || !criterion.description || !Number.isFinite(criterion.weight) || criterion.weight <= 0 || !Array.isArray(criterion.patterns) || criterion.patterns.length === 0 || (criterion.fields && !criterion.fields.every((field) => candidate.responseFormat.requiredFields.includes(field) || field === 'evidence')) || (criterion.forbiddenPatterns && !Array.isArray(criterion.forbiddenPatterns))) {
        throw new Error(`Evaluation criterion is incomplete in scenario ${scenario.id}.`)
      }
    }
  }
}