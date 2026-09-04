#!/usr/bin/env node

import { access, copyFile, mkdir, readFile, rm } from 'node:fs/promises'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const dataRepository = resolve(scriptDirectory, '..')
const workspaceRoot = resolve(dataRepository, '..')
const sourceRoot = resolve(dataRepository, 'workspace-customizations')

const manifest = [
  {
    source: 'README.md',
    target: '../../README.md'
  },
  {
    source: 'AGENTS.md',
    target: '../../AGENTS.md'
  },
  {
    source: '.github/agents',
    target: '../../.github/agents',
    directory: true
  },
  {
    source: '.github/skills',
    target: '../../.github/skills',
    directory: true
  },
  {
    source: '.github/hooks',
    target: '../../.github/hooks',
    directory: true,
    optional: true
  }
]

const mode = process.argv.slice(2).at(0) ?? '--check'

if (!['--check', '--write'].includes(mode)) {
  throw new Error('Usage: node scripts/sync-workspace-customizations.mjs [--check|--write]')
}

async function pathExists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function listFiles(directory) {
  const { readdir } = await import('node:fs/promises')
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const entryPath = resolve(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...await listFiles(entryPath))
    } else if (entry.isFile()) {
      files.push(entryPath)
    }
  }

  return files
}

async function filesMatch(source, target) {
  if (!(await pathExists(target))) {
    return false
  }

  const [sourceContent, targetContent] = await Promise.all([readFile(source), readFile(target)])
  return sourceContent.equals(targetContent)
}

async function syncFile(source, target) {
  if (mode === '--check') {
    return await filesMatch(source, target)
  }

  await mkdir(dirname(target), { recursive: true })
  await copyFile(source, target)
  return true
}

async function syncDirectory(sourceDirectory, targetDirectory) {
  const sourceFiles = await listFiles(sourceDirectory)
  const expectedTargets = new Set()
  let matches = true

  for (const source of sourceFiles) {
    const target = resolve(targetDirectory, relative(sourceDirectory, source))
    expectedTargets.add(target)
    if (!(await syncFile(source, target))) {
      matches = false
      console.error(`Drift: ${relative(workspaceRoot, target)}`)
    }
  }

  if (mode === '--write' && await pathExists(targetDirectory)) {
    for (const target of await listFiles(targetDirectory)) {
      if (!expectedTargets.has(target)) {
        console.info(`Preserved unmanaged workspace customization: ${relative(workspaceRoot, target)}`)
      }
    }
  }

  return matches
}

let isSynchronized = true

for (const entry of manifest) {
  const source = resolve(sourceRoot, entry.source)
  const target = resolve(sourceRoot, entry.target)

  if (!(await pathExists(source))) {
    if (entry.optional) {
      continue
    }
    throw new Error(`Canonical customization is missing: ${relative(dataRepository, source)}`)
  }

  const matches = entry.directory
    ? await syncDirectory(source, target)
    : await syncFile(source, target)

  if (!matches) {
    isSynchronized = false
    console.error(`Drift: ${relative(workspaceRoot, target)}`)
  }
}

if (!isSynchronized && mode === '--check') {
  process.exitCode = 1
} else {
  console.info(mode === '--write' ? 'Workspace customizations synchronized.' : 'Workspace customizations are synchronized.')
}
