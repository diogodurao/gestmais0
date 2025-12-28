import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getPaymentMap, updatePaymentStatus } from '@/app/actions/payments'
import { db } from '@/db'

// Mock the database
vi.mock('@/db', () => ({
    db: {
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    }
}))

// Mock revalidatePath
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}))

describe('Payment Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks()

         const createMockChain = (returnValue: any = []) => {
            const chain: any = {
                from: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                limit: vi.fn().mockReturnThis(),
                orderBy: vi.fn().mockReturnThis(),
                innerJoin: vi.fn().mockReturnThis(),
                leftJoin: vi.fn().mockReturnThis(),
                set: vi.fn().mockReturnThis(),
                values: vi.fn().mockReturnThis(),
                returning: vi.fn().mockResolvedValue(returnValue),
            }
            chain.then = (resolve: any, reject: any) => Promise.resolve(returnValue).then(resolve, reject)
            return chain
        }

        vi.mocked(db.select).mockReturnValue(createMockChain([]))
        vi.mocked(db.insert).mockReturnValue(createMockChain([]))
        vi.mocked(db.update).mockReturnValue(createMockChain([]))
    })

    describe('getPaymentMap', () => {
        it('should return empty list if no buildingId', async () => {
            const result = await getPaymentMap('', 2024)
            expect(result).toEqual([])
        })

        it('should return payment grid data', async () => {
            const mockApartments = [
                { id: 1, floor: '1', identifier: 'A', buildingId: 'b1' },
                { id: 2, floor: '2', identifier: 'B', buildingId: 'b1' }
            ]

            const mockPayments = [
                { apartmentId: 1, month: 1, status: 'paid' },
                { apartmentId: 2, month: 2, status: 'late' }
            ]

            // Mock apartments query
            const aptQuery = {
                from: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                orderBy: vi.fn().mockResolvedValue(mockApartments),
                then: (r: any) => Promise.resolve(mockApartments).then(r)
            }
            vi.mocked(db.select).mockReturnValueOnce(aptQuery as any)

            // Mock payments query
            const payQuery = {
                from: vi.fn().mockReturnThis(),
                innerJoin: vi.fn().mockReturnThis(),
                where: vi.fn().mockResolvedValue(mockPayments),
                then: (r: any) => Promise.resolve(mockPayments).then(r)
            }
            vi.mocked(db.select).mockReturnValueOnce(payQuery as any)

            const result = await getPaymentMap('b1', 2024)

            expect(result).toHaveLength(2)
            expect(result[0].unit).toBe('1º A')
            expect(result[0].payments[1]).toBe('paid')
            expect(result[1].unit).toBe('2º B')
            expect(result[1].payments[2]).toBe('late')
        })
    })

    describe('updatePaymentStatus', () => {
        it('should create new payment if not exists', async () => {
             // Mock existing check (empty)
             const existingQuery = {
                from: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue([]),
                then: (r: any) => Promise.resolve([]).then(r)
             }
             vi.mocked(db.select).mockReturnValueOnce(existingQuery as any)

             await updatePaymentStatus(1, 1, 2024, 'paid', 50)

             expect(db.insert).toHaveBeenCalled()
             expect(db.update).not.toHaveBeenCalled()
        })

        it('should update existing payment', async () => {
            // Mock existing check (found)
            const existingQuery = {
               from: vi.fn().mockReturnThis(),
               where: vi.fn().mockReturnThis(),
               limit: vi.fn().mockResolvedValue([{ id: 123 }]),
               then: (r: any) => Promise.resolve([{ id: 123 }]).then(r)
            }
            vi.mocked(db.select).mockReturnValueOnce(existingQuery as any)

            await updatePaymentStatus(1, 1, 2024, 'paid', 50)

            expect(db.update).toHaveBeenCalled()
            expect(db.insert).not.toHaveBeenCalled()
       })
    })
})
