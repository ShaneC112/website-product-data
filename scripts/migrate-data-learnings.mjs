#!/usr/bin/env node

import {mkdir, readdir, readFile, writeFile} from 'node:fs/promises'
import {dirname, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '..')
const [repositoryName = 'data', mode = '--check'] = process.argv.slice(2)
const repositories = {
  data: {
    appliesTo: 'website-product-data',
    outputDirectory: resolve(repositoryRoot, 'docs/project/learnings/data')
  },
  render: {
    appliesTo: 'website-product-enrichment-render',
    outputDirectory: resolve(repositoryRoot, 'docs/project/learnings/render')
  },
  azure: {
    appliesTo: 'website-product-enrichment-azure',
    outputDirectory: resolve(repositoryRoot, 'docs/project/learnings/azure')
  },
  ui: {
    appliesTo: 'website-product-enrichment-ui',
    outputDirectory: resolve(repositoryRoot, 'docs/project/learnings/ui')
  },
  studio: {
    appliesTo: 'website-product-enrichment-sanity-studio',
    outputDirectory: resolve(repositoryRoot, 'docs/project/learnings/studio')
  }
}
const repository = repositories[repositoryName]

if (!repository || !['--check', '--write'].includes(mode)) {
  throw new Error('Usage: node scripts/migrate-data-learnings.mjs [data|render|azure|ui|studio] [--check|--write]')
}

const entries = await readCanonicalEntries(repository)
const indexPath = resolve(repository.outputDirectory, 'README.md')

if (mode === '--write') {
  await mkdir(repository.outputDirectory, {recursive: true})
  await Promise.all(entries.map((entry) => writeFile(entry.path, renderDetail(entry, repository))))
  await writeFile(indexPath, renderIndex(entries, repository))
  console.info(`Normalized ${entries.length} canonical ${repositoryName} learning details and their index.`)
} else {
  assertDetailIntegrity(entries, repository)
  await assertIndexIntegrity(indexPath, entries, repository)
  console.info(`${repositoryName} canonical learning catalog is valid: ${entries.length} details and index membership verified.`)
}

async function readCanonicalEntries(repository) {
  const names = (await readdir(repository.outputDirectory))
    .filter((name) => name.endsWith('.md') && name !== 'README.md')
    .sort()
  if (names.length === 0) throw new Error(`No canonical learning details found for ${repositoryName}.`)

  return Promise.all(names.map(async (name) => {
    const path = resolve(repository.outputDirectory, name)
    const content = await readFile(path, 'utf8')
    const title = /^# (.+)$/m.exec(content)?.[1]
    const sourceEntry = /^## (?:Migrated Source Entry|Learning)$/m.exec(content)
    if (!title || !sourceEntry) {
      throw new Error(`Canonical detail is missing a title or preserved learning body: ${relativeToRoot(path)}`)
    }
    const source = content.slice(sourceEntry.index + sourceEntry[0].length).replace(/^\n+/, '')
    if (source.trim().length === 0) {
      throw new Error(`Canonical detail has an empty preserved learning body: ${relativeToRoot(path)}`)
    }
    return {
      content,
      id: name.slice(0, -3),
      path,
      title,
      source
    }
  }))
}

function assertDetailIntegrity(entries, repository) {
  for (const entry of entries) {
    if (!entry.content.includes(`- **ID:** \`${entry.id}\``)) {
      throw new Error(`Canonical detail has an invalid stable ID: ${relativeToRoot(entry.path)}`)
    }
    if (!entry.content.includes(`- **Applies to:** \`${repository.appliesTo}\``)) {
      throw new Error(`Canonical detail has an invalid applies-to value: ${relativeToRoot(entry.path)}`)
    }
    if (!entry.content.includes('- **Status:** Canonical learning detail.')) {
      throw new Error(`Canonical detail is missing its status metadata: ${relativeToRoot(entry.path)}`)
    }
  }
}

async function assertIndexIntegrity(indexPath, entries, repository) {
  const index = await readFile(indexPath, 'utf8')
  const expectedIntro = 'Canonical detail pages are authoritative learning records.'
  if (!index.includes(expectedIntro)) {
    throw new Error(`Learning index is missing its canonical-authority statement: ${relativeToRoot(indexPath)}`)
  }

  const expectedIds = new Set(entries.map((entry) => entry.id))
  const indexedIds = [...index.matchAll(/^\| `([^`]+)` \|/gm)]
  if (indexedIds.length !== expectedIds.size) {
    throw new Error(`Learning index has duplicate or missing membership rows: ${relativeToRoot(indexPath)}`)
  }

  for (const [, id] of indexedIds) {
    if (!expectedIds.has(id)) {
      throw new Error(`Learning index has an invalid detail membership row: ${relativeToRoot(indexPath)} -> ${id}.md`)
    }
  }

  for (const entry of entries) {
    const membership = `| \`${entry.id}\` | [${escapeTableCell(entry.title)}](${entry.id}.md) | ${repository.appliesTo} |`
    if (!index.includes(membership)) {
      throw new Error(`Learning index is missing detail membership: ${relativeToRoot(indexPath)} -> ${entry.id}.md`)
    }
  }
}

function renderDetail(entry, repository) {
  return `# ${entry.title}\n\n- **ID:** \`${entry.id}\`\n- **Applies to:** \`${repository.appliesTo}\`\n- **Status:** Canonical learning detail.\n\n## Learning\n\n${entry.source}`
}

function renderIndex(entries, repository) {
  const rows = entries.map((entry) =>
    `| \`${entry.id}\` | [${escapeTableCell(entry.title)}](${entry.id}.md) | ${repository.appliesTo} |`
  )
  return `# ${capitalize(repositoryName)} Learnings\n\nCanonical detail pages are authoritative learning records. Scan by stable ID and title, then open the matching detail for its evidence and prevention guidance.\n\n| ID | Learning | Applies to |\n| --- | --- | --- |\n${rows.join('\n')}\n`
}

function escapeTableCell(value) {
  return value.replaceAll('|', '\\|')
}

function capitalize(value) {
  return `${value[0].toUpperCase()}${value.slice(1)}`
}

function relativeToRoot(path) {
  return path.slice(repositoryRoot.length + 1)
}