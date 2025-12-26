import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getPaymentMap, updatePaymentStatus } from '@/app/actions/payments'
import { db } from '@/db'
import { payments } from '@/db/schema'

// Mock the database
vi.mock('@/db', () => ({
    db: {
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
}))

describe('Payment Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('getPaymentMap', () => {
        it('should return payment grid data correctly', async () => {
            const buildingId = 'building-1'
            const year = 2024

            const apartmentsMock = [
                { id: 1, unit: '1A', buildingId },
                { id: 2, unit: '1B', buildingId }
            ]

            const paymentsMock = [
                { apartmentId: 1, month: 1, status: 'paid' },
                { apartmentId: 2, month: 1, status: 'pending' }
            ]

            // Mock apartments query
            // Mock payments query
            // Since Drizzle chaining is complex, we need to mock carefuly.
            // getPaymentMap calls:
            // 1. db.select().from(apartments)...
            // 2. db.select(...).from(payments).innerJoin(...).where(...)

            const selectMock = vi.mocked(db.select)

            // First call for apartments
            selectMock.mockReturnValueOnce({
                from: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                orderBy: vi.fn().mockResolvedValue(apartmentsMock)
            } as any)

            // Second call for payments
            selectMock.mockReturnValueOnce({
                from: vi.fn().mockReturnThis(),
                innerJoin: vi.fn().mockReturnThis(),
                where: vi.fn().mockResolvedValue(paymentsMock)
            } as any)

            const result = await getPaymentMap(buildingId, year)

            expect(result).toHaveLength(2)
            expect(result[0].payments[1]).toBe('paid')
            expect(result[1].payments[1]).toBe('pending')
        })
    })

    describe('updatePaymentStatus', () => {
        it('should update existing payment', async () => {
            const apartmentId = 1
            const month = 1
            const year = 2024
            const status = 'paid'
            const existingPayment = { id: 100 }

            // Mock check existing
            const selectMock = {
                from: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue([existingPayment]),
            }
            vi.mocked(db.select).mockReturnValue(selectMock as any)

            // Mock update
            const updateMock = {
                set: vi.fn().mockReturnThis(),
                where: vi.fn().mockResolvedValue(undefined),
            }
            vi.mocked(db.update).mockReturnValue(updateMock as any)

            await updatePaymentStatus(apartmentId, month, year, status)

            expect(db.update).toHaveBeenCalledWith(payments)
            expect(updateMock.set).toHaveBeenCalledWith(expect.objectContaining({ status }))
        })

        it('should insert new payment if not exists', async () => {
            const apartmentId = 1
            const month = 1
            const year = 2024
            const status = 'paid'

            // Mock check existing (empty)
            const selectMock = {
                from: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue([]),
            }
            vi.mocked(db.select).mockReturnValue(selectMock as any)

            // Mock insert
            const insertMock = {
                values: vi.fn().mockResolvedValue(undefined),
            }
            vi.mocked(db.insert).mockReturnValue(insertMock as any)

            await updatePaymentStatus(apartmentId, month, year, status)

            expect(db.insert).toHaveBeenCalledWith(payments)
            expect(insertMock.values).toHaveBeenCalledWith(expect.objectContaining({
                apartmentId, month, year, status
            }))
        })
    })
})
