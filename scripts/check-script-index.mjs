#!/usr/bin/env node

import { readdir, readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '..')
const manifest = JSON.parse(await readFile(resolve(repositoryRoot, 'docs/project/scripts/script-index.json'), 'utf8'))

for (const repository of manifest.repositories) {
  const scriptsPath = resolve(repositoryRoot, repository.path, 'scripts')
  const readme = await readFile(resolve(scriptsPath, 'README.md'), 'utf8')
  const sourceFiles = (await readdir(scriptsPath, {withFileTypes: true}))
    .filter((entry) => entry.isFile() && /\.(?:[cm]?js|tsx?)$/.test(entry.name))
    .map((entry) => entry.name)
    .sort()
  const indexedFiles = Object.keys(repository.files).sort()

  if (JSON.stringify(sourceFiles) !== JSON.stringify(indexedFiles)) {
    throw new Error(`${repository.name} script manifest does not match scripts/: expected ${sourceFiles.join(', ')}, found ${indexedFiles.join(', ')}`)
  }

  if (!readme.includes(repository.catalogBacklink)) {
    throw new Error(`${repository.name} scripts README is missing its catalog backlink: ${repository.catalogBacklink}`)
  }

  for (const [fileName, classification] of Object.entries(repository.files)) {
    const isTest = /\.test\.[cm]?tsx?$/.test(fileName)
    if (classification === 'test' && !isTest) {
      throw new Error(`${repository.name} marks non-test file as test: ${fileName}`)
    }
    if (classification !== 'test' && isTest) {
      throw new Error(`${repository.name} must classify test file as test: ${fileName}`)
    }
    if (classification === 'documented' && !readme.includes(`\`${fileName}\``)) {
      throw new Error(`${repository.name} scripts README does not document: ${fileName}`)
    }
    if (classification === 'helper-only' && !readme.includes(`\`${fileName}\``)) {
      throw new Error(`${repository.name} scripts README does not classify helper-only file: ${fileName}`)
    }
  }
}

console.info('All top-level script sources are indexed and classified.')
