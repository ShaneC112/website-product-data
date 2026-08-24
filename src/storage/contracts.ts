export type CrawlGroupState = 'draft' | 'ready' | 'trade_unmapped' | 'ai_field_missing' | 'swatch_missing'

export type CrawlGroupStateRow = {
  partitionKey: string
  rowKey: string
  sourceGroupKey: string
  state: CrawlGroupState
  pageCount: number
  detailCount: number
  readinessReasonsJson?: string
  ttlExpiresAt?: string
}

export type CrawlRunSummaryRow = {
  partitionKey: string
  rowKey: string
  runId: string
  sourceGroupKey?: string
  urlKey?: string
  styleCode?: string
  sourceTableName?: string
  status?: string
  requestedAt?: string
  renderStartedAt?: string
  renderCompletedAt?: string
  extractStartedAt?: string
  extractCompletedAt?: string
  transformStartedAt?: string
  transformCompletedAt?: string
  publishStartedAt?: string
  publishCompletedAt?: string
  aiCallCount?: number
  aiTotalTokens?: number
  aiEstimatedCost?: number
  warningCount?: number
}

export type CrawlValidationRow = {
  partitionKey: string
  rowKey: string
  sourceGroupKey?: string
  sourceTableName: string
  sourceRowKey: string
  styleCode?: string
  trade?: string
  crawlUrl?: string
  errorsJson: string
  firstSeenAt: string
  lastSeenAt: string
  resolvedAt?: string
}

export type CrawlProductDetailStatus = 'draft' | 'ready'

export type CrawlProductDetailRow = {
  partitionKey: string
  rowKey: string
  urlKey?: string
  sourceGroupKey?: string
  sourceGroupStorageKey?: string
  sourceTableName?: string
  sourceRowKey?: string
  vendorSku?: string
  rawPriceMinor?: number
  vatRate?: number
  styleCode?: string
  trade?: string
  status?: CrawlProductDetailStatus
  detailJson?: string
  detailBlobPath?: string
  composedBlobPath?: string
  publishedAt?: string
  updatedAt?: string
  createdAt?: string
  promptVersion?: string
}

export type CrawlUrlLinkRow = {
  partitionKey: string
  rowKey: string
  urlStorageKey: string
  sourceGroupStorageKey: string
  sourceGroupKey: string
  urlKey: string
  styleCode?: string
  trade?: string
  sourceTableName: string
  sourceRowKey: string
  vendorSku?: string
  crawlUrl?: string
}

export type CrawlPageRole = 'range' | 'variant' | 'single'

export type CrawlPageRow = {
  partitionKey: string
  rowKey: string
  url: string
  urlKey: string
  sourceTableName?: string
  styleCode?: string
  trade?: string
  sourceGroupKey?: string
  pageRole?: CrawlPageRole
  rootDomain?: string
  variantUrlsJson?: string
  linkedProductCount?: number
  contentHash?: string
  status?: string
  blobHtmlPath?: string
  blobScreenshotPath?: string
  blobElementsJsonPath?: string
  blobCaptureManifestPath?: string
  blobVendorStatePath?: string
  visibleTextLength?: number
  ttlExpiresAt?: string
  etag?: string
  rawPriceMinor?: number
  vatRate?: number
  vendorSku?: string
  sourceRowKey?: string
}

export type CrawlPageDetailRow = {
  partitionKey: string
  rowKey: string
  urlKey: string
  sourceGroupKey: string
  pageRole: CrawlPageRole
  status: CrawlProductDetailStatus
  detailJson: string
  extractedDetailBlobPath?: string
  vendorProductPageBlobPath?: string
  ttlExpiresAt?: string
}

export type CrawlMatchingLedgerRow = {
  partitionKey: string
  rowKey: string
  sourceGroupKey: string
  sourceGroupStorageKey?: string
  parentUrlKey: string
  variantRowKey: string
  variantId?: string
  variantUrl?: string
  variantLabel?: string
  colourName?: string
  swatchImageUrl?: string
  swatchHex?: string
  matchedProductRowKey?: string
  matchedSourceRowKey?: string
  matchedSourceTableName?: string
  matchMethod: 'exact_url' | 'colour_hint' | 'unmatched'
  matchConfidence: number
  approvalState: 'pending' | 'approved' | 'rejected' | 'not_required'
  proposalSource: 'publish_preflight'
  detailJson: string
  updatedAt: string
  ttlExpiresAt?: string
}
