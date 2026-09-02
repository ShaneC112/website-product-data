import {createHash} from 'node:crypto'
import type {SanityProductDraft} from './ingestion.js'

export type SourceFieldState = {_key: string; _type: 'sourceFieldState'; path: string; valueHash: string; valueJson: string; importedAt: string}
export type ConflictStatus = 'unresolved' | 'accepted_source' | 'kept_editorial'
export type ImportConflict = {
  _key: string
  _type: 'importConflict'
  path: string
  kind: 'editor_value_preserved' | 'source_value_removed'
  currentValueJson: string
  incomingValueJson: string
  detectedAt: string
  status: ConflictStatus
}

// Genuinely top-level, non-array fields - a single whole-value hash is enough since there is no
// finer sub-structure a manual edit could partially diverge from. `features`/`specs` (per-entry
// `key`) and `variants` (per (variantId, field)) are tracked at finer granularity below instead.
export const SOURCE_MANAGED_FIELDS = [
  'name', 'slug', 'productType', 'categoryKey', 'brand', 'shortDescription', 'suitableRooms',
  'price', 'priceOnRequest', 'packPrice', 'packInfo', 'patternRepeatCm', 'repeatsInSwatch',
  'widths', 'image', 'lifestyleImage', 'gallery',
] as const
export type ManagedProductField = (typeof SOURCE_MANAGED_FIELDS)[number]

// Fields inside a single variant tracked at (variantId, field) granularity - a manual edit to one
// must not block sync of any other field on that variant, another variant, or variant add/remove.
// vendorSku/sourceUrl/primaryImage/images are pipeline-owned (always reflect the latest crawl) and
// have no editorial-preserve concept, so they are intentionally excluded from this list.
const VARIANT_MANAGED_FIELDS = [
  'colourName', 'hex', 'colourFamily', 'overrides', 'widths', 'price', 'packPrice', 'packInfo',
  'patternRepeatCm', 'repeatsInSwatch', 'swatchImage', 'suitableRooms', 'specs',
] as const

type Variant = SanityProductDraft['variants'][number]

type ExistingProduct = Partial<SanityProductDraft> & {
  importMeta?: Partial<SanityProductDraft['importMeta']> & {sourceFields?: SourceFieldState[]; conflicts?: ImportConflict[]}
  [key: string]: unknown
}
export type MergeProductUpdateResult = {document: SanityProductDraft & Record<string, unknown>; conflicts: ImportConflict[]}

export function mergeProductUpdate(existing: ExistingProduct, incoming: SanityProductDraft, importedAt: string): MergeProductUpdateResult {
  const merged = structuredClone(existing) as SanityProductDraft & Record<string, unknown>
  const previousStates = new Map((existing.importMeta?.sourceFields ?? []).map((state) => [state.path, state]))
  const priorConflicts = new Map((existing.importMeta?.conflicts ?? []).map((conflict) => [conflict.path, conflict]))
  const sourceFields: SourceFieldState[] = []
  const conflicts: ImportConflict[] = []

  for (const path of SOURCE_MANAGED_FIELDS) {
    const incomingHasValue = Object.hasOwn(incoming, path) && incoming[path] !== undefined
    const resolution = resolveField(path, existing[path], incomingHasValue, incoming[path], previousStates.get(path), priorConflicts.get(path), importedAt)
    merged[path] = resolution.value as never
    sourceFields.push(buildSourceState(path, resolution.sourceValue, importedAt))
    if (resolution.conflict) conflicts.push(resolution.conflict)
  }

  merged.features = mergeKeyedList('features', existing.features ?? [], incoming.features, (entry) => entry.key, previousStates, priorConflicts, sourceFields, conflicts, importedAt)
  merged.specs = mergeKeyedList('specs', existing.specs ?? [], incoming.specs, (entry) => entry.key, previousStates, priorConflicts, sourceFields, conflicts, importedAt)
  merged.variants = mergeVariants(existing.variants ?? [], incoming.variants, previousStates, priorConflicts, sourceFields, conflicts, importedAt)

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
  const states: SourceFieldState[] = SOURCE_MANAGED_FIELDS.map((path) => buildSourceState(path, document[path], importedAt))
  for (const feature of document.features) states.push(buildSourceState(buildKeyedPath('features', feature.key), feature, importedAt))
  for (const spec of document.specs) states.push(buildSourceState(buildKeyedPath('specs', spec.key), spec, importedAt))
  for (const variant of document.variants) {
    for (const field of VARIANT_MANAGED_FIELDS) states.push(buildSourceState(buildVariantPath(variant.variantId, field), variant[field], importedAt))
  }
  return states
}

type FieldResolution = {value: unknown; sourceValue: unknown; conflict?: ImportConflict}

// Shared per-key diff: honours a prior `accepted_source`/`kept_editorial` resolution before
// falling back to the standard "preserve editor value, flag divergence" behaviour.
function resolveField(
  key: string,
  currentValue: unknown,
  incomingHasValue: boolean,
  incomingValue: unknown,
  previousState: SourceFieldState | undefined,
  priorConflict: ImportConflict | undefined,
  importedAt: string,
): FieldResolution {
  if (priorConflict?.status === 'accepted_source') {
    const resolvedIncoming = incomingHasValue ? incomingValue : undefined
    return {value: resolvedIncoming, sourceValue: resolvedIncoming}
  }
  // Pinned until the editor's own value changes again: the resolved conflict record itself is kept
  // (refreshed with the latest incoming snapshot) so a future run can still find and honour it - the
  // source-field baseline keeps tracking real incoming drift underneath so a later editor edit falls
  // straight back through to the standard divergence check below instead of comparing against a
  // stale, frozen baseline.
  if (priorConflict?.status === 'kept_editorial' && serializeValue(currentValue) === priorConflict.currentValueJson) {
    const resolvedIncoming = incomingHasValue ? incomingValue : undefined
    return {
      value: currentValue,
      sourceValue: resolvedIncoming,
      conflict: {...priorConflict, incomingValueJson: serializeValue(resolvedIncoming), detectedAt: importedAt},
    }
  }

  const currentHasValue = currentValue !== undefined && currentValue !== null
  if (!incomingHasValue) {
    const conflict = currentHasValue ? buildConflict(key, 'source_value_removed', currentValue, undefined, importedAt) : undefined
    return {value: currentValue, sourceValue: undefined, conflict}
  }

  const currentMatchesPreviousSource = previousState
    ? hashValue(currentValue) === previousState.valueHash
    : !currentHasValue || hashValue(currentValue) === hashValue(incomingValue)

  if (currentMatchesPreviousSource) return {value: incomingValue, sourceValue: incomingValue}
  return {value: currentValue, sourceValue: incomingValue, conflict: buildConflict(key, 'editor_value_preserved', currentValue, incomingValue, importedAt)}
}

// Add/remove follows the incoming list for entries the source previously supplied (matched via a
// prior sourceFieldState under this prefix); entries an editor added that were never sourced have
// no recorded baseline and are left alone even if the incoming list doesn't include them.
function mergeKeyedList<T>(
  prefix: string,
  existingList: T[],
  incomingList: T[],
  idOf: (entry: T) => string,
  previousStates: Map<string, SourceFieldState>,
  priorConflicts: Map<string, ImportConflict>,
  sourceFields: SourceFieldState[],
  conflicts: ImportConflict[],
  importedAt: string,
): T[] {
  const incomingById = new Map(incomingList.map((entry) => [idOf(entry), entry]))
  const existingIds = new Set(existingList.map(idOf))
  const previouslySourced = previouslySourcedIds(previousStates, prefix)
  const merged: T[] = []

  for (const entry of existingList) {
    const id = idOf(entry)
    const key = buildKeyedPath(prefix, id)
    const incomingEntry = incomingById.get(id)
    if (!incomingEntry) {
      if (!previouslySourced.has(id)) merged.push(entry)
      continue
    }
    const resolution = resolveField(key, entry, true, incomingEntry, previousStates.get(key), priorConflicts.get(key), importedAt)
    merged.push(resolution.value as T)
    sourceFields.push(buildSourceState(key, resolution.sourceValue, importedAt))
    if (resolution.conflict) conflicts.push(resolution.conflict)
  }
  for (const entry of incomingList) {
    const id = idOf(entry)
    if (existingIds.has(id)) continue
    merged.push(structuredClone(entry))
    sourceFields.push(buildSourceState(buildKeyedPath(prefix, id), entry, importedAt))
  }
  return merged
}

function mergeVariants(
  existingList: Variant[],
  incomingList: Variant[],
  previousStates: Map<string, SourceFieldState>,
  priorConflicts: Map<string, ImportConflict>,
  sourceFields: SourceFieldState[],
  conflicts: ImportConflict[],
  importedAt: string,
): Variant[] {
  const incomingById = new Map(incomingList.map((variant) => [variant.variantId, variant]))
  const existingIds = new Set(existingList.map((variant) => variant.variantId))
  const previouslySourced = previouslySourcedIds(previousStates, 'variants')
  const merged: Variant[] = []

  for (const existingVariant of existingList) {
    const variantId = existingVariant.variantId
    const incomingVariant = incomingById.get(variantId)
    if (!incomingVariant) {
      // Missing from this crawl: drop it if the source previously supplied it (removed on the
      // vendor site), otherwise it's editor-added and never source-managed - keep it.
      if (!previouslySourced.has(variantId)) merged.push(existingVariant)
      continue
    }
    merged.push(mergeVariantFields(existingVariant, incomingVariant, previousStates, priorConflicts, sourceFields, conflicts, importedAt))
  }
  for (const incomingVariant of incomingList) {
    if (existingIds.has(incomingVariant.variantId)) continue
    merged.push(structuredClone(incomingVariant))
    for (const field of VARIANT_MANAGED_FIELDS) {
      sourceFields.push(buildSourceState(buildVariantPath(incomingVariant.variantId, field), incomingVariant[field], importedAt))
    }
  }
  return merged
}

function mergeVariantFields(
  existingVariant: Variant,
  incomingVariant: Variant,
  previousStates: Map<string, SourceFieldState>,
  priorConflicts: Map<string, ImportConflict>,
  sourceFields: SourceFieldState[],
  conflicts: ImportConflict[],
  importedAt: string,
): Variant {
  const merged = structuredClone(existingVariant) as Variant & Record<string, unknown>
  for (const field of VARIANT_MANAGED_FIELDS) {
    const key = buildVariantPath(existingVariant.variantId, field)
    const incomingHasValue = Object.hasOwn(incomingVariant, field) && incomingVariant[field] !== undefined
    const resolution = resolveField(key, existingVariant[field], incomingHasValue, incomingVariant[field], previousStates.get(key), priorConflicts.get(key), importedAt)
    merged[field] = resolution.value as never
    sourceFields.push(buildSourceState(key, resolution.sourceValue, importedAt))
    if (resolution.conflict) conflicts.push(resolution.conflict)
  }
  // Identity/pipeline-owned fields outside the managed list always reflect the latest crawl - no
  // editorial-preserve concept applies to them.
  merged.vendorSku = incomingVariant.vendorSku
  merged.sourceUrl = incomingVariant.sourceUrl
  merged.primaryImage = incomingVariant.primaryImage
  merged.images = incomingVariant.images
  return merged
}

function previouslySourcedIds(previousStates: Map<string, SourceFieldState>, prefix: string): Set<string> {
  const marker = `${prefix}.`
  const ids = new Set<string>()
  for (const key of previousStates.keys()) {
    if (!key.startsWith(marker)) continue
    ids.add(decodeURIComponent(key.slice(marker.length).split('.')[0]))
  }
  return ids
}

function buildKeyedPath(prefix: string, id: string): string {
  return `${prefix}.${encodePathSegment(id)}`
}

function buildVariantPath(variantId: string, field: string): string {
  return `${buildKeyedPath('variants', variantId)}.${field}`
}

function encodePathSegment(value: string): string {
  return encodeURIComponent(value).replace(/\./g, '%2E')
}

function buildSourceState(path: string, value: unknown, importedAt: string): SourceFieldState {
  return {_key: stableKey(path), _type: 'sourceFieldState', path, valueHash: hashValue(value), valueJson: serializeValue(value), importedAt}
}

function buildConflict(path: string, kind: ImportConflict['kind'], currentValue: unknown, incomingValue: unknown, detectedAt: string): ImportConflict {
  return {
    _key: `${stableKey(path)}-${stableKey(kind)}`, _type: 'importConflict', path, kind,
    currentValueJson: serializeValue(currentValue), incomingValueJson: serializeValue(incomingValue), detectedAt, status: 'unresolved',
  }
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