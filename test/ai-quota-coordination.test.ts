import { describe, expect, it } from 'vitest'
import {
  quotaConcurrencyLeaseSchema,
  quotaRateWindowSchema,
  quotaUnitsSchema
} from '../src/ai/quota-coordination.schema.js'

describe('quotaConcurrencyLeaseSchema', () => {
  it('accepts an active concurrency lease', () => {
    const parsed = quotaConcurrencyLeaseSchema.parse({
      quotaIdentityHash: 'quota-hash',
      callerAttemptKey: 'attempt-1',
      acquiredAt: '2026-09-06T00:00:00.000Z',
      leaseExpiresAt: '2026-09-06T00:05:00.000Z',
      state: 'active'
    })

    expect(parsed.state).toBe('active')
  })
})

describe('quotaRateWindowSchema', () => {
  it('accepts a fixed-window quota row', () => {
    const parsed = quotaRateWindowSchema.parse({
      quotaIdentityHash: 'quota-hash',
      windowStart: '2026-09-06T00:00:00.000Z',
      windowEnd: '2026-09-06T01:00:00.000Z',
      capacity: quotaUnitsSchema.parse({ requests: 10, tokens: 1000, images: 2 }),
      reserved: quotaUnitsSchema.parse({ requests: 1, tokens: 100, images: 1 }),
      consumed: quotaUnitsSchema.parse({ requests: 1, tokens: 80, images: 1 }),
      notBefore: '2026-09-06T00:10:00.000Z'
    })

    expect(parsed.capacity.requests).toBe(10)
    expect(parsed.consumed.tokens).toBe(80)
  })

  it('keeps concurrency leases separate from fixed-window rows', () => {
    const result = quotaRateWindowSchema.safeParse({
      quotaIdentityHash: 'quota-hash',
      callerAttemptKey: 'attempt-1',
      windowStart: '2026-09-06T00:00:00.000Z',
      windowEnd: '2026-09-06T01:00:00.000Z',
      capacity: { requests: 10, tokens: 1000, images: 2 },
      reserved: { requests: 1, tokens: 100, images: 1 },
      consumed: { requests: 1, tokens: 80, images: 1 }
    })

    expect(result.success).toBe(false)
  })
})