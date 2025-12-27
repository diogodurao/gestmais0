import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getPaymentMap, updatePaymentStatus } from '@/app/actions/payments'
import { db } from '@/db'

describe('Payment Actions', () => {

    beforeEach(() => {
        vi.clearAllMocks()
        // Reset db methods
        // @ts-ignore
        db.select = vi.fn().mockReturnThis()
        // @ts-ignore
        db.insert = vi.fn().mockReturnThis()
        // @ts-ignore
        db.update = vi.fn().mockReturnThis()
    })

    describe('getPaymentMap', () => {
        it('should return grid data for valid building', async () => {
            const buildingId = 'b-1'
            const year = 2024

            const mockApartments = [
                { id: 1, floor: '0', identifier: 'A', buildingId },
                { id: 2, floor: '1', identifier: 'Esq', buildingId }
            ]

            const mockPayments = [
                { apartmentId: 1, month: 1, status: 'paid' },
                { apartmentId: 2, month: 2, status: 'pending' }
            ]

            const limitMock = vi.fn()
            const orderByMock = vi.fn() // select(apts).where().orderBy()
            const whereMock1 = vi.fn().mockReturnValue({ orderBy: orderByMock })
            const fromMock1 = vi.fn().mockReturnValue({ where: whereMock1 })
            const selectMock1 = vi.fn().mockReturnValue({ from: fromMock1 })

            const whereMock2 = vi.fn().mockReturnValue({ then: (r: any) => r(mockPayments) }) // select(payments).innerJoin().where()
            const innerJoinMock2 = vi.fn().mockReturnValue({ where: whereMock2 })
            const fromMock2 = vi.fn().mockReturnValue({ innerJoin: innerJoinMock2 })
            const selectMock2 = vi.fn().mockReturnValue({ from: fromMock2 })

            // @ts-ignore
            db.select = vi.fn()
                .mockReturnValueOnce({ from: fromMock1 }) // 1. fetch apartments
                .mockReturnValueOnce({ from: fromMock2 }) // 2. fetch payments

            // 1. Fetch apartments
            orderByMock.mockResolvedValueOnce(mockApartments)
            // 2. Fetch payments: handled by then() above

            const result = await getPaymentMap(buildingId, year)

            expect(result).toHaveLength(2)
            expect(result[0].unit).toBe("R/C A")
            expect(result[0].payments[1]).toBe("paid")
            expect(result[1].unit).toBe("1º Esq")
            expect(result[1].payments[2]).toBe("pending")
        })

        it('should return empty list if building has no apartments', async () => {
            const buildingId = 'b-1'
             const orderByMock = vi.fn().mockResolvedValue([])
            const whereMock = vi.fn().mockReturnValue({ orderBy: orderByMock })
            const fromMock = vi.fn().mockReturnValue({ where: whereMock })
            const selectMock = vi.fn().mockReturnValue({ from: fromMock })

             // @ts-ignore
            db.select = selectMock
            // Payments query won't be executed?
            // The code calls select(apts) then select(payments).
            // It doesn't check if apts is empty before querying payments?
            // Actually:
            // const buildingApartments = await db.select()...
            // const rawPayments = await db.select()...

            // It does query payments regardless.
            // But we need to mock it.

            const whereMock2 = vi.fn().mockReturnValue({ then: (r: any) => r([]) })
            const innerJoinMock2 = vi.fn().mockReturnValue({ where: whereMock2 })
            const fromMock2 = vi.fn().mockReturnValue({ innerJoin: innerJoinMock2 })

            // @ts-ignore
            db.select = vi.fn()
                .mockReturnValueOnce({ from: fromMock })
                .mockReturnValueOnce({ from: fromMock2 })

            const result = await getPaymentMap(buildingId, 2024)
            expect(result).toEqual([])
        })
    })

    describe('updatePaymentStatus', () => {
        it('should insert if payment does not exist', async () => {
            const aptId = 1
            const month = 1
            const year = 2024
            const status = 'paid'

            const limitMock = vi.fn().mockResolvedValue([])
            const whereMock = vi.fn().mockReturnValue({ limit: limitMock })
            const fromMock = vi.fn().mockReturnValue({ where: whereMock })
            const selectMock = vi.fn().mockReturnValue({ from: fromMock })

            const valuesMock = vi.fn()
            const insertMock = vi.fn().mockReturnValue({ values: valuesMock })

             // @ts-ignore
            db.select = selectMock
             // @ts-ignore
            db.insert = insertMock

            valuesMock.mockReturnValue({ then: (r: any) => r(undefined) })

            await updatePaymentStatus(aptId, month, year, status)

            expect(db.insert).toHaveBeenCalled()
        })

        it('should update if payment exists', async () => {
             const aptId = 1
            const month = 1
            const year = 2024
            const status = 'paid'
            const existing = [{ id: 123 }]

            const limitMock = vi.fn().mockResolvedValue(existing)
            const whereMock = vi.fn().mockReturnValue({ limit: limitMock })
            const fromMock = vi.fn().mockReturnValue({ where: whereMock })
            const selectMock = vi.fn().mockReturnValue({ from: fromMock })

            const whereUpdateMock = vi.fn().mockReturnValue({ then: (r: any) => r(undefined) })
            const setMock = vi.fn().mockReturnValue({ where: whereUpdateMock })
            const updateMock = vi.fn().mockReturnValue({ set: setMock })

             // @ts-ignore
            db.select = selectMock
             // @ts-ignore
            db.update = updateMock

            await updatePaymentStatus(aptId, month, year, status)

            expect(db.update).toHaveBeenCalled()
        })
    })

})
