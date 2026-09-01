export const STORAGE_TABLES = {
  crawlGroupState: 'webcrawlgroupstate',
  crawlGroupPdf: 'webcrawlgrouppdfs',
  crawlRunSummary: 'webcrawlrunsummary',
  crawlValidation: 'webcrawlvalidations',
  crawlProductDetail: 'webcrawlproductdetail',
  crawlUrlLink: 'webcrawlurllinks',
  crawlPage: 'webcrawlpages',
  crawlPageDetail: 'webcrawlpagedetail',
  crawlVariantDetail: 'webcrawlvariantdetail',
  crawlMatchingLedger: 'webcrawlmatchledger',
  crawlVariantSwatch: 'webcrawlvariantswatches',
  crawlExtractBatch: 'webcrawlextractbatch',
  sanityImageGeneration: 'sanityimagegeneration'
} as const

export const STORAGE_CONTAINERS = {
  crawlArtefacts: 'crawl-artefacts',
  crawlManualPdfs: 'crawl-manual-pdfs',
  crawlSwatches: 'crawl-swatches'
} as const

export const STORAGE_QUEUES = {
  crawlRequests: 'crawl-requests',
  crawlRenderJobs: 'crawl-render-jobs',
  crawlRenderComplete: 'crawl-render-complete',
  crawlExtractJobs: 'crawl-extract-jobs',
  crawlVariantJobs: 'crawl-variant-jobs',
  crawlImageJobs: 'crawl-image-jobs',
  crawlTransformJobs: 'crawl-transform-jobs',
  crawlExtractBatchJobs: 'crawl-extract-batch-jobs',
  publishJobs: 'publish-jobs',
  sanityImagePrepare: 'sanity-image-prepare',
  sanityImageGenerate: 'sanity-image-generate'
} as const
