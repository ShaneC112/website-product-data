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

  const {stdout: gitRoot} = await execFileAsync('git', ['-C', repositoryPath, 'rev-parse', '--show-toplevel'])
  inventory.push({
    path: repository.path,
    owner: repository.owner,
    packageManager,
    version: packageJson.version ?? null,
    stableCommands: repository.stableCommands,
    gitRoot: gitRoot.trim()
  })
}

console.info(JSON.stringify({project: 'Website Product Enrichment', repositories: inventory}, null, 2))