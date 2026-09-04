#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '..')
const packageJson = JSON.parse(await readFile(resolve(repositoryRoot, 'package.json'), 'utf8'))
const catalog = await readFile(resolve(repositoryRoot, 'docs/project/scripts/README.md'), 'utf8')

for (const scriptName of [
  'workspace:sync',
  'workspace:sync:check',
  'project:inventory',
  'learnings:data:migrate',
  'learnings:data:check',
  'learnings:render:migrate',
  'learnings:render:check',
  'learnings:azure:migrate',
  'learnings:azure:check',
  'learnings:ui:migrate',
  'learnings:ui:check',
  'learnings:studio:migrate',
  'learnings:studio:check'
]) {
  if (!packageJson.scripts[scriptName]) {
    throw new Error(`Missing required script: ${scriptName}`)
  }
  if (!catalog.includes(`\`npm run ${scriptName}\``)) {
    throw new Error(`Script catalog does not document: ${scriptName}`)
  }
}

console.info('Required reusable scripts are indexed.')
