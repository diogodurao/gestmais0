import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getPaymentMap, updatePaymentStatus } from '@/app/actions/payments'

// Define mockDb factory
const { mockDb } = vi.hoisted(() => {
    const methods = {
        select: vi.fn(),
        from: vi.fn(),
        where: vi.fn(),
        limit: vi.fn(),
        insert: vi.fn(),
        values: vi.fn(),
        update: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
        returning: vi.fn(),
        innerJoin: vi.fn(),
        leftJoin: vi.fn(),
        orderBy: vi.fn(),
        then: vi.fn((resolve) => resolve([])),
    }

    // Set up chainable returns
    Object.values(methods).forEach(mock => {
        if (mock !== methods.then) {
            mock.mockReturnValue(methods)
        }
    })

    return { mockDb: methods }
})

vi.mock('@/db', () => ({
    db: mockDb
}))

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn()
}))

describe('Manager Payment Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        Object.values(mockDb).forEach(mock => {
            if (mock !== mockDb.then) {
                mock.mockReturnValue(mockDb)
            }
        })
        mockDb.then.mockImplementation((resolve) => resolve([]))
    })

    describe('getPaymentMap', () => {
        it('should return empty array if buildingId is missing', async () => {
            const result = await getPaymentMap('', 2023)
            expect(result).toEqual([])
        })

        it('should return grid data with payments', async () => {
            const buildingId = 'building-123'
            const year = 2023
            const apartmentsData = [
                { id: 1, unit: '1A', buildingId },
                { id: 2, unit: '1B', buildingId }
            ]
            const paymentsData = [
                { apartmentId: 1, month: 1, status: 'paid' },
                { apartmentId: 2, month: 1, status: 'pending' }
            ]

            // Mock apartments query
            // db.select().from().where().orderBy()
            // We need to distinguish between the two select calls.
            // First call: get apartments
            // Second call: get payments

            // Since both start with db.select(), we can mock select implementation to return different chain behaviors or just mock resolution order.
            // But since both are chained, they eventually call 'then'.

            // We can rely on `mockImplementationOnce` on the final promise resolution.
            // However, `await db...` calls `.then()` on the mockDb object.

            mockDb.then
                .mockImplementationOnce((resolve) => resolve(apartmentsData)) // First query: apartments
                .mockImplementationOnce((resolve) => resolve(paymentsData))   // Second query: payments

            const result = await getPaymentMap(buildingId, year)

            expect(mockDb.select).toHaveBeenCalledTimes(2)
            expect(result).toHaveLength(2)
            expect(result[0]).toEqual({
                apartmentId: 1,
                unit: '1A',
                payments: { 1: 'paid' }
            })
            expect(result[1]).toEqual({
                apartmentId: 2,
                unit: '1B',
                payments: { 1: 'pending' }
            })
        })
    })

    describe('updatePaymentStatus', () => {
        it('should update existing payment', async () => {
            const apartmentId = 1
            const month = 1
            const year = 2023
            const status = 'paid'
            const existingPayment = { id: 100, apartmentId, month, year, status: 'pending' }

            // Check existence: returns [existingPayment]
            mockDb.then.mockImplementationOnce((resolve) => resolve([existingPayment]))

            // Update: returns nothing (or result)
            mockDb.then.mockImplementationOnce((resolve) => resolve([]))

            await updatePaymentStatus(apartmentId, month, year, status)

            expect(mockDb.update).toHaveBeenCalled()
            expect(mockDb.set).toHaveBeenCalledWith(expect.objectContaining({ status }))
            expect(mockDb.where).toHaveBeenCalled() // Should verify arguments
        })

        it('should insert new payment if not exists', async () => {
            const apartmentId = 1
            const month = 1
            const year = 2023
            const status = 'paid'

            // Check existence: returns []
            mockDb.then.mockImplementationOnce((resolve) => resolve([]))

            // Insert: returns nothing (or result)
            mockDb.then.mockImplementationOnce((resolve) => resolve([]))

            await updatePaymentStatus(apartmentId, month, year, status)

            expect(mockDb.insert).toHaveBeenCalled()
            expect(mockDb.values).toHaveBeenCalledWith(expect.objectContaining({
                apartmentId,
                month,
                year,
                status
            }))
        })
    })
})
