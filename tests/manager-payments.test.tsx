import { describe, it, expect, vi, beforeEach } from 'vitest'

// Create the mock object inside the factory to avoid hoisting issues
vi.mock('@/db', () => {
  const mockDb = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    transaction: vi.fn((cb) => cb(mockDb)),
  }
  return { db: mockDb }
})

// Import the mocked module
import { db } from '@/db'
import {
  getPaymentMap,
  updatePaymentStatus
} from '@/app/actions/payments'
import { payments, apartments } from '@/db/schema'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('Manager Payment Actions', () => {
  const buildingId = 'build-1'
  const year = 2024

  beforeEach(() => {
    vi.clearAllMocks()

    // Cast to any to access mock methods
    const mockDb = db as any

    // Reset defaults to return 'this' for chaining
    mockDb.select.mockReturnThis()
    mockDb.from.mockReturnThis()
    mockDb.where.mockReturnThis()
    mockDb.limit.mockReturnThis()
    mockDb.orderBy.mockReturnThis()
    mockDb.innerJoin.mockReturnThis()
    mockDb.insert.mockReturnThis()
    mockDb.values.mockReturnThis()
    mockDb.update.mockReturnThis()
    mockDb.set.mockReturnThis()
  })

  describe('getPaymentMap', () => {
    it('should return empty list if no buildingId', async () => {
      const result = await getPaymentMap('', year)
      expect(result).toEqual([])
    })

    it('should return payment map for building', async () => {
      const mockDb = db as any

      const mockApartments = [
        { id: 1, floor: '0', identifier: 'A', buildingId },
        { id: 2, floor: '1', identifier: 'Esq', buildingId }
      ]

      // 1. Apartments Query: select().from().where().orderBy()
      mockDb.orderBy.mockResolvedValueOnce(mockApartments)

      const mockPayments = [
        { apartmentId: 1, month: 1, status: 'paid' },
        { apartmentId: 2, month: 1, status: 'pending' }
      ]

      // 2. Payments Query: select().from().innerJoin().where()

      // Configure `where`:
      // Call 1 (apartments query): `this` (mockDb) - so `orderBy` works
      // Call 2 (payments query): `Promise<mockPayments>` - result

      mockDb.where
        .mockReturnValueOnce(mockDb) // For chaining orderBy in first query
        .mockResolvedValueOnce(mockPayments) // For returning payments result in second query

      const result = await getPaymentMap(buildingId, year)

      expect(result).toHaveLength(2)
      expect(result[0].apartmentId).toBe(1)
      expect(result[0].payments[1]).toBe('paid')
      expect(result[1].apartmentId).toBe(2)
      expect(result[1].payments[1]).toBe('pending')
    })
  })

  describe('updatePaymentStatus', () => {
    it('should insert new payment if not exists', async () => {
      const mockDb = db as any
      // Query: select().from().where().limit(1)
      mockDb.limit.mockResolvedValueOnce([])

      // We also need `where` to return `this` so `limit` works.
      mockDb.where.mockReturnValueOnce(mockDb)

      await updatePaymentStatus(1, 1, 2024, 'paid', 5000)

      expect(mockDb.insert).toHaveBeenCalledWith(payments)
      expect(mockDb.values).toHaveBeenCalledWith({
        apartmentId: 1,
        month: 1,
        year: 2024,
        status: 'paid',
        amount: 5000,
      })
    })

    it('should update existing payment', async () => {
      const mockDb = db as any
      // Query: select().from().where().limit(1)
      mockDb.limit.mockResolvedValueOnce([{ id: 100 }])
      // 1st where (for limit)
      mockDb.where.mockReturnValueOnce(mockDb)

      // 2nd where (for update await)
      // update().set().where() -> await
      // We need to return a promise.
      mockDb.where.mockResolvedValueOnce(undefined)

      await updatePaymentStatus(1, 1, 2024, 'paid', 5000)

      expect(mockDb.update).toHaveBeenCalledWith(payments)
      expect(mockDb.set).toHaveBeenCalledWith({
        status: 'paid',
        amount: 5000,
        updatedAt: expect.any(Date)
      })
    })
  })
})
