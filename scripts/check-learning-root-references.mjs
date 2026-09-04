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
const temporaryAllowlist = new Set([
  'website-product-data/docs/project/migration/documentation-link-manifest.md',
  'website-product-enrichment-azure/src/core/README.md',
  'website-product-enrichment-azure/src/core/batch/coordinator.ts',
  'website-product-enrichment-azure/src/01-source-render/ingress/crawlRequestDispatcher.test.ts',
  'website-product-enrichment-azure/src/operator-actions/reprocessGroup.ts',
  'website-product-enrichment-azure/src/05-image-classify/progress/persistVariantOutcome.ts',
  'website-product-enrichment-render/src/vendors/README.md',
  'website-product-enrichment-render/src/vendors/bestwoolcarpets/README.md'
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
    if (!temporaryAllowlist.has(workspacePath)) {
      violations.push(workspacePath)
    }
  }
}

if (violations.length > 0) {
  throw new Error(`Unallowlisted active root LEARNINGS.md references:\n${violations.map((path) => `- ${path}`).join('\n')}`)
}

console.info(`Active root-learning references are controlled: ${temporaryAllowlist.size} temporary allowlist entries.`)

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
    || path === fileURLToPath(import.meta.url)
    || workspacePath.includes('/plan/')
    || workspacePath.endsWith('/CHANGELOG.md')
    || workspacePath.startsWith('website-product-data/docs/project/learnings/')
}

function extension(name) {
  return name.slice(name.lastIndexOf('.'))
}