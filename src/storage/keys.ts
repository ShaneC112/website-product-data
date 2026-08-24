import { createHash } from 'crypto'

export function computeHash(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

export function buildCrawlProductDetailPartitionKey(sourceGroupKey: string): string {
  return computeHash(sourceGroupKey)
}

export function buildSourceGroupStorageKey(sourceGroupKey: string): string {
  return computeHash(sourceGroupKey)
}

export function escapeODataString(value: string): string {
  return value.replace(/'/g, "''")
}
