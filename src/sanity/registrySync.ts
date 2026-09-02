import {fieldRegistry, isRegistryFieldMappedToSanity, type FieldCategory, type FieldRegistryEntry, type FieldValueType} from '../registry/field-registry.js'

export const SANITY_REGISTRY_FIELD_TYPE = 'registryFieldDefinition'
export const SANITY_REGISTRY_MANAGED_BY = 'website-product-data'

export type SanityRegistryFieldDefinition = {
  _id: string
  _type: typeof SANITY_REGISTRY_FIELD_TYPE
  registryKey: string
  key: string
  label: string
  trade: string
  category: FieldCategory
  description: string
  valueType: FieldValueType
  requiredLevel: FieldRegistryEntry['requiredLevel']
  applicableTo: FieldRegistryEntry['applicableTo']
  publishable: boolean
  active: boolean
  managedBy: typeof SANITY_REGISTRY_MANAGED_BY
}

export type RegistrySyncChange = {
  action: 'create' | 'update' | 'deactivate'
  registryKey: string
  label: string
}

export type RegistrySyncPlan = {
  creates: SanityRegistryFieldDefinition[]
  updates: SanityRegistryFieldDefinition[]
  deactivations: SanityRegistryFieldDefinition[]
  changes: RegistrySyncChange[]
}

export function buildSanityRegistryFieldDefinitions(entries: readonly FieldRegistryEntry[] = fieldRegistry): SanityRegistryFieldDefinition[] {
  return entries.filter((entry) => !isRegistryFieldMappedToSanity(entry.field)).map((entry) => {
    const registryKey = `${entry.trade}:${entry.field}`
    return {
      _id: `registry-field-${stableId(registryKey)}`,
      _type: SANITY_REGISTRY_FIELD_TYPE,
      registryKey,
      key: entry.field,
      label: entry.label,
      trade: entry.trade,
      category: entry.category,
      description: entry.description,
      valueType: entry.valueType,
      requiredLevel: entry.requiredLevel,
      applicableTo: entry.applicableTo,
      publishable: entry.publishable,
      active: true,
      managedBy: SANITY_REGISTRY_MANAGED_BY,
    }
  })
}

export function planSanityRegistryFieldSync(
  existing: readonly SanityRegistryFieldDefinition[],
  desired: readonly SanityRegistryFieldDefinition[] = buildSanityRegistryFieldDefinitions(),
): RegistrySyncPlan {
  const existingByRegistryKey = new Map(existing.map((entry) => [entry.registryKey, entry]))
  const desiredKeys = new Set(desired.map((entry) => entry.registryKey))
  const creates: SanityRegistryFieldDefinition[] = []
  const updates: SanityRegistryFieldDefinition[] = []
  const deactivations: SanityRegistryFieldDefinition[] = []

  for (const entry of desired) {
    const current = existingByRegistryKey.get(entry.registryKey)
    if (!current) creates.push(entry)
    else if (!areEquivalent(current, entry)) updates.push({...entry, _id: current._id})
  }

  for (const entry of existing) {
    if (!desiredKeys.has(entry.registryKey) && entry.active) {
      deactivations.push({...entry, active: false})
    }
  }

  return {
    creates,
    updates,
    deactivations,
    changes: [
      ...creates.map((entry) => ({action: 'create' as const, registryKey: entry.registryKey, label: entry.label})),
      ...updates.map((entry) => ({action: 'update' as const, registryKey: entry.registryKey, label: entry.label})),
      ...deactivations.map((entry) => ({action: 'deactivate' as const, registryKey: entry.registryKey, label: entry.label})),
    ],
  }
}

function areEquivalent(left: SanityRegistryFieldDefinition, right: SanityRegistryFieldDefinition): boolean {
  return left._type === right._type
    && left.registryKey === right.registryKey
    && left.key === right.key
    && left.label === right.label
    && left.trade === right.trade
    && left.category === right.category
    && left.description === right.description
    && left.valueType === right.valueType
    && left.requiredLevel === right.requiredLevel
    && left.applicableTo.length === right.applicableTo.length
    && left.applicableTo.every((value, index) => value === right.applicableTo[index])
    && left.publishable === right.publishable
    && left.active === right.active
    && left.managedBy === right.managedBy
}

function stableId(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}