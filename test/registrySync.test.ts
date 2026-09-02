import {describe, expect, it} from 'vitest'
import {
  SANITY_REGISTRY_MANAGED_BY,
  buildSanityRegistryFieldDefinitions,
  planSanityRegistryFieldSync,
} from '../src/sanity/registrySync.js'
import {registryFieldLabel} from '../src/registry/field-registry.js'

describe('Sanity registry field synchronization', () => {
  it('turns the shared registry into active managed field definitions with canonical labels', () => {
    const definitions = buildSanityRegistryFieldDefinitions()
    const pileWeight = definitions.find((entry) => entry.registryKey === 'Carpet:pileWeight')

    expect(pileWeight).toMatchObject({
      _id: 'registry-field-carpet-pileweight',
      key: 'pileWeight',
      label: 'Pile Weight',
      managedBy: SANITY_REGISTRY_MANAGED_BY,
      active: true,
    })
    expect(registryFieldLabel('suitabilityUfH')).toBe('Suitability Uf H')
  })

  it('omits fields with a direct Sanity destination but retains unmapped dimensions', () => {
    const definitions = buildSanityRegistryFieldDefinitions()

    expect(definitions).not.toEqual(expect.arrayContaining([
      expect.objectContaining({key: 'title'}),
      expect.objectContaining({key: 'description'}),
      expect.objectContaining({key: 'productType'}),
      expect.objectContaining({key: 'width'}),
      expect.objectContaining({key: 'suitableRooms'}),
      expect.objectContaining({key: 'packInfo'}),
    ]))
    expect(definitions).toEqual(expect.arrayContaining([
      expect.objectContaining({registryKey: 'Laminate:dimensions'}),
    ]))
  })

  it('plans creates, updates, and non-destructive deactivations', () => {
    const desired = buildSanityRegistryFieldDefinitions().slice(0, 1)
    const existing = [
      {...desired[0], label: 'Old label'},
      {...desired[0], _id: 'registry-field-retired', registryKey: 'Carpet:retired', key: 'retired', label: 'Retired'},
    ]

    const plan = planSanityRegistryFieldSync(existing, desired)

    expect(plan.updates).toHaveLength(1)
    expect(plan.deactivations).toEqual([expect.objectContaining({registryKey: 'Carpet:retired', active: false})])
    expect(plan.creates).toEqual([])
  })

  it('does not update a semantically equal definition returned in a different property order', () => {
    const [desired] = buildSanityRegistryFieldDefinitions()
    const stored = {
      _id: desired._id,
      _type: desired._type,
      active: desired.active,
      applicableTo: desired.applicableTo,
      category: desired.category,
      description: desired.description,
      key: desired.key,
      label: desired.label,
      managedBy: desired.managedBy,
      publishable: desired.publishable,
      registryKey: desired.registryKey,
      requiredLevel: desired.requiredLevel,
      trade: desired.trade,
      valueType: desired.valueType,
    }

    const plan = planSanityRegistryFieldSync([stored], [desired])

    expect(plan.changes).toEqual([])
  })
})