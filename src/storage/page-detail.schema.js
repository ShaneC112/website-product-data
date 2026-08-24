"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractedDetailBlobSchema = exports.rangeDetailSummarySchema = exports.pageDetailSummarySchema = exports.crawlPageDetailTableSchema = exports.extractedPatternEvidenceSchema = exports.extractedReviewModelSchema = exports.extractedReviewAdditionalAttributeSchema = exports.extractedReviewKnownAttributeSchema = exports.extractedVendorProductPageSchema = exports.extractedVendorVariantSchema = exports.extractedWidthSlotSchema = exports.extractedDynamicFieldSchema = exports.extractedDynamicFieldValueSchema = exports.extractedAdditionalAttributeSchema = exports.extractedDimensionSchema = exports.extractedPackInfoSchema = exports.extractedMeasurementSchema = exports.extractedScalarMeasurementSchema = exports.crawlProductDetailStatusSchema = exports.crawlPageRoleSchema = void 0;
exports.parseCrawlPageDetailTable = parseCrawlPageDetailTable;
exports.parsePageDetailSummary = parsePageDetailSummary;
exports.parseRangeDetailSummary = parseRangeDetailSummary;
exports.parseExtractedDetailBlob = parseExtractedDetailBlob;
exports.parseVendorProductPageBlob = parseVendorProductPageBlob;
exports.stringifyPageDetailSummary = stringifyPageDetailSummary;
exports.stringifyRangeDetailSummary = stringifyRangeDetailSummary;
exports.stringifyExtractedDetailBlob = stringifyExtractedDetailBlob;
exports.stringifyVendorProductPageBlob = stringifyVendorProductPageBlob;
const zod_1 = require("zod");
exports.crawlPageRoleSchema = zod_1.z.enum(['range', 'variant', 'single']);
exports.crawlProductDetailStatusSchema = zod_1.z.enum(['draft', 'ready']);
exports.extractedScalarMeasurementSchema = zod_1.z.object({
    value: zod_1.z.number(),
    unit: zod_1.z.string().trim().min(1)
});
exports.extractedMeasurementSchema = zod_1.z.object({
    label: zod_1.z.string().trim().min(1),
    value: zod_1.z.number(),
    unit: zod_1.z.string().trim().min(1)
});
exports.extractedPackInfoSchema = zod_1.z.object({
    length: exports.extractedScalarMeasurementSchema.optional(),
    width: exports.extractedScalarMeasurementSchema.optional(),
    height: exports.extractedScalarMeasurementSchema.optional(),
    coverage: exports.extractedScalarMeasurementSchema.optional(),
    piecesPerPack: zod_1.z.number().int().positive().optional()
});
exports.extractedDimensionSchema = zod_1.z.object({
    length: exports.extractedScalarMeasurementSchema.optional(),
    width: exports.extractedScalarMeasurementSchema.optional()
});
exports.extractedAdditionalAttributeSchema = zod_1.z.object({
    description: zod_1.z.string().trim().min(1),
    value: zod_1.z.string().trim().min(1)
});
exports.extractedDynamicFieldValueSchema = zod_1.z.union([
    zod_1.z.string(),
    zod_1.z.number(),
    zod_1.z.boolean(),
    zod_1.z.null(),
    exports.extractedScalarMeasurementSchema
]);
exports.extractedDynamicFieldSchema = zod_1.z.object({
    fieldName: zod_1.z.string().trim().min(1),
    value: exports.extractedDynamicFieldValueSchema
});
exports.extractedWidthSlotSchema = zod_1.z.object({
    widthLabel: zod_1.z.string().trim().min(1)
});
exports.extractedVendorVariantSchema = zod_1.z.object({
    variantId: zod_1.z.string().trim().min(1).optional(),
    label: zod_1.z.string().trim().min(1).optional(),
    url: zod_1.z.string().trim().min(1).optional(),
    colourName: zod_1.z.string().trim().min(1).optional(),
    swatchImageUrl: zod_1.z.string().trim().min(1).optional(),
    swatchHex: zod_1.z.string().trim().min(1).optional(),
    widths: zod_1.z.array(exports.extractedWidthSlotSchema).optional(),
    dynamicFields: zod_1.z.array(exports.extractedDynamicFieldSchema).optional(),
    features: zod_1.z.array(zod_1.z.string().trim().min(1)).optional(),
    specifications: zod_1.z.array(exports.extractedAdditionalAttributeSchema).optional(),
    suitability: zod_1.z.array(zod_1.z.string().trim().min(1)).optional()
});
exports.extractedVendorProductPageSchema = zod_1.z.object({
    url: zod_1.z.string().trim().min(1),
    pageRole: exports.crawlPageRoleSchema,
    rangeName: zod_1.z.string().trim().min(1).optional(),
    productType: zod_1.z.string().trim().min(1).optional(),
    brandName: zod_1.z.string().trim().min(1).optional(),
    description: zod_1.z.string().trim().min(1).optional(),
    features: zod_1.z.array(zod_1.z.string().trim().min(1)),
    specifications: zod_1.z.array(exports.extractedAdditionalAttributeSchema),
    widths: zod_1.z.array(exports.extractedWidthSlotSchema),
    dynamicFields: zod_1.z.array(exports.extractedDynamicFieldSchema),
    variants: zod_1.z.array(exports.extractedVendorVariantSchema)
});
exports.extractedReviewKnownAttributeSchema = zod_1.z.object({
    key: zod_1.z.string().trim().min(1),
    value: zod_1.z.unknown(),
    required: zod_1.z.boolean(),
    included: zod_1.z.boolean()
});
exports.extractedReviewAdditionalAttributeSchema = zod_1.z.object({
    description: zod_1.z.string().trim().min(1),
    value: zod_1.z.string().trim().min(1),
    included: zod_1.z.boolean()
});
exports.extractedReviewModelSchema = zod_1.z.object({
    knownSpecifications: zod_1.z.array(exports.extractedReviewKnownAttributeSchema),
    knownFeatures: zod_1.z.array(exports.extractedReviewKnownAttributeSchema),
    additionalSpecifications: zod_1.z.array(exports.extractedReviewAdditionalAttributeSchema),
    additionalFeatures: zod_1.z.array(exports.extractedReviewAdditionalAttributeSchema)
});
exports.extractedPatternEvidenceSchema = zod_1.z.object({
    horizontalRepeat: zod_1.z.string().trim().min(1).optional(),
    horizontalDrop: zod_1.z.string().trim().min(1).optional(),
    verticalRepeat: zod_1.z.string().trim().min(1).optional(),
    verticalDrop: zod_1.z.string().trim().min(1).optional()
});
exports.crawlPageDetailTableSchema = zod_1.z.object({
    partitionKey: zod_1.z.string().trim().min(1),
    rowKey: zod_1.z.string().trim().min(1),
    urlKey: zod_1.z.string().trim().min(1),
    sourceGroupKey: zod_1.z.string().trim().min(1),
    pageRole: exports.crawlPageRoleSchema,
    status: exports.crawlProductDetailStatusSchema,
    detailJson: zod_1.z.string().trim().min(1),
    extractedDetailBlobPath: zod_1.z.string().trim().min(1).optional(),
    vendorProductPageBlobPath: zod_1.z.string().trim().min(1).optional(),
    ttlExpiresAt: zod_1.z.string().trim().min(1).optional()
});
exports.pageDetailSummarySchema = zod_1.z.object({
    summaryType: zod_1.z.literal('page-detail-summary'),
    trade: zod_1.z.string().trim().min(1).optional(),
    promptVersion: zod_1.z.string().trim().min(1).optional(),
    styleCode: zod_1.z.string().trim().min(1).optional(),
    url: zod_1.z.string().trim().min(1),
    title: zod_1.z.string().trim().min(1).optional(),
    description: zod_1.z.string().optional(),
    productType: zod_1.z.string().trim().min(1).optional(),
    warnings: zod_1.z.array(zod_1.z.string().trim().min(1)).optional(),
    warningCount: zod_1.z.number().int().nonnegative(),
    contentHash: zod_1.z.string().trim().min(1).optional(),
    visibleTextLength: zod_1.z.number().int().nonnegative().optional(),
    pageRole: exports.crawlPageRoleSchema,
    status: exports.crawlProductDetailStatusSchema,
    hasVariantCoverage: zod_1.z.boolean(),
    variantCoverageSource: zod_1.z.string().trim().min(1)
});
exports.rangeDetailSummarySchema = zod_1.z.object({
    summaryType: zod_1.z.literal('range-detail-summary'),
    styleCode: zod_1.z.string().trim().min(1).optional(),
    url: zod_1.z.string().trim().min(1),
    contentHash: zod_1.z.string().trim().min(1).optional(),
    discoveredVariantCount: zod_1.z.number().int().nonnegative(),
    hasDiscoveredVariants: zod_1.z.boolean()
});
exports.extractedDetailBlobSchema = zod_1.z.object({
    styleCode: zod_1.z.string().trim().min(1).optional(),
    trade: zod_1.z.string().trim().min(1).optional(),
    promptVersion: zod_1.z.string().trim().min(1).optional(),
    url: zod_1.z.string().trim().min(1).optional(),
    title: zod_1.z.string().trim().min(1).optional(),
    description: zod_1.z.string().trim().min(1).optional(),
    productType: zod_1.z.string().trim().min(1).optional(),
    construction: zod_1.z.string().trim().min(1).optional(),
    pileFibreComposition: zod_1.z.string().trim().min(1).optional(),
    pileHeight: exports.extractedScalarMeasurementSchema.optional(),
    thickness: exports.extractedScalarMeasurementSchema.optional(),
    pileWeight: zod_1.z.string().trim().min(1).optional(),
    totalWeight: zod_1.z.string().trim().min(1).optional(),
    backing: zod_1.z.string().trim().min(1).optional(),
    gauge: zod_1.z.string().trim().min(1).optional(),
    stitchCount: zod_1.z.string().trim().min(1).optional(),
    width: zod_1.z.string().trim().min(1).optional(),
    totalHeight: exports.extractedScalarMeasurementSchema.optional(),
    fireRating: zod_1.z.string().trim().min(1).optional(),
    mothResistant: zod_1.z.boolean().optional(),
    stainResistant: zod_1.z.boolean().optional(),
    antiStatic: zod_1.z.boolean().optional(),
    suitabilityUfH: zod_1.z.boolean().optional(),
    features: zod_1.z.array(zod_1.z.string().trim().min(1)).optional(),
    patternEvidence: exports.extractedPatternEvidenceSchema.optional(),
    waterResistant: zod_1.z.boolean().optional(),
    packInfo: exports.extractedPackInfoSchema.optional(),
    dimensions: zod_1.z.array(exports.extractedDimensionSchema).optional(),
    look: zod_1.z.string().trim().min(1).optional(),
    additionalSpecifications: zod_1.z.array(exports.extractedAdditionalAttributeSchema).optional(),
    additionalFeatures: zod_1.z.array(exports.extractedAdditionalAttributeSchema).optional(),
    measurements: zod_1.z.array(exports.extractedMeasurementSchema).optional(),
    warnings: zod_1.z.array(zod_1.z.string().trim().min(1)).optional(),
    status: exports.crawlProductDetailStatusSchema.optional(),
    hasDiscoveredVariants: zod_1.z.boolean().optional(),
    discoveredVariantCount: zod_1.z.number().int().nonnegative().optional(),
    variantUrls: zod_1.z.array(zod_1.z.string().trim().min(1)).optional(),
    hasVariantCoverage: zod_1.z.boolean().optional(),
    variantCoverageSource: zod_1.z.string().trim().min(1).optional(),
    contentHash: zod_1.z.string().trim().min(1).optional(),
    visibleTextLength: zod_1.z.number().int().nonnegative().optional(),
    review: exports.extractedReviewModelSchema.optional(),
    vendorProductPage: exports.extractedVendorProductPageSchema.optional(),
    extractedDetailBlobPath: zod_1.z.string().trim().min(1).optional(),
    vendorProductPageBlobPath: zod_1.z.string().trim().min(1).optional()
});
function parseCrawlPageDetailTable(value) {
    return exports.crawlPageDetailTableSchema.parse(value);
}
function parsePageDetailSummary(value) {
    return exports.pageDetailSummarySchema.parse(JSON.parse(value));
}
function parseRangeDetailSummary(value) {
    return exports.rangeDetailSummarySchema.parse(JSON.parse(value));
}
function parseExtractedDetailBlob(value) {
    return exports.extractedDetailBlobSchema.parse(JSON.parse(value));
}
function parseVendorProductPageBlob(value) {
    return exports.extractedVendorProductPageSchema.parse(JSON.parse(value));
}
function stringifyPageDetailSummary(value) {
    return JSON.stringify(exports.pageDetailSummarySchema.parse(value));
}
function stringifyRangeDetailSummary(value) {
    return JSON.stringify(exports.rangeDetailSummarySchema.parse(value));
}
function stringifyExtractedDetailBlob(value) {
    return JSON.stringify(exports.extractedDetailBlobSchema.parse(value));
}
function stringifyVendorProductPageBlob(value) {
    return JSON.stringify(exports.extractedVendorProductPageSchema.parse(value));
}
