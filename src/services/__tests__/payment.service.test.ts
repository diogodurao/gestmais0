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
        it('should return personal summary for resident', async () => {
            const userId = 'r1'
            const mockSelect = vi.fn()

            // 1. User Query
            mockSelect.mockReturnValueOnce({
                from: vi.fn().mockReturnValueOnce({
                    where: vi.fn().mockReturnValueOnce({
                        limit: vi.fn().mockResolvedValueOnce([{ id: userId, role: 'resident', name: 'Resident' }])
                    })
                })
            })

            // 2. Apartment Query
            mockSelect.mockReturnValueOnce({
                from: vi.fn().mockReturnValueOnce({
                    innerJoin: vi.fn().mockReturnValueOnce({
                        where: vi.fn().mockReturnValueOnce({
                            limit: vi.fn().mockResolvedValueOnce([{ id: 1, unit: '1A', buildingId: 'b1', monthlyQuota: 5000 }])
                        })
                    })
                })
            })

            // 3. Regular Payments
            mockSelect.mockReturnValueOnce({
                from: vi.fn().mockReturnValueOnce({
                    where: vi.fn().mockResolvedValueOnce([{ status: 'paid', amount: 5000, month: 1, year: 2024 }])
                })
            })

            // 4. Extra Payments
            mockSelect.mockReturnValueOnce({
                from: vi.fn().mockReturnValueOnce({
                    innerJoin: vi.fn().mockReturnValueOnce({
                        where: vi.fn().mockResolvedValueOnce([])
                    })
                })
            })

            // Inject mock
            // @ts-ignore
            db.select = mockSelect

            const result = await service.getResidentPaymentStatus(userId)

            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.isBuildingSummary).toBeUndefined()
                expect(result.data.apartmentUnit).toBe("1A")
            }
        })
    })

    describe('getBuildingPaymentStatus', () => {
        it('should return building summary', async () => {
            const buildingId = 'b1'
            const mockSelect = vi.fn()

            // 1. Building Query
            mockSelect.mockReturnValueOnce({
                from: vi.fn().mockReturnValueOnce({
                    where: vi.fn().mockReturnValueOnce({
                        limit: vi.fn().mockResolvedValueOnce([{
                            id: buildingId,
                            name: 'Building 1',
                            monthlyQuota: 5000
                        }])
                    })
                })
            })

            // 2. Regular Payments Summary Query
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

            // 3. Total Apartments Query
            mockSelect.mockReturnValueOnce({
                from: vi.fn().mockReturnValueOnce({
                    where: vi.fn().mockResolvedValueOnce([{ count: 10 }])
                })
            })

            // 4. Extra Projects Query
            mockSelect.mockReturnValueOnce({
                from: vi.fn().mockReturnValueOnce({
                    where: vi.fn().mockResolvedValueOnce([]) // No active projects
                })
            })

            // Inject mock
            // @ts-ignore
            db.select = mockSelect

            const result = await service.getBuildingPaymentStatus(buildingId)

            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.isBuildingSummary).toBe(true)
                expect(result.data.residentName).toBe("Gestor")
            }
        })
    })
})
