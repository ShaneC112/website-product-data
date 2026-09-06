export const imageGenerationV2IsolationManifest = {
  schemaVersion: 1,
  repositories: {
    data: {
      root: 'website-product-data',
      isolationTsconfig: './tsconfig.build.json',
      isolationNoEmit: false,
      entrypoints: [
        'src/image-generation/index.ts',
        'src/image-generation/sanity/request.schema.ts',
        'src/image-generation/sanity/template.schema.ts',
        'src/image-generation/sanity/run.schema.ts',
        'src/storage/constants.ts',
      ],
      excludedRoots: ['src/sanity/'],
      allowedSharedFiles: ['src/sanity.ts'],
    },
    azure: {
      root: 'website-product-enrichment-azure',
      isolationTsconfig: './tsconfig.json',
      entrypoints: [
        'src/sanity-images-v2/00-ingress/queue.ts',
        'src/sanity-images-v2/00-ingress/request.ts',
        'src/sanity-images-v2/01-resolve/request.ts',
        'src/sanity-images-v2/02-generate/registry.ts',
        'src/sanity-images-v2/03-assemble/registry.ts',
        'src/sanity-images-v2/04-render/registry.ts',
        'src/sanity-images-v2/05-persist/registry.ts',
      ],
      excludedRoots: ['src/sanity-images/'],
      allowedSharedFiles: ['src/core/ai/README.md'],
      knownPreExistingDependencies: [
        'src/core/azureOpenAi.ts',
        'src/05-image-classify/process/swatchColour.ts',
      ],
    },
    studio: {
      root: 'website-product-enrichment-sanity-studio',
      isolationTsconfig: './tsconfig.json',
      entrypoints: [
        'src/documentActions.ts',
        'sanity.blueprint.ts',
        'functions/request-ai-images-v2/index.ts',
        'functions/request-ai-images-v2/queue.ts',
      ],
      excludedRoots: ['functions/request-room-images/', 'components/CreateRoomImageRequestAction.tsx'],
      allowedSharedFiles: [],
      registrationTransforms: [
        {
          file: 'src/documentActions.ts',
          mode: 'remove-room-image-document-action',
        },
        {
          file: 'sanity.blueprint.ts',
          mode: 'remove-room-image-blueprint-function',
        },
      ],
    },
  },
  commands: [
    {cwd: 'website-product-data', argv: ['node_modules/.bin/tsc', '-p', '.image-generation-v2-isolation.tsconfig.json']},
    {cwd: 'website-product-data', argv: ['npm', 'test', '--', 'test/image-generation-v2-boundary.test.ts', 'test/check-image-generation-v2-isolation.test.ts']},
    {cwd: 'website-product-enrichment-azure', argv: ['node_modules/.bin/tsc', '-p', '.image-generation-v2-isolation.tsconfig.json']},
    {cwd: 'website-product-enrichment-azure', argv: ['npm', 'test', '--', '--runInBand', 'src/core/ai', 'src/sanity-images-v2']},
    {cwd: 'website-product-enrichment-sanity-studio', argv: ['node_modules/.bin/tsc', '-p', '.image-generation-v2-isolation.tsconfig.json']},
    {cwd: 'website-product-enrichment-sanity-studio', argv: ['node_modules/.bin/vitest', 'run', 'test/requestAiImagesV2Queue.test.ts', 'test/requestAiImagesV2Handler.test.ts', 'test/image-generation-v2.action.test.ts']},
  ],
}