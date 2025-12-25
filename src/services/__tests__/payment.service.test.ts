import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PaymentService } from "@/services/payment.service"
import { db } from "@/db"

// Mock the database
vi.mock("@/db", () => ({
    db: {
        select: vi.fn(),
    }
}))

describe('PaymentService', () => {
    let service: PaymentService

    beforeEach(() => {
        service = new PaymentService()
        vi.clearAllMocks()
    })

    describe('getPaymentMap', () => {
        it('should calculate balances correctly for mixed payments', async () => {
            // Mock building quota
            const mockSelect = vi.fn()

            // 1. Building Info Query
            mockSelect.mockReturnValueOnce({
                from: vi.fn().mockReturnValueOnce({
                    where: vi.fn().mockReturnValueOnce({
                        limit: vi.fn().mockResolvedValueOnce([{ monthlyQuota: 5000 }]) // 50 euros
                    })
                })
            })

            // 2. Apartments Query
            mockSelect.mockReturnValueOnce({
                from: vi.fn().mockReturnValueOnce({
                    leftJoin: vi.fn().mockReturnValueOnce({
                        where: vi.fn().mockReturnValueOnce({
                            orderBy: vi.fn().mockResolvedValueOnce([
                                { id: 1, unit: '1A', residentName: 'John' },
                                { id: 2, unit: '1B', residentName: 'Jane' }
                            ])
                        })
                    })
                })
            })

            // 3. Payments Query
            mockSelect.mockReturnValueOnce({
                from: vi.fn().mockReturnValueOnce({
                    innerJoin: vi.fn().mockReturnValueOnce({
                        where: vi.fn().mockResolvedValueOnce([
                            { apartmentId: 1, month: 1, status: 'paid', amount: 5000 } // John Paid Jan
                        ])
                    })
                })
            })

            // Inject mock
            // @ts-ignore
            db.select = mockSelect

            const result = await service.getPaymentMap('b1', 2024)

            expect(result.monthlyQuota).toBe(5000)
            expect(result.gridData).toHaveLength(2)

            // Verify John (Paid Jan)
            const john = result.gridData.find(p => p.apartmentId === 1)
            expect(john).toBeDefined()
            expect(john?.payments[1]).toEqual({ status: 'paid', amount: 5000 })
        })

        it('should return empty grid if no building id', async () => {
            const result = await service.getPaymentMap('', 2024)
            expect(result.gridData).toHaveLength(0)
            expect(result.monthlyQuota).toBe(0)
        })
    })
    describe('getResidentPaymentStatus', () => {
        it('should return building summary for manager', async () => {
            const userId = 'm1'

            const mockSelect = vi.fn()

            // 1. User Query
            mockSelect.mockReturnValueOnce({
                from: vi.fn().mockReturnValueOnce({
                    where: vi.fn().mockReturnValueOnce({
                        limit: vi.fn().mockResolvedValueOnce([{
                            id: userId,
                            role: 'manager',
                            activeBuildingId: 'b1',
                            name: 'Manager'
                        }])
                    })
                })
            })

            // 2. Building Query
            mockSelect.mockReturnValueOnce({
                from: vi.fn().mockReturnValueOnce({
                    where: vi.fn().mockReturnValueOnce({
                        limit: vi.fn().mockResolvedValueOnce([{
                            id: 'b1',
                            name: 'Building 1',
                            monthlyQuota: 5000
                        }])
                    })
                })
            })

            // 3. Regular Payments Summary Query
            mockSelect.mockReturnValueOnce({
                from: vi.fn().mockReturnValueOnce({
                    innerJoin: vi.fn().mockReturnValueOnce({
                        where: vi.fn().mockResolvedValueOnce([{
                            totalPaid: 10000,
                            countPaid: 2
                        }])
                    })
                })
            })

            // 4. Total Apartments Query
            mockSelect.mockReturnValueOnce({
                from: vi.fn().mockReturnValueOnce({
                    where: vi.fn().mockResolvedValueOnce([{ count: 10 }])
                })
            })

            mockSelect.mockReturnValueOnce({
                from: vi.fn().mockReturnValueOnce({
                    where: vi.fn().mockResolvedValueOnce([]) // No active projects
                })
            })

            // Inject mock
            // @ts-ignore
            db.select = mockSelect

            const result = await service.getResidentPaymentStatus(userId)

            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.isBuildingSummary).toBe(true)
                expect(result.data.residentName).toBe("Gestor")
            }
        })
    })
})
