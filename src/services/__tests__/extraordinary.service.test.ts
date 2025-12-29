
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { extraordinaryService } from "@/services/extraordinary.service"
import { db } from "@/db"

// Mock the database
vi.mock("@/db", () => ({
    db: {
        transaction: vi.fn(),
        select: vi.fn(),
    }
}))

// Mock revalidatePath
vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}))

describe('ExtraordinaryService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('createExtraordinaryProject', () => {
        it('should create a project and calculating payments in a transaction', async () => {
            const input = {
                buildingId: 'b1',
                name: 'New Roof',
                totalBudget: 100000, // 1000 euros
                numInstallments: 2,
                startMonth: 1,
                startYear: 2024
            }
            const userId = 'u1'

            // Mock transaction execution
            // @ts-ignore
            db.transaction.mockImplementation(async (callback) => {
                const txMock = {
                    insert: vi.fn().mockReturnValue({
                        values: vi.fn().mockReturnValue({
                            returning: vi.fn().mockResolvedValueOnce([{ id: 100 }]) // Project ID
                        })
                    }),
                    select: vi.fn().mockReturnValue({
                        from: vi.fn().mockReturnValue({
                            where: vi.fn().mockResolvedValueOnce([
                                { id: 1, unit: '1A', permillage: 500 },
                                { id: 2, unit: '1B', permillage: 500 }
                            ]) // Apartments
                        })
                    })
                }
                return await callback(txMock)
            })

            const result = await extraordinaryService.createExtraordinaryProject(input, userId)

            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.projectId).toBe(100)
            }

            // Verify db.transaction was called
            expect(db.transaction).toHaveBeenCalled()
        })

        it('should return error if input validation fails', async () => {
            const input = {
                buildingId: 'b1',
                name: '', // Invalid name
                totalBudget: 100000,
                numInstallments: 2,
                startMonth: 1,
                startYear: 2024
            }
            const userId = 'u1'

            const result = await extraordinaryService.createExtraordinaryProject(input, userId)

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error).toBeDefined()
            }

            // Transaction should NOT be called
            expect(db.transaction).not.toHaveBeenCalled()
        })
    })

    describe('getExtraordinaryProjects', () => {
        it('should return list of projects with stats', async () => {
            const mockSelect = vi.fn()

            // 1. Projects Query
            mockSelect.mockReturnValueOnce({
                from: vi.fn().mockReturnValueOnce({
                    where: vi.fn().mockReturnValueOnce({
                        orderBy: vi.fn().mockResolvedValueOnce([
                            { id: 101, name: 'Project A', totalBudget: 1000, createdAt: new Date() }
                        ])
                    })
                })
            })

            // 2. Payments Query (Aggregation)
            mockSelect.mockReturnValueOnce({
                from: vi.fn().mockReturnValueOnce({
                    where: vi.fn().mockReturnValueOnce({
                        groupBy: vi.fn().mockResolvedValueOnce([
                            { projectId: 101, totalPaid: 500, totalExpected: 1000 }
                        ])
                    })
                })
            })

            // Inject mock
            // @ts-ignore
            db.select = mockSelect

            const result = await extraordinaryService.getExtraordinaryProjects('b1')

            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data).toHaveLength(1)
                expect(result.data[0].id).toBe(101)
                expect(result.data[0].totalCollected).toBe(500)
                expect(result.data[0].progressPercent).toBe(50)
            }
        })
    })
})
