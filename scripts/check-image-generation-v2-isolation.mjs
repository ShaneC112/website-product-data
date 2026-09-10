import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import {fileURLToPath} from 'node:url'
import {spawn} from 'node:child_process'
import ts from 'typescript'
import {imageGenerationV2IsolationManifest} from './image-generation-v2-isolation.manifest.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ALLOWED_ENV_KEYS = ['PATH', 'HOME', 'TMPDIR', 'TEMP', 'TMP', 'SystemRoot', 'ComSpec', 'PATHEXT', 'WINDIR', 'TERM', 'CI']

export async function checkImageGenerationV2Isolation(workspaceRoot, options = {}) {
  const root = workspaceRoot ?? path.resolve(__dirname, '..', '..')
  const manifest = options.manifest ?? imageGenerationV2IsolationManifest
  const runTemporarySimulation = options.runTemporarySimulation ?? true
  const includeGraphEdges = options.includeGraphEdges ?? true
  const violations = []
  const checkedEntrypoints = []
  const graphEdges = []
  const registrationTransforms = []
  const beforeStatus = await readScopedGitStatus(root, manifest)
  let temporaryRoot = null
  let commandResults = manifest.commands.map((command) => ({
    cwd: command.cwd,
    argv: command.argv,
    exitCode: null,
    stderrSummary: 'not-run',
  }))

  try {
    for (const [repositoryName, repository] of Object.entries(manifest.repositories)) {
      const repoRoot = path.join(root, repository.root)
      const compilerContext = loadCompilerResolutionContext(repoRoot)
      const graphTransforms = new Map((repository.registrationTransforms ?? []).map((transform) => [
        path.join(repoRoot, transform.file),
        transform,
      ]))
      for (const entrypoint of repository.entrypoints) {
        const absolutePath = path.join(repoRoot, entrypoint)
        checkedEntrypoints.push(path.relative(root, absolutePath))

        const reachableFiles = await collectReachableFiles(absolutePath, compilerContext, root, (filePath, source) => {
          const transform = graphTransforms.get(filePath)
          return transform?.mode
            ? applyStructuredRegistrationTransform(source, transform.mode, transform.file).source
            : source
        })
        for (const reachableFile of reachableFiles) {
          const relativeReachableFile = path.relative(root, reachableFile)
          graphEdges.push({
            repository: repositoryName,
            entrypoint: path.relative(root, absolutePath),
            file: relativeReachableFile,
          })

          for (const excludedRoot of repository.excludedRoots) {
            const excludedPrefix = path.join(repository.root, excludedRoot)
            if (relativeReachableFile.startsWith(excludedPrefix)) {
              violations.push({
                type: 'excluded-root-reachable',
                entrypoint: path.relative(root, absolutePath),
                file: relativeReachableFile,
                excludedRoot,
              })
            }
          }
        }
      }
    }

    if (runTemporarySimulation) {
      temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'image-generation-v2-'))
      await createTemporaryWorkspace(root, temporaryRoot, manifest)
      registrationTransforms.push(...await applyRegistrationTransforms(temporaryRoot, manifest))
      commandResults = await runScopedCommands(temporaryRoot, manifest.commands)
      for (const command of commandResults) {
        if (command.exitCode !== 0) {
          violations.push({
            type: 'temporary-command-failed',
            cwd: command.cwd,
            argv: command.argv,
            exitCode: command.exitCode,
            stderrSummary: command.stderrSummary,
          })
        }
      }
    }
  } finally {
    if (temporaryRoot) {
      await fs.rm(temporaryRoot, {recursive: true, force: true})
    }
  }

  const afterStatus = await readScopedGitStatus(root, manifest)
  const workingTreeMutated = JSON.stringify(beforeStatus) !== JSON.stringify(afterStatus)
  if (workingTreeMutated) {
    violations.push({type: 'working-tree-mutated'})
  }

  const report = {
    schemaVersion: 1,
    repositories: Object.fromEntries(
      Object.entries(manifest.repositories).map(([name, repository]) => [name, repository.root]),
    ),
    checkedEntrypoints,
    excludedRoots: Object.fromEntries(
      Object.entries(manifest.repositories).map(([name, repository]) => [name, repository.excludedRoots]),
    ),
    graphEdges: includeGraphEdges ? graphEdges : undefined,
    registrationTransforms,
    commands: commandResults,
    violations,
    knownPreExistingDependencies: manifest.repositories.azure?.knownPreExistingDependencies ?? [],
    cleanup: {temporaryWorkspaceRemoved: temporaryRoot === null || !(await pathExists(temporaryRoot)), workingTreeMutated},
  }

  if (options.stdout !== false) {
    process.stdout.write(`${JSON.stringify(pruneUndefined(report), null, 2)}\n`)
  }

  if (violations.length > 0) {
    const error = new Error(`Image generation v2 isolation check failed with ${violations.length} violation(s)`)
    error.report = report
    throw error
  }

  return report
}

function pruneUndefined(value) {
  if (Array.isArray(value)) {
    return value.map(pruneUndefined)
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entryValue]) => entryValue !== undefined)
        .map(([key, entryValue]) => [key, pruneUndefined(entryValue)]),
    )
  }
  return value
}

async function createTemporaryWorkspace(root, temporaryRoot, manifest) {
  for (const repository of Object.values(manifest.repositories)) {
    const sourceRoot = path.join(root, repository.root)
    const targetRoot = path.join(temporaryRoot, repository.root)
    await copyDirectory(
      sourceRoot,
      targetRoot,
      ['.git', 'node_modules', 'dist', 'artifacts', 'playwright-report', 'test-results'],
      repository.excludedRoots.map((excludedRoot) => path.resolve(sourceRoot, excludedRoot)),
    )
    if (repository.isolationTsconfig) {
      await fs.writeFile(path.join(targetRoot, '.image-generation-v2-isolation.tsconfig.json'), JSON.stringify({
        extends: repository.isolationTsconfig,
        compilerOptions: {noEmit: repository.isolationNoEmit ?? true},
        files: repository.entrypoints,
        include: [],
        exclude: [],
      }, null, 2))
    }
    const sourceNodeModules = path.join(sourceRoot, 'node_modules')
    if (await pathExists(sourceNodeModules)) {
      await fs.symlink(sourceNodeModules, path.join(targetRoot, 'node_modules'))
    }
  }
}

async function applyRegistrationTransforms(temporaryRoot, manifest) {
  const transforms = []
  const studio = manifest.repositories.studio
  if (!studio) {
    return transforms
  }
  for (const transform of studio.registrationTransforms ?? []) {
    const filePath = path.join(temporaryRoot, studio.root, transform.file)
    let source = await fs.readFile(filePath, 'utf8')
    if (transform.mode) {
      const result = applyStructuredRegistrationTransform(source, transform.mode, transform.file)
      source = result.source
      transforms.push({file: path.join(studio.root, transform.file), removed: result.removed})
    } else {
      for (const snippet of transform.remove ?? []) {
        const occurrences = source.split(snippet).length - 1
        if (occurrences !== 1) {
          throw new Error(`Expected exactly one removable registration snippet in ${transform.file}`)
        }
        source = source.replace(snippet, '')
        transforms.push({file: path.join(studio.root, transform.file), removed: snippet.trim().slice(0, 120)})
      }
    }
    await fs.writeFile(filePath, source)
  }
  return transforms
}

function applyStructuredRegistrationTransform(source, mode, file) {
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, scriptKindForFile(file))
  let removed = 0
  const expectedRemovals = mode === 'remove-room-image-document-action'
    ? (source.includes('createRoomImageRequestAction') ? 1 : 0)
    : (source.includes("name: 'request-room-images'") ? 1 : 0)
  const transformer = mode === 'remove-room-image-document-action'
    ? (context) => (root) => ts.visitNode(root, function visit(node) {
        if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)
          && node.moduleSpecifier.text.endsWith('/CreateRoomImageRequestAction')) {
          removed += 1
          return undefined
        }
        if (ts.isIdentifier(node) && node.text === 'createRoomImageRequestAction') {
          return undefined
        }
        if (ts.isAsExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'createRoomImageRequestAction') {
          return undefined
        }
        if (ts.isArrayLiteralExpression(node)) {
          const elements = node.elements.filter((element) => {
            if (ts.isIdentifier(element) && element.text === 'createRoomImageRequestAction') {
              return false
            }
            if (ts.isAsExpression(element) && ts.isIdentifier(element.expression) && element.expression.text === 'createRoomImageRequestAction') {
              return false
            }
            return true
          })
          if (elements.length !== node.elements.length) {
            return ts.factory.updateArrayLiteralExpression(node, elements)
          }
        }
        return ts.visitEachChild(node, visit, context)
      })
    : mode === 'remove-room-image-blueprint-function'
      ? (context) => (root) => ts.visitNode(root, function visit(node) {
          if (ts.isArrayLiteralExpression(node)) {
            const elements = node.elements.filter((element) => {
              if (isLegacyRoomImageFunction(element)) {
                removed += 1
                return false
              }
              return true
            })
            return ts.factory.updateArrayLiteralExpression(node, elements)
          }
          return ts.visitEachChild(node, visit, context)
        })
      : null

  if (!transformer) throw new Error(`Unsupported registration transform mode ${mode} in ${file}`)
  const transformed = ts.transform(sourceFile, [transformer]).transformed[0]
  if (removed !== expectedRemovals) {
    throw new Error(`Expected exactly one ${mode} registration in ${file}`)
  }
  return {source: ts.createPrinter().printFile(transformed), removed: mode}
}

function containsIdentifier(node, identifier) {
  let found = false
  function visit(candidate) {
    if (ts.isIdentifier(candidate) && candidate.text === identifier) found = true
    ts.forEachChild(candidate, visit)
  }
  visit(node)
  return found
}

function isLegacyRoomImageFunction(node) {
  if (!ts.isCallExpression(node) || !ts.isIdentifier(node.expression) || node.expression.text !== 'defineDocumentFunction') {
    return false
  }
  const definition = node.arguments[0]
  if (!definition || !ts.isObjectLiteralExpression(definition)) return false
  const nameProperty = definition.properties.find((property) => ts.isPropertyAssignment(property)
    && ts.isIdentifier(property.name) && property.name.text === 'name')
  return Boolean(nameProperty && ts.isPropertyAssignment(nameProperty)
    && ts.isStringLiteral(nameProperty.initializer) && nameProperty.initializer.text === 'request-room-images')
}

async function runScopedCommands(temporaryRoot, commands) {
  const results = []
  for (const command of commands) {
    const cwd = path.join(temporaryRoot, command.cwd)
    const result = await runCommand(command.argv[0], command.argv.slice(1), cwd)
    results.push({
      cwd: command.cwd,
      argv: command.argv,
      exitCode: result.exitCode,
      stdoutSummary: summarizeOutput(result.stdout),
      stderrSummary: summarizeStderr(result.stderr),
    })
  }
  return results
}

async function runCommand(command, args, cwd) {
  return await new Promise((resolve, reject) => {
    const child = spawn(command, args, {cwd, env: buildAllowedEnvironment(), stdio: ['ignore', 'pipe', 'pipe']})
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString()
    })
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })
    child.on('error', reject)
    child.on('close', (exitCode) => resolve({exitCode: exitCode ?? 1, stdout, stderr}))
  })
}

function buildAllowedEnvironment() {
  return Object.fromEntries(
    ALLOWED_ENV_KEYS
      .map((key) => [key, process.env[key]])
      .filter(([, value]) => value !== undefined),
  )
}

function summarizeStderr(stderr) {
  return summarizeOutput(stderr)
}

function summarizeOutput(output) {
  const trimmed = output.trim()
  if (!trimmed) {
    return ''
  }
  return trimmed.split('\n').slice(-12).join(' | ').slice(0, 1200)
}

async function copyDirectory(sourceRoot, targetRoot, excludedNames, excludedRoots = []) {
  await fs.mkdir(targetRoot, {recursive: true})
  const entries = await fs.readdir(sourceRoot, {withFileTypes: true})
  for (const entry of entries) {
    if (excludedNames.includes(entry.name) || shouldExcludeTemporaryCopyEntry(entry.name)) {
      continue
    }
    const sourcePath = path.join(sourceRoot, entry.name)
    if (excludedRoots.some((excludedRoot) => sourcePath === excludedRoot || sourcePath.startsWith(`${excludedRoot}${path.sep}`))) {
      continue
    }
    const targetPath = path.join(targetRoot, entry.name)
    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, targetPath, excludedNames, excludedRoots)
      continue
    }
    if (entry.isSymbolicLink()) {
      const linkTarget = await fs.readlink(sourcePath)
      await fs.symlink(linkTarget, targetPath)
      continue
    }
    await fs.copyFile(sourcePath, targetPath)
  }
}

function shouldExcludeTemporaryCopyEntry(name) {
  return name === 'local.settings.json' || name.startsWith('.env')
}

export const __testOnly = {
  applyStructuredRegistrationTransform,
  copyDirectory,
  shouldExcludeTemporaryCopyEntry,
  snapshotFile,
}

async function readScopedGitStatus(root, manifest) {
  const status = {}
  for (const repository of Object.values(manifest.repositories)) {
    status[repository.root] = await listFiles(path.join(root, repository.root))
  }
  return status
}

async function listFiles(directory) {
  const files = []
  const entries = await fs.readdir(directory, {withFileTypes: true})
  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'dist') {
      continue
    }
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...await listFiles(fullPath))
    } else {
      files.push(await snapshotFile(fullPath))
    }
  }
  return files.sort((left, right) => left.path.localeCompare(right.path))
}

async function snapshotFile(fullPath) {
  const stat = await fs.stat(fullPath)
  const content = await fs.readFile(fullPath)
  return {
    path: fullPath,
    size: stat.size,
    mtimeMs: stat.mtimeMs,
    sha1: crypto.createHash('sha1').update(content).digest('hex'),
  }
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath)
    return true
  } catch {
    return false
  }
}

function loadCompilerResolutionContext(repoRoot) {
  const configPath = path.join(repoRoot, 'tsconfig.json')
  const parsed = ts.getParsedCommandLineOfConfigFile(configPath, {}, {
    ...ts.sys,
    onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
      throw new Error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
    },
  })
  if (!parsed) {
    throw new Error(`Unable to parse ${configPath}`)
  }
  return {repoRoot, options: parsed.options}
}

async function collectReachableFiles(entrypoint, compilerContext, workspaceRoot, transformSource = (_filePath, source) => source) {
  const visited = new Set()
  const queue = [entrypoint]

  while (queue.length > 0) {
    const currentFile = queue.shift()
    if (!currentFile || visited.has(currentFile)) {
      continue
    }

    visited.add(currentFile)
    const source = transformSource(currentFile, await fs.readFile(currentFile, 'utf8'))
    const sourceFile = ts.createSourceFile(currentFile, source, ts.ScriptTarget.Latest, true, scriptKindForFile(currentFile))

    for (const specifier of collectImportSpecifiers(sourceFile)) {
      if (!specifier.startsWith('.') && !specifier.startsWith('@shane-corrigan/website-product-data')) {
        continue
      }

      const resolved = ts.resolveModuleName(specifier, currentFile, compilerContext.options, ts.sys).resolvedModule?.resolvedFileName
      if (resolved && resolved.startsWith(workspaceRoot + path.sep)) {
        queue.push(resolved)
      }
    }
  }

  return [...visited].sort()
}

function collectImportSpecifiers(sourceFile) {
  const specifiers = []

  function visit(node) {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      specifiers.push(node.moduleSpecifier.text)
    }
    if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      specifiers.push(node.moduleSpecifier.text)
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return specifiers
}

function scriptKindForFile(filePath) {
  if (filePath.endsWith('.tsx')) {
    return ts.ScriptKind.TSX
  }
  if (filePath.endsWith('.js') || filePath.endsWith('.mjs')) {
    return ts.ScriptKind.JS
  }
  return ts.ScriptKind.TS
}

if (process.argv[1] === __filename) {
  checkImageGenerationV2Isolation().catch((error) => {
    process.stderr.write(`${error.message}\n`)
    process.exitCode = 1
  })
}