import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getPaymentMap, updatePaymentStatus } from '@/app/actions/payments'

// Use vi.hoisted to create the mock object before modules are evaluated
const mocks = vi.hoisted(() => {
    // Create a mock object that can be chained.
    // Each method returns `this` by default (setup in setupDbMock), unless overridden.
    const mockDbMethods: any = {
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        from: vi.fn(),
        where: vi.fn(),
        limit: vi.fn(),
        innerJoin: vi.fn(),
        leftJoin: vi.fn(),
        returning: vi.fn(),
        orderBy: vi.fn(),
        set: vi.fn(),
        values: vi.fn(),
    }
    return {
        db: mockDbMethods
    }
})

// Mock `next/cache`
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}))

// Mock `db` from `@/db`
vi.mock('@/db', () => ({
    db: mocks.db,
}))

// Helper to reset the mock implementation for chaining
function setupDbMock() {
    // Basic chainability: methods return the mock object itself
    Object.keys(mocks.db).forEach(key => {
        mocks.db[key].mockReturnValue(mocks.db)
    })
}

describe('Payment Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        setupDbMock()
    })

    describe('getPaymentMap', () => {
        it('should return payment grid data', async () => {
            const buildingId = 'b1'
            const year = 2024

            const apartments = [
                { id: 1, floor: '1', identifier: 'A', buildingId }
            ]

            const payments = [
                { apartmentId: 1, month: 1, status: 'paid' }
            ]

            // To properly mock the chains specifically for getPaymentMap:
            // Query 1: db.select().from(apartments).where(...).orderBy(...)
            // We need the LAST call in the chain to resolve to the value.

            // Query 2: db.select(...).from(payments).innerJoin(...).where(...)
            // We need the LAST call in the chain to resolve to the value.

            // Since both use chainable methods, we can use `mockImplementationOnce` to return `this` (the mockDb)
            // until the final method which should return the Promise.

            // BUT, since `setupDbMock` already makes them return `mocks.db`, we just need to ensure
            // that the *specific* final calls return the data.

            // Issue: `orderBy` is called in the first query. If we mock `orderBy` to return data, it works for Query 1.
            // But Query 2 does NOT use `orderBy`. It ends with `where`.

            // So:
            // 1. `orderBy` should return apartments.
            // 2. `where` should return payments (for the second query).

            // Wait, Query 1 also uses `where`.
            // Query 1: select -> from -> where -> orderBy
            // Query 2: select -> from -> innerJoin -> where

            // If we mock `where` to return data, Query 1 might finish early if we are not careful?
            // No, because Query 1 calls `orderBy` *after* `where`.
            // If `where` returns a Promise(data), then `orderBy` cannot be called on it.
            // So `where` must return `mocks.db` for the first call, and `Promise(data)` for the second call?

            // Let's trace Query 1:
            // .where(...) -> must return mocks.db so .orderBy can be called.
            // .orderBy(...) -> returns Promise(apartments).

            // Let's trace Query 2:
            // .innerJoin(...) -> returns mocks.db
            // .where(...) -> returns Promise(payments).

            // So `where` is called twice.
            // First time (Query 1): returns mocks.db
            // Second time (Query 2): returns Promise(payments)

            mocks.db.orderBy.mockResolvedValueOnce(apartments)

            mocks.db.where
                .mockReturnValueOnce(mocks.db) // Query 1: allow chaining to continue to orderBy
                .mockResolvedValueOnce(payments) // Query 2: end of chain, return data

            const result = await getPaymentMap(buildingId, year)

            expect(result).toHaveLength(1)
            expect(result[0].apartmentId).toBe(1)
            expect(result[0].unit).toBe('1º A')
            expect(result[0].payments[1]).toBe('paid')
        })

        it('should return empty array if no buildingId', async () => {
            const result = await getPaymentMap('', 2024)
            expect(result).toEqual([])
        })
    })

    describe('updatePaymentStatus', () => {
        it('should update existing payment', async () => {
            const aptId = 1
            const month = 1
            const year = 2024
            const status = 'paid'

            const existing = [{ id: 100 }]

            // query: select().from().where().limit(1)
            // .limit is the terminator here.
            mocks.db.limit.mockResolvedValueOnce(existing)

            await updatePaymentStatus(aptId, month, year, status)

            expect(mocks.db.update).toHaveBeenCalled()
            expect(mocks.db.set).toHaveBeenCalledWith(expect.objectContaining({ status }))
        })

        it('should create new payment if not exists', async () => {
            const aptId = 1
            const month = 1
            const year = 2024
            const status = 'paid'

            mocks.db.limit.mockResolvedValueOnce([])

            await updatePaymentStatus(aptId, month, year, status)

            expect(mocks.db.insert).toHaveBeenCalled()
            expect(mocks.db.values).toHaveBeenCalledWith(expect.objectContaining({
                apartmentId: aptId,
                month,
                year,
                status
            }))
        })
    })
})
