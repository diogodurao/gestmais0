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

        it('should correctly report mixed status (Regular OK, Extra OFF)', async () => {
            const userId = 'r2'
            const mockSelect = vi.fn()

            // 1. User Query
            mockSelect.mockReturnValueOnce({
                from: vi.fn().mockReturnValueOnce({
                    where: vi.fn().mockReturnValueOnce({
                        limit: vi.fn().mockResolvedValueOnce([{ id: userId, role: 'resident', name: 'Resident Mixed' }])
                    })
                })
            })

            // 2. Apartment Query
            mockSelect.mockReturnValueOnce({
                from: vi.fn().mockReturnValueOnce({
                    innerJoin: vi.fn().mockReturnValueOnce({
                        where: vi.fn().mockReturnValueOnce({
                            limit: vi.fn().mockResolvedValueOnce([{ id: 2, unit: '2B', buildingId: 'b1', monthlyQuota: 5000 }])
                        })
                    })
                })
            })

            // 3. Regular Payments (PAID for current month)
            const now = new Date()
            const currentMonth = now.getMonth() + 1
            const currentYear = now.getFullYear()

            mockSelect.mockReturnValueOnce({
                from: vi.fn().mockReturnValueOnce({
                    where: vi.fn().mockResolvedValueOnce([
                        // Simulate all months paid
                        ...Array.from({ length: currentMonth }, (_, i) => ({
                            status: 'paid',
                            amount: 5000,
                            month: i + 1,
                            year: currentYear
                        }))
                    ])
                })
            })

            // 4. Extra Payments (One Active Project, Unpaid Installment)
            mockSelect.mockReturnValueOnce({
                from: vi.fn().mockReturnValueOnce({
                    innerJoin: vi.fn().mockReturnValueOnce({
                        where: vi.fn().mockResolvedValueOnce([
                            {
                                projectId: 101,
                                projectName: "Roof Repair",
                                projectStatus: "active",
                                startMonth: 1,
                                startYear: currentYear,
                                paymentId: 501,
                                installmentNumber: 1,
                                expectedAmount: 20000, // 200 euros
                                paidAmount: 0,
                                paymentStatus: 'pending' // Due and unpaid
                            }
                        ])
                    })
                })
            })

            // Inject mock
            // @ts-ignore
            db.select = mockSelect

            const result = await service.getResidentPaymentStatus(userId)

            expect(result.success).toBe(true)
            if (result.success) {
                // Verify data structure expected by component
                expect(result.data.regularQuotas.overdueMonths).toBe(0)
                expect(result.data.regularQuotas.balance).toBe(0)

                expect(result.data.extraordinaryQuotas.activeProjects).toBe(1)
                expect(result.data.extraordinaryQuotas.overdueInstallments).toBeGreaterThan(0)
                expect(result.data.extraordinaryQuotas.balance).toBe(20000)

                // Overall status should reflect the extra debt
                expect(result.data.status).not.toBe('ok')
            }
        })

        it('should correctly handle year transition logic (Project Start Dec 2024, Current Jan 2025)', async () => {
            // If we are in Jan 2025, and project started Dec 2024 (12/2024).
            // Installment 1 (Dec 2024) -> Due (Overdue)
            // Installment 2 (Jan 2025) -> Due (Current)
            // Installment 3 (Feb 2025) -> Future (Not Due)

            const userId = 'r3'
            const mockSelect = vi.fn()

            // 1. User Query
            mockSelect.mockReturnValueOnce({
                from: vi.fn().mockReturnValueOnce({
                    where: vi.fn().mockReturnValueOnce({
                        limit: vi.fn().mockResolvedValueOnce([{ id: userId, role: 'resident', name: 'Time Traveler' }])
                    })
                })
            })

            // 2. Apartment Query
            mockSelect.mockReturnValueOnce({
                from: vi.fn().mockReturnValueOnce({
                    innerJoin: vi.fn().mockReturnValueOnce({
                        where: vi.fn().mockReturnValueOnce({
                            limit: vi.fn().mockResolvedValueOnce([{ id: 3, unit: '3C', buildingId: 'b1', monthlyQuota: 5000 }])
                        })
                    })
                })
            })

            // 3. Regular Payments (Simulate all paid to simplify)
            mockSelect.mockReturnValueOnce({
                from: vi.fn().mockReturnValueOnce({
                    where: vi.fn().mockResolvedValueOnce([])
                })
            })

            // 4. Extra Payments
            // Mock Date to be Jan 15, 2025
            vi.setSystemTime(new Date(2025, 0, 15))

            mockSelect.mockReturnValueOnce({
                from: vi.fn().mockReturnValueOnce({
                    innerJoin: vi.fn().mockReturnValueOnce({
                        where: vi.fn().mockResolvedValueOnce([
                            // Installment 1: Dec 2024 (Due, Unpaid)
                            {
                                projectId: 200,
                                projectName: "Old Project",
                                projectStatus: "active",
                                startMonth: 12,
                                startYear: 2024,
                                paymentId: 601,
                                installmentNumber: 1,
                                expectedAmount: 1000,
                                paidAmount: 0,
                                paymentStatus: 'pending'
                            },
                            // Installment 2: Jan 2025 (Due, Unpaid)
                            {
                                projectId: 200,
                                projectName: "Old Project",
                                projectStatus: "active",
                                startMonth: 12,
                                startYear: 2024,
                                paymentId: 602,
                                installmentNumber: 2,
                                expectedAmount: 1000,
                                paidAmount: 0,
                                paymentStatus: 'pending'
                            },
                            // Installment 3: Feb 2025 (Future, Unpaid)
                            {
                                projectId: 200,
                                projectName: "Old Project",
                                projectStatus: "active",
                                startMonth: 12,
                                startYear: 2024,
                                paymentId: 603,
                                installmentNumber: 3,
                                expectedAmount: 1000,
                                paidAmount: 0,
                                paymentStatus: 'pending'
                            }
                        ])
                    })
                })
            })

            // Inject mock
            // @ts-ignore
            db.select = mockSelect

            const result = await service.getResidentPaymentStatus(userId)

            expect(result.success).toBe(true)
            if (result.success) {
                // Should count Inst 1 and Inst 2 as Due (Total 2000)
                // Inst 3 is NOT due.
                expect(result.data.extraordinaryQuotas.totalDueToDate).toBe(2000)
                expect(result.data.extraordinaryQuotas.balance).toBe(2000)
                expect(result.data.extraordinaryQuotas.overdueInstallments).toBeGreaterThanOrEqual(1)
            }

            vi.useRealTimers()
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
