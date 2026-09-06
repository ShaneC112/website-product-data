import { z } from 'zod'

export const quotaUnitsSchema = z.object({
  requests: z.number().int().nonnegative().default(0),
  tokens: z.number().int().nonnegative().default(0),
  images: z.number().int().nonnegative().default(0)
}).strict()

export const quotaConcurrencyLeaseSchema = z.object({
  quotaIdentityHash: z.string().trim().min(1),
  callerAttemptKey: z.string().trim().min(1),
  acquiredAt: z.string().datetime(),
  leaseExpiresAt: z.string().datetime(),
  state: z.enum(['active', 'released', 'expired'])
}).strict()

export const quotaRateWindowSchema = z.object({
  quotaIdentityHash: z.string().trim().min(1),
  windowStart: z.string().datetime(),
  windowEnd: z.string().datetime(),
  capacity: quotaUnitsSchema,
  reserved: quotaUnitsSchema,
  consumed: quotaUnitsSchema,
  notBefore: z.string().datetime().optional()
}).strict()