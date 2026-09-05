export const STORAGE_TABLES = {
  composeGroupState: 'webcomposegroupstate',
  extractGroupPdf: 'webextractgrouppdfs',
  crawlRunSummary: 'webcrawlrunsummary',
  sourceRenderValidation: 'websourcerendervalidation',
  composeOutput: 'webcomposeoutput',
  crawlUrlLink: 'webcrawlurllinks',
  crawlPage: 'webcrawlpages',
  sourceExtractDetail: 'websourceextractdetail',
  variantExtractDetail: 'webvariantextractdetail',
  imageClassifyOutcome: 'webimageclassifyoutcome',
  publishMatchLedger: 'webpublishmatchledger',
  imageClassifySwatch: 'webimageclassifyswatch',
  crawlExtractBatch: 'webcrawlextractbatch',
  crawlStageLedger: 'webcrawlstageledger',
  crawlStageDispatch: 'webcrawlstagedispatch',
  sanityImageGeneration: 'sanityimagegeneration',
  sanityTexturePrompt: 'sanitytextureprompts'
} as const

export const STORAGE_CONTAINERS = {
  crawlArtefacts: 'crawl-artefacts',
  crawlManualPdfs: 'crawl-manual-pdfs',
  crawlSwatches: 'crawl-swatches'
} as const

export const STORAGE_QUEUES = {
  crawlRequests: 'crawl-requests',
  crawlRenderJobs: 'crawl-render-jobs',
  crawlSourceRenderComplete: 'crawl-source-render-complete',
  crawlVariantRenderComplete: 'crawl-variant-render-complete',
  crawlSourceExtractJobs: 'crawl-source-extract-jobs',
  crawlVariantExtractJobs: 'crawl-variant-extract-jobs',
  crawlVariantRenderDispatch: 'crawl-variant-render-dispatch',
  crawlImageJobs: 'crawl-image-jobs',
  crawlVariantOutcomeJobs: 'crawl-variant-outcome-jobs',
  crawlComposeJobs: 'crawl-compose-jobs',
  crawlVariantExtractBatchJobs: 'crawl-variant-extract-batch-jobs',
  crawlImageClassifyBatchJobs: 'crawl-image-classify-batch-jobs',
  publishJobs: 'publish-jobs',
  sanityActions: 'sanity-actions',
  sanityImagePrepare: 'sanity-image-prepare',
  sanityImageGenerate: 'sanity-image-generate'
} as const
