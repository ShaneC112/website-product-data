import {createHash} from 'node:crypto'
import type {SanityProductDraft} from './ingestion.js'

export type SourceFieldState = {_key: string; _type: 'sourceFieldState'; path: ManagedProductField; valueHash: string; valueJson: string; importedAt: string}
export type ImportConflict = {_key: string; _type: 'importConflict'; path: ManagedProductField; kind: 'editor_value_preserved' | 'source_value_removed'; currentValueJson: string; incomingValueJson: string; detectedAt: string; status: 'unresolved'}

export const SOURCE_MANAGED_FIELDS = [
  'name', 'slug', 'productType', 'brand', 'shortDescription', 'features', 'specs', 'suitableRooms',
  'price', 'priceOnRequest', 'variants', 'image', 'lifestyleImage', 'gallery',
] as const
export type ManagedProductField = (typeof SOURCE_MANAGED_FIELDS)[number]
type ExistingProduct = Partial<SanityProductDraft> & {importMeta?: Partial<SanityProductDraft['importMeta']> & {sourceFields?: SourceFieldState[]; conflicts?: ImportConflict[]}; [key: string]: unknown}
export type MergeProductUpdateResult = {document: SanityProductDraft & Record<string, unknown>; conflicts: ImportConflict[]}

export function mergeProductUpdate(existing: ExistingProduct, incoming: SanityProductDraft, importedAt: string): MergeProductUpdateResult {
  const merged = structuredClone(existing) as SanityProductDraft & Record<string, unknown>
  const previousStates = new Map((existing.importMeta?.sourceFields ?? []).map((state) => [state.path, state]))
  const sourceFields: SourceFieldState[] = []
  const conflicts: ImportConflict[] = []
  for (const path of SOURCE_MANAGED_FIELDS) {
    const incomingHasValue = Object.hasOwn(incoming, path) && incoming[path] !== undefined
    const currentValue = existing[path]
    const currentHasValue = currentValue !== undefined && currentValue !== null
    const incomingValue = incoming[path]
    const previousState = previousStates.get(path)
    if (!incomingHasValue) {
      if (currentHasValue) conflicts.push(buildConflict(path, 'source_value_removed', currentValue, undefined, importedAt))
      sourceFields.push(buildSourceState(path, undefined, importedAt))
      continue
    }
    const currentMatchesPreviousSource = previousState
      ? hashValue(currentValue) === previousState.valueHash
      : !currentHasValue || hashValue(currentValue) === hashValue(incomingValue)
    if (currentMatchesPreviousSource) merged[path] = structuredClone(incomingValue) as never
    else conflicts.push(buildConflict(path, 'editor_value_preserved', currentValue, incomingValue, importedAt))
    sourceFields.push(buildSourceState(path, incomingValue, importedAt))
  }
  merged._type = 'product'
  merged.importMeta = {
    ...existing.importMeta, ...incoming.importMeta,
    contentLocked: existing.importMeta?.contentLocked ?? incoming.importMeta.contentLocked,
    validationNotes: existing.importMeta?.validationNotes,
    sourceFields, conflicts,
  }
  return {document: merged, conflicts}
}

export function buildInitialSourceFields(document: SanityProductDraft, importedAt: string): SourceFieldState[] {
  return SOURCE_MANAGED_FIELDS.map((path) => buildSourceState(path, document[path], importedAt))
}

function buildSourceState(path: ManagedProductField, value: unknown, importedAt: string): SourceFieldState {
  return {_key: stableKey(path), _type: 'sourceFieldState', path, valueHash: hashValue(value), valueJson: serializeValue(value), importedAt}
}

function buildConflict(path: ManagedProductField, kind: ImportConflict['kind'], currentValue: unknown, incomingValue: unknown, detectedAt: string): ImportConflict {
  return {_key: `${stableKey(path)}-${stableKey(kind)}`, _type: 'importConflict', path, kind,
    currentValueJson: serializeValue(currentValue), incomingValueJson: serializeValue(incomingValue), detectedAt, status: 'unresolved'}
}

function hashValue(value: unknown): string {
  return createHash('sha256').update(serializeValue(value)).digest('hex')
}
function serializeValue(value: unknown): string {
  return JSON.stringify(value === undefined ? null : value)
}
function stableKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-|-$/g, '').slice(0, 96)
}