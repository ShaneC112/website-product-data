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
  crawlVariantSwatch: 'webcrawlvariantswatches'
} as const

export const STORAGE_CONTAINERS = {
  crawlArtefacts: 'crawl-artefacts',
  crawlManualPdfs: 'crawl-manual-pdfs',
  crawlSwatches: 'crawl-swatches'
} as const

export const STORAGE_QUEUES = {
  crawlRequests: 'crawl-requests',
  crawlRenderJobs: 'crawl-render-jobs',
  crawlImageJobs: 'crawl-image-jobs',
  crawlTransformJobs: 'crawl-transform-jobs',
  publishJobs: 'publish-jobs'
} as const
