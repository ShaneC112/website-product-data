import {describe, expect, it} from 'vitest'
import {__testOnly, checkImageGenerationV2Isolation} from '../scripts/check-image-generation-v2-isolation.mjs'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

describe('checkImageGenerationV2Isolation', () => {
  it('reports the current v2 entrypoints and known pre-existing Azure dependency blockers without violations', async () => {
    const report = await checkImageGenerationV2Isolation('/workspaces/project-container', {
      stdout: false,
      runTemporarySimulation: false,
      includeGraphEdges: false,
    })

    expect(report.schemaVersion).toBe(1)
    expect(report.checkedEntrypoints).toContain('website-product-data/src/image-generation/index.ts')
    expect(report.checkedEntrypoints).toContain('website-product-enrichment-azure/src/sanity-images-v2/04-render/registry.ts')
    expect(report.checkedEntrypoints).toContain('website-product-enrichment-sanity-studio/functions/request-ai-images-v2/index.ts')
    expect(report.knownPreExistingDependencies).toEqual([
      'src/core/azureOpenAi.ts',
      'src/05-image-classify/process/swatchColour.ts',
    ])
    expect(report.graphEdges).toBeUndefined()
    expect(report.violations).toEqual([])
  })

  it('does not forward arbitrary environment variables into temporary commands', async () => {
    const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'image-generation-v2-env-'))
    const scriptPath = path.join(temporaryRoot, 'print-env.mjs')
    await fs.writeFile(scriptPath, "process.stdout.write(process.env.IMAGE_GENERATION_V2_SECRET ?? 'missing')\n")

    const previousSecret = process.env.IMAGE_GENERATION_V2_SECRET
    process.env.IMAGE_GENERATION_V2_SECRET = 'should-not-leak'

    const {spawn} = await import('node:child_process')
    const output = await new Promise((resolve, reject) => {
      const child = spawn('node', [scriptPath], {
        cwd: temporaryRoot,
        env: Object.fromEntries(
          ['PATH', 'HOME', 'TMPDIR', 'TEMP', 'TMP', 'TERM', 'CI']
            .map((key) => [key, process.env[key]])
            .filter(([, value]) => value !== undefined),
        ),
        stdio: ['ignore', 'pipe', 'pipe'],
      })
      let stdout = ''
      let stderr = ''
      child.stdout.on('data', (chunk) => {
        stdout += chunk.toString()
      })
      child.stderr.on('data', (chunk) => {
        stderr += chunk.toString()
      })
      child.on('error', reject)
      child.on('close', (exitCode) => {
        if (exitCode !== 0) {
          reject(new Error(stderr || `unexpected exit code ${exitCode}`))
          return
        }
        resolve(stdout)
      })
    })

    expect(output).toBe('missing')

    if (previousSecret === undefined) {
      delete process.env.IMAGE_GENERATION_V2_SECRET
    } else {
      process.env.IMAGE_GENERATION_V2_SECRET = previousSecret
    }
    await fs.rm(temporaryRoot, {recursive: true, force: true})
  })

  it('marks .env and local.settings.json files for exclusion from the temporary workspace copy', async () => {
    expect(__testOnly.shouldExcludeTemporaryCopyEntry('.env')).toBe(true)
    expect(__testOnly.shouldExcludeTemporaryCopyEntry('.env.local')).toBe(true)
    expect(__testOnly.shouldExcludeTemporaryCopyEntry('local.settings.json')).toBe(true)
    expect(__testOnly.shouldExcludeTemporaryCopyEntry('package.json')).toBe(false)
  })

  it('physically omits manifest-style excluded roots from a temporary copy', async () => {
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'image-generation-v2-copy-source-'))
    const targetRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'image-generation-v2-copy-target-'))
    await fs.mkdir(path.join(sourceRoot, 'legacy', 'nested'), {recursive: true})
    await fs.mkdir(path.join(sourceRoot, 'current'), {recursive: true})
    await fs.writeFile(path.join(sourceRoot, 'legacy', 'nested', 'hidden.ts'), 'legacy\n')
    await fs.writeFile(path.join(sourceRoot, 'legacy-action.ts'), 'legacy action\n')
    await fs.writeFile(path.join(sourceRoot, 'current', 'visible.ts'), 'current\n')

    await __testOnly.copyDirectory(sourceRoot, targetRoot, [], [
      path.join(sourceRoot, 'legacy'),
      path.join(sourceRoot, 'legacy-action.ts'),
    ])

    await expect(fs.access(path.join(targetRoot, 'current', 'visible.ts'))).resolves.toBeUndefined()
    await expect(fs.access(path.join(targetRoot, 'legacy'))).rejects.toThrow()
    await expect(fs.access(path.join(targetRoot, 'legacy-action.ts'))).rejects.toThrow()
    await fs.rm(sourceRoot, {recursive: true, force: true})
    await fs.rm(targetRoot, {recursive: true, force: true})
  })

  it('runs a real disposable simulation with excluded paths absent', async () => {
    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'image-generation-v2-simulation-'))
    const repositoryRoot = path.join(workspaceRoot, 'fixture-data')
    try {
      await fs.mkdir(path.join(repositoryRoot, 'src', 'legacy'), {recursive: true})
      await fs.mkdir(path.join(repositoryRoot, 'src', 'current'), {recursive: true})
      await fs.writeFile(path.join(repositoryRoot, 'tsconfig.json'), JSON.stringify({compilerOptions: {module: 'NodeNext', moduleResolution: 'NodeNext'}}))
      await fs.writeFile(path.join(repositoryRoot, 'src', 'index.ts'), "import './current/visible.js'\n")
      await fs.writeFile(path.join(repositoryRoot, 'src', 'current', 'visible.ts'), 'export const visible = true\n')
      await fs.writeFile(path.join(repositoryRoot, 'src', 'legacy', 'hidden.ts'), 'export const hidden = true\n')
      await fs.writeFile(path.join(repositoryRoot, 'assert-isolated.mjs'), [
        "import {existsSync} from 'node:fs'",
        "if (!existsSync('src/current/visible.ts') || existsSync('src/legacy')) process.exit(1)",
      ].join('\n'))
      const manifest = {
        schemaVersion: 1,
        repositories: {
          data: {root: 'fixture-data', entrypoints: ['src/index.ts'], excludedRoots: ['src/legacy'], allowedSharedFiles: []},
        },
        commands: [{cwd: 'fixture-data', argv: ['node', 'assert-isolated.mjs']}],
      }

      const report = await checkImageGenerationV2Isolation(workspaceRoot, {
        stdout: false,
        includeGraphEdges: true,
        runTemporarySimulation: true,
        manifest,
      })

      expect(report.violations).toEqual([])
      expect(report.commands).toEqual([expect.objectContaining({exitCode: 0})])
      expect(report.cleanup).toEqual({temporaryWorkspaceRemoved: true, workingTreeMutated: false})
      expect(report.graphEdges).toContainEqual(expect.objectContaining({file: 'fixture-data/src/current/visible.ts'}))
    } finally {
      await fs.rm(workspaceRoot, {recursive: true, force: true})
    }
  })

  it('captures content-sensitive file snapshots for mutation detection', async () => {
    const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'image-generation-v2-snapshot-'))
    const filePath = path.join(temporaryRoot, 'sample.txt')
    await fs.writeFile(filePath, 'first\n')

    const before = await __testOnly.snapshotFile(filePath)
    await fs.writeFile(filePath, 'second line\n')
    const after = await __testOnly.snapshotFile(filePath)

    expect(before.path).toBe(after.path)
    expect(before.sha1).not.toBe(after.sha1)
    expect(before.size).not.toBe(after.size)

    await fs.rm(temporaryRoot, {recursive: true, force: true})
  })

  it('removes the legacy room-image Studio document action with a structure-aware transform', async () => {
    const source = [
      "import {type DocumentActionComponent, type DocumentActionsContext} from 'sanity'",
      "import {createRoomImageRequestAction} from '../components/CreateRoomImageRequestAction'",
      "import {createImageryV2Action} from '../components/image-generation-v2/CreateImageryV2Action'",
      '',
      'export function resolveDocumentActions(previous: DocumentActionComponent[], context: DocumentActionsContext): DocumentActionComponent[] {',
      "  if (context.schemaType === 'product') {",
      '    return [...previous, createRoomImageRequestAction as DocumentActionComponent, createImageryV2Action as DocumentActionComponent]',
      '  }',
      '',
      '  return previous',
      '}',
      '',
    ].join('\n')

    const result = __testOnly.applyStructuredRegistrationTransform(source, 'remove-room-image-document-action', 'src/documentActions.ts')

    expect(result.removed).toBe('remove-room-image-document-action')
    expect(result.source).not.toContain('createRoomImageRequestAction')
    expect(result.source).toContain("context.schemaType === 'product'")
    expect(result.source).toContain('createImageryV2Action')
  })

  it('removes the legacy room-image Blueprint function with a structure-aware transform', async () => {
    const source = [
      "import {defineBlueprint, defineDocumentFunction} from '@sanity/blueprints'",
      '',
      'export default defineBlueprint({',
      '  resources: [',
      '    defineDocumentFunction({',
      "      name: 'request-room-images',",
      "      src: 'functions/request-room-images',",
      "      runtime: 'nodejs24.x',",
      '      timeout: 60,',
      '      event: {',
      "        on: ['create', 'update'],",
      '      },',
      '      env: {',
      "        AZURE_QUEUE_SAS_TOKEN: requiredEnv('AZURE_QUEUE_SAS_TOKEN'),",
      '      },',
      '    }),',
      '    defineDocumentFunction({',
      "      name: 'request-ai-images-v2',",
      "      src: 'functions/request-ai-images-v2',",
      '    }),',
      '  ],',
      '})',
      '',
    ].join('\n')

    const result = __testOnly.applyStructuredRegistrationTransform(source, 'remove-room-image-blueprint-function', 'sanity.blueprint.ts')

    expect(result.removed).toBe('remove-room-image-blueprint-function')
    expect(result.source).not.toContain("name: 'request-room-images'")
    expect(result.source).toContain("name: 'request-ai-images-v2'")
  })
})