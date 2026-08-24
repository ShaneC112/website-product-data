export const STORAGE_TABLES = {
  crawlGroupState: 'webcrawlgroupstate',
  crawlRunSummary: 'webcrawlrunsummary',
  crawlValidation: 'webcrawlvalidations',
  crawlProductDetail: 'webcrawlproductdetail',
  crawlUrlLink: 'webcrawlurllinks',
  crawlPage: 'webcrawlpages',
  crawlPageDetail: 'webcrawlpagedetail',
  crawlVariantDetail: 'webcrawlvariantdetail',
  crawlMatchingLedger: 'webcrawlmatchledger'
} as const

export const STORAGE_CONTAINERS = {
  crawlArtefacts: 'crawl-artefacts'
} as const

export const STORAGE_QUEUES = {
  crawlRequests: 'crawl-requests',
  crawlRenderJobs: 'crawl-render-jobs',
  crawlTransformJobs: 'crawl-transform-jobs',
  publishJobs: 'publish-jobs'
} as const
