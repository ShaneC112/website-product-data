#!/usr/bin/env node

import {access, readFile} from 'node:fs/promises'
import {execFile} from 'node:child_process'
import {dirname, resolve} from 'node:path'
import {promisify} from 'node:util'
import {fileURLToPath} from 'node:url'

const execFileAsync = promisify(execFile)
const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const dataRepository = resolve(scriptDirectory, '..')
const workspaceRoot = resolve(dataRepository, '..')
const projectMapPath = resolve(dataRepository, 'docs/project/project-map.json')
const projectMap = JSON.parse(await readFile(projectMapPath, 'utf8'))
const inventory = []

if (!Array.isArray(projectMap.dependencyOrder) || projectMap.dependencyOrder[0] !== 'website-product-data') {
  throw new Error('Project map must declare Data-first dependency order.')
}

if (new Set(projectMap.dependencyOrder).size !== projectMap.repositories.length) {
  throw new Error('Project map dependency order must include every repository exactly once.')
}

for (const repository of projectMap.repositories) {
  const repositoryPath = resolve(workspaceRoot, repository.path)
  const packageJsonPath = resolve(repositoryPath, 'package.json')
  await access(packageJsonPath)
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'))
  const packageManager = packageJson.packageManager?.startsWith('pnpm@') ? 'pnpm' : 'npm'

  if (packageManager !== repository.packageManager) {
    throw new Error(`${repository.path} uses ${packageManager}; project map expects ${repository.packageManager}`)
  }

  for (const command of repository.stableCommands) {
    if (!packageJson.scripts?.[command]) {
      throw new Error(`${repository.path} is missing stable command: ${command}`)
    }
  }

  if (!Array.isArray(repository.indexes) || repository.indexes.length === 0) {
    throw new Error(`${repository.path} is missing canonical documentation indexes.`)
  }
  for (const index of repository.indexes) {
    await access(resolve(repositoryPath, index))
  }

  const {stdout: gitRoot} = await execFileAsync('git', ['-C', repositoryPath, 'rev-parse', '--show-toplevel'])
  inventory.push({
    path: repository.path,
    owner: repository.owner,
    packageManager,
    version: packageJson.version ?? null,
    stableCommands: repository.stableCommands,
    indexes: repository.indexes,
    gitRoot: gitRoot.trim()
  })
}

console.info(JSON.stringify({project: 'Website Product Enrichment', dependencyOrder: projectMap.dependencyOrder, repositories: inventory}, null, 2))