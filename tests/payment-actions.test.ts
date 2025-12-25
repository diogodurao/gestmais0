import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
    getPaymentMap,
    updatePaymentStatus,
    PaymentStatus
} from '@/app/actions/payments'
import { db } from '@/db'

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
        it('should return grid data for payments', async () => {
            const buildingId = 'building-123'
            const year = 2024
            const apartmentsMock = [{ id: 1, unit: '1A', buildingId }]
            const paymentsMock = [{ apartmentId: 1, month: 1, status: 'paid' }]

            // Mock db chain
            const orderByMock = vi.fn().mockResolvedValue(apartmentsMock)
            const whereMockApt = vi.fn().mockReturnValue({ orderBy: orderByMock })
            const fromMockApt = vi.fn().mockReturnValue({ where: whereMockApt })

            // For payments query
            const whereMockPay = vi.fn().mockResolvedValue(paymentsMock)
            const innerJoinMock = vi.fn().mockReturnValue({ where: whereMockPay })
            const fromMockPay = vi.fn().mockReturnValue({ innerJoin: innerJoinMock })

            // @ts-ignore
            db.select.mockImplementation((fields) => {
                if (fields) { // db.select({...}) for payments
                    return { from: fromMockPay }
                }
                return { from: fromMockApt } // db.select().from(apartments)
            })

            const result = await getPaymentMap(buildingId, year)

            expect(result).toHaveLength(1)
            expect(result[0].apartmentId).toBe(1)
            expect(result[0].payments[1]).toBe('paid')
        })
    })

    describe('updatePaymentStatus', () => {
        it('should update existing payment', async () => {
            const apartmentId = 1
            const month = 1
            const year = 2024
            const status: PaymentStatus = 'paid'

            // Mock check existence
            const limitMock = vi.fn().mockResolvedValue([{ id: 100 }])
            const whereMock = vi.fn().mockReturnValue({ limit: limitMock })
            const fromMock = vi.fn().mockReturnValue({ where: whereMock })
            // @ts-ignore
            db.select.mockReturnValue({ from: fromMock })

            // Mock update
            const whereMockUpdate = vi.fn().mockResolvedValue([])
            const setMock = vi.fn().mockReturnValue({ where: whereMockUpdate })
            // @ts-ignore
            db.update.mockReturnValue({ set: setMock })

            await updatePaymentStatus(apartmentId, month, year, status)

            expect(db.update).toHaveBeenCalled()
        })

        it('should insert new payment if not exists', async () => {
            const apartmentId = 1
            const month = 1
            const year = 2024
            const status: PaymentStatus = 'paid'

            // Mock check existence (empty)
            const limitMock = vi.fn().mockResolvedValue([])
            const whereMock = vi.fn().mockReturnValue({ limit: limitMock })
            const fromMock = vi.fn().mockReturnValue({ where: whereMock })
            // @ts-ignore
            db.select.mockReturnValue({ from: fromMock })

            // Mock insert
            const valuesMock = vi.fn().mockResolvedValue([])
            // @ts-ignore
            db.insert.mockReturnValue({ values: valuesMock })

            await updatePaymentStatus(apartmentId, month, year, status)

            expect(db.insert).toHaveBeenCalled()
        })
    })
})
