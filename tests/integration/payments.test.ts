import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getPaymentMap, updatePaymentStatus } from '@/app/actions/payments'
import { db } from '@/db'

// Mock the db instance
vi.mock('@/db', () => {
  return {
    db: {
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }
  }
})

// Mock revalidatePath
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('Payment Actions', () => {
  const buildingId = 'test-building-id'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getPaymentMap', () => {
    it('should return payment grid data', async () => {
      const year = 2024
      const apartments = [
        { id: 1, floor: '0', identifier: 'A', buildingId },
        { id: 2, floor: '1', identifier: 'B', buildingId },
      ]
      const payments = [
        { apartmentId: 1, month: 1, status: 'paid' },
        { apartmentId: 2, month: 1, status: 'pending' },
      ]

      const selectMock = vi.fn()
      // First call: get apartments
      selectMock.mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                  orderBy: vi.fn().mockResolvedValue(apartments)
              })
          })
      })
      // Second call: get payments
      selectMock.mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
              innerJoin: vi.fn().mockReturnValue({
                  where: vi.fn().mockReturnValue({
                      limit: vi.fn(), // mock limit if needed, though getPaymentMap doesn't use it for payments list
                  }) // returns promise directly in implementation? No, await db.select...
              })
          })
      })
      // Since innerJoin...where doesn't end with limit, we need to mock the promise resolution on where()
      // But wait, the code is:
      // await db.select(...).from(...).innerJoin(...).where(...)
      // So where() should return a promise that resolves to the rows.

      // Let's refine the mock for the second call
      selectMock.mockImplementation((fields) => {
        // If it's the apartments query (no fields arg in select(), but select() is called with no args in getPaymentMap source? No, db.select().from...)
        // In getPaymentMap:
        // 1. db.select().from(apartments)...
        // 2. db.select({...}).from(payments)...

        // Checking arguments of select might be hard if fields are complex objects.
        // Let's rely on call order or structure.

        return {
            from: vi.fn().mockImplementation((table) => {
                return {
                    where: vi.fn().mockReturnValue({
                        orderBy: vi.fn().mockResolvedValue(apartments)
                    }),
                    innerJoin: vi.fn().mockReturnValue({
                        where: vi.fn().mockResolvedValue(payments)
                    })
                }
            })
        }
      })

      // Resetting the mock implementation to be simpler and use call counts or inspection if needed,
      // but simpler is to chain returns.

      // Re-doing the mock strategy for `select`
      const selectFn = vi.fn()

      // Call 1: Apartments
      selectFn.mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                  orderBy: vi.fn().mockResolvedValue(apartments)
              })
          })
      })

      // Call 2: Payments
      selectFn.mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
              innerJoin: vi.fn().mockReturnValue({
                  where: vi.fn().mockResolvedValue(payments)
              })
          })
      })

      ;(db.select as any) = selectFn

      const result = await getPaymentMap(buildingId, year)

      expect(result).toHaveLength(2)
      expect(result[0].apartmentId).toBe(1)
      expect(result[0].payments[1]).toBe('paid')
      expect(result[1].apartmentId).toBe(2)
      expect(result[1].payments[1]).toBe('pending')
    })
  })

  describe('updatePaymentStatus', () => {
    it('should update existing payment', async () => {
      const apartmentId = 1
      const month = 1
      const year = 2024
      const status = 'paid'

      // Mock finding existing payment
      const selectMock = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: 100 }])
          })
        })
      })
      ;(db.select as any) = selectMock

      // Mock update
      const updateMock = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue({})
        })
      })
      ;(db.update as any) = updateMock

      await updatePaymentStatus(apartmentId, month, year, status)

      expect(db.update).toHaveBeenCalled()
      expect(db.insert).not.toHaveBeenCalled()
    })

    it('should create new payment if not exists', async () => {
      const apartmentId = 1
      const month = 1
      const year = 2024
      const status = 'paid'

      // Mock finding NO existing payment
      const selectMock = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([])
          })
        })
      })
      ;(db.select as any) = selectMock

      // Mock insert
      const insertMock = vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue({})
      })
      ;(db.insert as any) = insertMock

      await updatePaymentStatus(apartmentId, month, year, status)

      expect(db.insert).toHaveBeenCalled()
      expect(db.update).not.toHaveBeenCalled()
    })
  })
})
