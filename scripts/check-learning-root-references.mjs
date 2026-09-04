#!/usr/bin/env node

import {readdir, readFile} from 'node:fs/promises'
import {relative, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'

const scriptDirectory = resolve(fileURLToPath(import.meta.url), '..')
const repositoryRoot = resolve(scriptDirectory, '..')
const workspaceRoot = resolve(repositoryRoot, '..')
const repositories = [
  'website-product-data',
  'website-product-enrichment-azure',
  'website-product-enrichment-render',
  'website-product-enrichment-ui',
  'website-product-enrichment-sanity-studio'
]
const rootCatalogs = new Set(repositories.map((name) => resolve(workspaceRoot, name, 'LEARNINGS.md')))
const redirectTargets = new Map([
  ['website-product-data', 'docs/project/learnings/data/README.md'],
  ['website-product-enrichment-azure', '../website-product-data/docs/project/learnings/azure/README.md'],
  ['website-product-enrichment-render', '../website-product-data/docs/project/learnings/render/README.md'],
  ['website-product-enrichment-ui', '../website-product-data/docs/project/learnings/ui/README.md'],
  ['website-product-enrichment-sanity-studio', '../website-product-data/docs/project/learnings/studio/README.md']
])
const allowedRootLearningReaders = new Set([
  resolve(scriptDirectory, 'project-documentation-inventory.mjs')
])
const textExtensions = new Set(['.md', '.ts', '.tsx', '.js', '.mjs', '.vue'])
const excludedDirectories = new Set(['.git', 'node_modules', 'dist', '.output', 'playwright-report', 'test-results'])
const violations = []

for (const repositoryName of repositories) {
  const directory = resolve(workspaceRoot, repositoryName)
  const rootCatalogPath = resolve(directory, 'LEARNINGS.md')
  const rootCatalog = await readFile(rootCatalogPath, 'utf8')
  const redirectTarget = redirectTargets.get(repositoryName)
  if (!rootCatalog.includes(`](${redirectTarget})`) || !rootCatalog.includes('Root `LEARNINGS.md` is a redirect only.')) {
    throw new Error(`Root learning file is not a canonical redirect stub: ${relative(workspaceRoot, rootCatalogPath)}`)
  }
  for (const path of await listTextFiles(directory)) {
    const workspacePath = relative(workspaceRoot, path)
    if (isExcluded(path, workspacePath)) continue
    const content = await readFile(path, 'utf8')
    if (!/LEARNINGS\.md/.test(content)) continue
    violations.push(workspacePath)
  }
}

if (violations.length > 0) {
  throw new Error(`Unallowlisted active root LEARNINGS.md references:\n${violations.map((path) => `- ${path}`).join('\n')}`)
}

console.info('No active root-learning references found.')

async function listTextFiles(directory) {
  const entries = await readdir(directory, {withFileTypes: true})
  const files = await Promise.all(entries.map(async (entry) => {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) return excludedDirectories.has(entry.name) ? [] : listTextFiles(path)
    return entry.isFile() && textExtensions.has(extension(entry.name)) ? [path] : []
  }))
  return files.flat()
}

function isExcluded(path, workspacePath) {
  return rootCatalogs.has(path)
    || allowedRootLearningReaders.has(path)
    || path === fileURLToPath(import.meta.url)
    || workspacePath.includes('/plan/')
    || workspacePath.endsWith('/CHANGELOG.md')
    || isCanonicalLearningIndex(workspacePath)
}

function isCanonicalLearningIndex(workspacePath) {
  return workspacePath.startsWith('website-product-data/docs/project/learnings/')
    && workspacePath.endsWith('/README.md')
}

function extension(name) {
  return name.slice(name.lastIndexOf('.'))
}