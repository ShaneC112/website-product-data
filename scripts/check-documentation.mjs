#!/usr/bin/env node

import { access, readdir, readFile, stat } from 'node:fs/promises'
import {execFile} from 'node:child_process'
import {promisify} from 'node:util'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const execFileAsync = promisify(execFile)
const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '..')
const requiredFiles = [
  'docs/README.md',
  'docs/contracts/README.md',
  'docs/storage/README.md',
  'docs/registry/README.md',
  'docs/sanity/README.md',
  'docs/project/README.md',
  'docs/project/architecture/README.md',
  'docs/project/agents/knowledge-coverage.md',
  'docs/project/agents/acceptance-scenarios.md',
  'docs/project/operations/README.md',
  'docs/project/decisions/README.md',
  'docs/project/scripts/README.md',
  'docs/project/learnings/README.md',
  'docs/project/future/README.md',
  'docs/project/future/vendor-trade-stage-flows.md',
  'docs/project/migration/documentation-link-manifest.md',
  'docs/project/migration/project-documentation-inventory.json',
  'docs/project/project-map.json',
  'docs/project/project-metadata.json',
  'docs/project/CHANGELOG.md'
]
const navigationFiles = [
  'README.md',
  'scripts/README.md',
  '../website-product-enrichment-azure/scripts/README.md',
  '../website-product-enrichment-azure/scripts/m2crm-inspection-and-snapshots.md',
  '../website-product-enrichment-azure/scripts/local-live-e2e.md',
  '../website-product-enrichment-azure/scripts/diagnostics.md',
  '../website-product-enrichment-azure/scripts/campaign-and-reporting.md',
  '../website-product-enrichment-azure/scripts/reset-and-clear-operations.md',
  '../website-product-enrichment-azure/src/README.md',
  '../website-product-enrichment-render/scripts/README.md',
  '../website-product-enrichment-render/src/README.md',
  '../website-product-enrichment-render/src/vendors/README.md',
  '../website-product-enrichment-ui/app/README.md',
  '../website-product-enrichment-ui/server/README.md',
  '../website-product-enrichment-ui/tests/README.md',
  '../website-product-enrichment-sanity-studio/components/README.md',
  '../website-product-enrichment-sanity-studio/functions/README.md',
  '../website-product-enrichment-sanity-studio/schemaTypes/README.md',
  '../website-product-enrichment-sanity-studio/scripts/README.md',
  '../website-product-enrichment-sanity-studio/test/README.md'
]

for (const file of requiredFiles) {
  const path = resolve(repositoryRoot, file)
  await access(path)
  const content = await readFile(path, 'utf8')
  if (content.trim().length === 0) {
    throw new Error(`Documentation file is empty: ${file}`)
  }
}

for (const file of ['docs/project/project-map.json', 'docs/project/project-metadata.json', 'docs/project/scripts/script-index.json']) {
  const path = resolve(repositoryRoot, file)
  JSON.parse(await readFile(path, 'utf8'))
}

for (const repositoryName of ['data', 'render', 'azure', 'ui', 'studio']) {
  await execFileAsync(process.execPath, [resolve(scriptDirectory, 'migrate-data-learnings.mjs'), repositoryName, '--check'])
}
await execFileAsync(process.execPath, [resolve(scriptDirectory, 'check-learning-root-references.mjs')])
await execFileAsync(process.execPath, [resolve(scriptDirectory, 'project-documentation-inventory.mjs'), '--check'])

const markdownFiles = [
  ...(await listMarkdownFiles(resolve(repositoryRoot, 'docs'))),
  ...navigationFiles.map((file) => resolve(repositoryRoot, file))
]

for (const path of markdownFiles) {
  await access(path)
  const content = await readFile(path, 'utf8')
  await validateLocalMarkdownLinks(path, content)
}

console.info(`Canonical documentation is present and ${markdownFiles.length} Markdown files have valid local links.`)

async function listMarkdownFiles(directory) {
  const entries = await readdir(directory, {withFileTypes: true})
  const files = await Promise.all(entries.map(async (entry) => {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) return listMarkdownFiles(path)
    return entry.isFile() && entry.name.endsWith('.md') ? [path] : []
  }))
  return files.flat()
}

async function validateLocalMarkdownLinks(sourcePath, content) {
  const links = content.matchAll(/!?\[[^\]]*\]\((<[^>]+>|[^)\s]+)(?:\s+['"][^)]*['"])?\)/g)
  for (const match of links) {
    const target = match[1].replace(/^<|>$/g, '')
    if (!isLocalTarget(target)) continue

    const [pathAndQuery, fragment] = target.split('#', 2)
    const pathTarget = decodeURIComponent(pathAndQuery.split('?', 1)[0])
    const resolvedTarget = pathTarget.startsWith('/')
      ? resolve(pathTarget)
      : pathTarget ? resolve(dirname(sourcePath), pathTarget) : sourcePath
    try {
      await stat(resolvedTarget)
    } catch {
      const source = relative(repositoryRoot, sourcePath)
      const destination = relative(repositoryRoot, resolvedTarget)
      throw new Error(`Broken local Markdown link in ${source}: ${target} resolves to ${destination}`)
    }
    if (fragment && resolvedTarget.endsWith('.md')) {
      const targetContent = resolvedTarget === sourcePath ? content : await readFile(resolvedTarget, 'utf8')
      if (!markdownAnchors(targetContent).has(decodeURIComponent(fragment).toLowerCase())) {
        const source = relative(repositoryRoot, sourcePath)
        throw new Error(`Broken Markdown anchor in ${source}: ${target}`)
      }
    }
  }
}

function isLocalTarget(target) {
  return target !== ''
    && !target.startsWith('//')
    && !/^[a-z][a-z\d+.-]*:/i.test(target)
}

function markdownAnchors(content) {
  const anchors = new Set()
  const counts = new Map()
  let inCodeFence = false

  for (const line of content.split('\n')) {
    if (line.startsWith('```')) {
      inCodeFence = !inCodeFence
      continue
    }
    if (inCodeFence) continue

    const heading = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line)
    if (!heading) continue
    const base = heading[2]
      .toLowerCase()
      .replace(/<[^>]+>/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\s-]/g, '')
    const count = counts.get(base) ?? 0
    counts.set(base, count + 1)
    anchors.add(count === 0 ? base : `${base}-${count}`)
  }

  return anchors
}
