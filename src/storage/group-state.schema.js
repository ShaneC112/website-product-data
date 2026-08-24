"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crawlGroupStateTableSchema = exports.crawlGroupReadinessReasonsSchema = exports.crawlGroupStateSchema = void 0;
exports.parseCrawlGroupStateTable = parseCrawlGroupStateTable;
exports.parseCrawlGroupReadinessReasons = parseCrawlGroupReadinessReasons;
exports.stringifyCrawlGroupReadinessReasons = stringifyCrawlGroupReadinessReasons;
const zod_1 = require("zod");
exports.crawlGroupStateSchema = zod_1.z.enum([
    'draft',
    'ready',
    'trade_unmapped',
    'ai_field_missing',
    'swatch_missing'
]);
exports.crawlGroupReadinessReasonsSchema = zod_1.z.array(zod_1.z.string().trim().min(1));
exports.crawlGroupStateTableSchema = zod_1.z.object({
    partitionKey: zod_1.z.string().trim().min(1),
    rowKey: zod_1.z.string().trim().min(1),
    sourceGroupKey: zod_1.z.string().trim().min(1),
    state: exports.crawlGroupStateSchema,
    pageCount: zod_1.z.number().int().nonnegative(),
    detailCount: zod_1.z.number().int().nonnegative(),
    readinessReasonsJson: zod_1.z.string().trim().min(1).optional(),
    ttlExpiresAt: zod_1.z.string().trim().min(1).optional()
});
function parseCrawlGroupStateTable(value) {
    return exports.crawlGroupStateTableSchema.parse(value);
}
function parseCrawlGroupReadinessReasons(value) {
    return exports.crawlGroupReadinessReasonsSchema.parse(JSON.parse(value));
}
function stringifyCrawlGroupReadinessReasons(value) {
    return JSON.stringify(exports.crawlGroupReadinessReasonsSchema.parse(value));
}
