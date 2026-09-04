#!/usr/bin/env node

import {access, readdir, readFile, stat, writeFile} from 'node:fs/promises'
import {execFile} from 'node:child_process'
import {dirname, relative, resolve} from 'node:path'
import {promisify} from 'node:util'
import {fileURLToPath} from 'node:url'

const execFileAsync = promisify(execFile)
const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const dataRepository = resolve(scriptDirectory, '..')
const workspaceRoot = resolve(dataRepository, '..')
const projectMap = JSON.parse(await readFile(resolve(dataRepository, 'docs/project/project-map.json'), 'utf8'))
const manifestPath = resolve(dataRepository, 'docs/project/migration/project-documentation-inventory.json')
const mode = process.argv[2]

if (!['--check', '--write'].includes(mode) || process.argv.length !== 3) {
  throw new Error('Usage: node scripts/project-documentation-inventory.mjs --check|--write')
}

const inventory = {
  version: 1,
  scope: 'Website Product Enrichment documentation migration',
  dispositionCategories: [
    'retained',
    'moved',
    'consolidated',
    'intentionally-historical',
    'obsolete'
  ],
  repositories: await Promise.all(projectMap.repositories.map(inventoryRepository))
}

if (mode === '--write') {
  await writeFile(manifestPath, `${JSON.stringify(inventory, null, 2)}\n`)
  console.info(`Wrote documentation inventory for ${inventory.repositories.length} repositories.`)
} else {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
  validateManifest(manifest, inventory)
  console.info(`Documentation inventory is valid for ${inventory.repositories.length} repositories.`)
}

async function inventoryRepository(repository) {
  const repositoryPath = resolve(workspaceRoot, repository.path)
  const packageJson = JSON.parse(await readFile(resolve(repositoryPath, 'package.json'), 'utf8'))
  const packageManager = packageJson.packageManager?.startsWith('pnpm@') ? 'pnpm' : 'npm'
  const readme = await readFile(resolve(repositoryPath, 'README.md'), 'utf8')
  const learnings = await readFile(resolve(repositoryPath, 'LEARNINGS.md'), 'utf8')
  const {stdout: gitRoot} = await execFileAsync('git', ['-C', repositoryPath, 'rev-parse', '--show-toplevel'])

  return {
    path: repository.path,
    package: {
      name: packageJson.name,
      version: packageJson.version ?? null,
      manager: packageManager,
      aliases: Object.keys(packageJson.scripts ?? {}).sort()
    },
    gitRoot: gitRoot.trim(),
    rootReadme: markdownNavigation(readme),
    rootLearnings: learningRedirectState(learnings),
    scripts: await scriptInventory(repositoryPath),
    agentCustomization: await agentCustomizationStatus(repositoryPath),
    dirtyPathsAtInventory: await dirtyPaths(repositoryPath),
    disposition: {
      category: 'consolidated',
      detail: 'Root learning catalog redirects to the canonical indexed project documentation.'
    }
  }
}

function markdownNavigation(content) {
  const headings = []
  const anchors = new Map()
  let inCodeFence = false

  for (const line of content.split('\n')) {
    if (line.startsWith('```')) {
      inCodeFence = !inCodeFence
      continue
    }
    if (inCodeFence) continue

    const heading = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line)
    if (!heading) continue

    const text = heading[2]
    const baseAnchor = text
      .toLowerCase()
      .replace(/<[^>]+>/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\s-]/g, '')
    const count = anchors.get(baseAnchor) ?? 0
    anchors.set(baseAnchor, count + 1)
    headings.push({level: heading[1].length, text, anchor: count === 0 ? baseAnchor : `${baseAnchor}-${count}`})
  }

  return {headings}
}

function learningRedirectState(content) {
  const links = [...content.matchAll(/\[[^\]]+\]\(([^)\s]+)\)/g)].map((match) => match[1])
  return {
    state: /redirect only/i.test(content) && links.length > 0 ? 'redirect-only' : 'content-present',
    canonicalTargets: links
  }
}

async function scriptInventory(repositoryPath) {
  const scriptsPath = resolve(repositoryPath, 'scripts')
  if (!(await pathExists(scriptsPath))) return {status: 'absent', files: []}

  const files = await listScriptSources(scriptsPath, scriptsPath)
  return {
    status: 'present',
    rootIndex: await pathExists(resolve(scriptsPath, 'README.md')) ? 'present' : 'missing',
    files
  }
}

async function listScriptSources(directory, rootDirectory) {
  const entries = await readdir(directory, {withFileTypes: true})
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) return listScriptSources(path, rootDirectory)
    return entry.isFile() && /\.(?:[cm]?js|tsx?)$/.test(entry.name)
      ? [relative(rootDirectory, path)]
      : []
  }))
  return nested.flat().sort()
}

async function agentCustomizationStatus(repositoryPath) {
  const customizations = []
  for (const path of ['workspace-customizations', '.github/agents', '.github/skills', '.github/hooks']) {
    if (await pathExists(resolve(repositoryPath, path))) customizations.push(path)
  }
  return {
    rootAgents: await pathExists(resolve(repositoryPath, 'AGENTS.md')) ? 'present' : 'missing',
    customizationPaths: customizations
  }
}

async function dirtyPaths(repositoryPath) {
  const {stdout} = await execFileAsync('git', ['-C', repositoryPath, 'status', '--porcelain=v1', '-z'])
  const records = stdout.split('\0').filter(Boolean)
  const paths = []
  for (let index = 0; index < records.length; index += 1) {
    const record = records[index]
    paths.push(record.slice(3))
    if (/^[RC]/.test(record.slice(0, 2))) index += 1
  }
  return paths.sort()
}

async function pathExists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

function validateManifest(manifest, currentInventory) {
  if (manifest.version !== currentInventory.version) throw new Error('Documentation inventory has an unsupported version.')
  if (JSON.stringify(manifest.dispositionCategories) !== JSON.stringify(currentInventory.dispositionCategories)) {
    throw new Error('Documentation inventory disposition categories are stale.')
  }

  const stableManifest = {...manifest, repositories: manifest.repositories.map(withoutDirtyPaths)}
  const stableCurrent = {...currentInventory, repositories: currentInventory.repositories.map(withoutDirtyPaths)}
  if (JSON.stringify(stableManifest) !== JSON.stringify(stableCurrent)) {
    throw new Error('Documentation inventory is stale. Run npm run project:documentation:inventory.')
  }
}

function withoutDirtyPaths(repository) {
  const {dirtyPathsAtInventory, ...stableRepository} = repository
  return stableRepository
}