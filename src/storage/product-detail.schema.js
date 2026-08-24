"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.composedProductDetailBlobSchema = exports.productDetailSummarySchema = exports.compactVendorProductPageSchema = exports.composedProductSourceSchema = exports.composedProductSummarySchema = exports.crawlProductDetailTableSchema = void 0;
exports.parseCrawlProductDetailTable = parseCrawlProductDetailTable;
exports.parseProductDetailSummary = parseProductDetailSummary;
exports.parseComposedProductDetailBlob = parseComposedProductDetailBlob;
exports.stringifyProductDetailSummary = stringifyProductDetailSummary;
exports.stringifyComposedProductDetailBlob = stringifyComposedProductDetailBlob;
const zod_1 = require("zod");
const page_detail_schema_1 = require("./page-detail.schema");
exports.crawlProductDetailTableSchema = zod_1.z.object({
    partitionKey: zod_1.z.string().trim().min(1),
    rowKey: zod_1.z.string().trim().min(1),
    urlKey: zod_1.z.string().trim().min(1).optional(),
    sourceGroupKey: zod_1.z.string().trim().min(1).optional(),
    sourceGroupStorageKey: zod_1.z.string().trim().min(1).optional(),
    sourceTableName: zod_1.z.string().trim().min(1).optional(),
    sourceRowKey: zod_1.z.string().trim().min(1).optional(),
    vendorSku: zod_1.z.string().trim().min(1).optional(),
    rawPriceMinor: zod_1.z.number().optional(),
    vatRate: zod_1.z.number().optional(),
    styleCode: zod_1.z.string().trim().min(1).optional(),
    trade: zod_1.z.string().trim().min(1).optional(),
    status: page_detail_schema_1.crawlProductDetailStatusSchema.optional(),
    detailJson: zod_1.z.string().trim().min(1).optional(),
    detailBlobPath: zod_1.z.string().trim().min(1).optional(),
    composedBlobPath: zod_1.z.string().trim().min(1).optional(),
    publishedAt: zod_1.z.string().trim().min(1).optional(),
    updatedAt: zod_1.z.string().trim().min(1).optional(),
    createdAt: zod_1.z.string().trim().min(1).optional(),
    promptVersion: zod_1.z.string().trim().min(1).optional()
});
exports.composedProductSummarySchema = zod_1.z.object({
    url: zod_1.z.string().trim().min(1),
    pageRole: page_detail_schema_1.crawlPageRoleSchema,
    contentHash: zod_1.z.string().trim().min(1).optional(),
    visibleTextLength: zod_1.z.number().int().nonnegative(),
    renderedAt: zod_1.z.string().trim().min(1)
});
exports.composedProductSourceSchema = zod_1.z.object({
    styleCode: zod_1.z.string().trim().min(1).optional()
});
exports.compactVendorProductPageSchema = zod_1.z.object({
    url: zod_1.z.string().trim().min(1),
    pageRole: page_detail_schema_1.crawlPageRoleSchema,
    rangeName: zod_1.z.string().trim().min(1).optional(),
    productType: zod_1.z.string().trim().min(1).optional(),
    brandName: zod_1.z.string().trim().min(1).optional(),
    widths: zod_1.z.array(page_detail_schema_1.extractedWidthSlotSchema),
    variantCount: zod_1.z.number().int().nonnegative()
});
exports.productDetailSummarySchema = zod_1.z.object({
    summaryType: zod_1.z.literal('product-detail-summary'),
    summary: exports.composedProductSummarySchema,
    source: exports.composedProductSourceSchema,
    extracted: zod_1.z.object({
        styleCode: zod_1.z.string().trim().min(1).optional(),
        trade: zod_1.z.string().optional(),
        promptVersion: zod_1.z.string().trim().min(1).optional(),
        url: zod_1.z.string().trim().min(1).optional(),
        title: zod_1.z.string().trim().min(1).optional(),
        description: zod_1.z.string().optional(),
        productType: zod_1.z.string().trim().min(1).optional(),
        warnings: zod_1.z.array(zod_1.z.string().trim().min(1)).optional(),
        status: page_detail_schema_1.crawlProductDetailStatusSchema.optional(),
        hasDiscoveredVariants: zod_1.z.boolean().optional(),
        discoveredVariantCount: zod_1.z.number().int().nonnegative().optional(),
        hasVariantCoverage: zod_1.z.boolean().optional(),
        variantCoverageSource: zod_1.z.string().trim().min(1).optional(),
        contentHash: zod_1.z.string().trim().min(1).optional(),
        visibleTextLength: zod_1.z.number().int().nonnegative().optional(),
        warningCount: zod_1.z.number().int().nonnegative(),
        extractedDetailBlobPath: zod_1.z.string().trim().min(1).optional(),
        vendorProductPageBlobPath: zod_1.z.string().trim().min(1).optional(),
        vendorProductPage: exports.compactVendorProductPageSchema.optional()
    }),
    review: zod_1.z.object({
        knownSpecificationKeys: zod_1.z.array(zod_1.z.string().trim().min(1)),
        knownFeatureKeys: zod_1.z.array(zod_1.z.string().trim().min(1)),
        additionalSpecificationCount: zod_1.z.number().int().nonnegative(),
        additionalFeatureCount: zod_1.z.number().int().nonnegative()
    }),
    composition: zod_1.z.object({
        readinessReasons: zod_1.z.array(zod_1.z.string().trim().min(1)),
        hasExtractedDetail: zod_1.z.boolean()
    })
});
exports.composedProductDetailBlobSchema = zod_1.z.object({
    summary: exports.composedProductSummarySchema,
    source: exports.composedProductSourceSchema,
    extracted: page_detail_schema_1.extractedDetailBlobSchema.extend({
        trade: zod_1.z.string().optional()
    }),
    review: page_detail_schema_1.extractedReviewModelSchema,
    composition: zod_1.z.object({
        readinessReasons: zod_1.z.array(zod_1.z.string().trim().min(1)),
        hasExtractedDetail: zod_1.z.boolean()
    })
});
function parseCrawlProductDetailTable(value) {
    return exports.crawlProductDetailTableSchema.parse(value);
}
function parseProductDetailSummary(value) {
    return exports.productDetailSummarySchema.parse(JSON.parse(value));
}
function parseComposedProductDetailBlob(value) {
    return exports.composedProductDetailBlobSchema.parse(JSON.parse(value));
}
function stringifyProductDetailSummary(value) {
    return JSON.stringify(exports.productDetailSummarySchema.parse(value));
}
function stringifyComposedProductDetailBlob(value) {
    return JSON.stringify(exports.composedProductDetailBlobSchema.parse(value));
}
