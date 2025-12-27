import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createExtraordinaryProject, getExtraordinaryProjects, getResidentExtraordinaryPayments } from '@/app/actions/extraordinary'
import { extraordinaryService } from '@/services/extraordinary.service'

// Mock dependencies
vi.mock('@/services/extraordinary.service', () => ({
    extraordinaryService: {
        createExtraordinaryProject: vi.fn(),
        getExtraordinaryProjects: vi.fn(),

        updateExtraordinaryProject: vi.fn(),
        getResidentExtraordinaryPayments: vi.fn(),
    }
}))

vi.mock('@/lib/auth-helpers', () => ({
    requireBuildingAccess: vi.fn(),
    requireProjectAccess: vi.fn(),
    requireResidentSession: vi.fn(),
    requireSession: vi.fn(),
}))

// Mock next/cache
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}))

describe('Extraordinary Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('createExtraordinaryProject', () => {
        it('should create project when input is valid and user has access', async () => {
            const { requireBuildingAccess } = await import('@/lib/auth-helpers')
            const mockSession = { user: { id: 'u1' } }
            vi.mocked(requireBuildingAccess).mockResolvedValue({ session: mockSession } as any)

            vi.mocked(extraordinaryService.createExtraordinaryProject).mockResolvedValue({ id: 1, name: 'Project 1' } as any)

            const input = {
                buildingId: 'b1', // needs to be valid UUID format for schema?
                name: 'New Project',
                totalBudget: 1000,
                numInstallments: 10,
                startMonth: 1,
                startYear: 2024
            }

            // Mock zod to accept UUID if needed, or use valid UUID
            const validUUID = "123e4567-e89b-12d3-a456-426614174000"
            input.buildingId = validUUID

            const result = await createExtraordinaryProject(input)

            expect(result.success).toBe(true)
            expect(requireBuildingAccess).toHaveBeenCalledWith(validUUID)
            expect(extraordinaryService.createExtraordinaryProject).toHaveBeenCalled()
        })

        it('should return error if validation fails', async () => {
            const { requireBuildingAccess } = await import('@/lib/auth-helpers')
            const mockSession = { user: { id: 'u1' } }
            vi.mocked(requireBuildingAccess).mockResolvedValue({ session: mockSession } as any)

            const input = {
                buildingId: "invalid-uuid",
                name: '', // Empty name (invalid)
                totalBudget: -100, // Negative (invalid)
                numInstallments: 0,
                startMonth: 13,
                startYear: 1999
            }

            const result = await createExtraordinaryProject(input)

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error).toBeDefined()
            }
            expect(extraordinaryService.createExtraordinaryProject).not.toHaveBeenCalled()
        })
    })

    describe('getExtraordinaryProjects', () => {
        it('should return projects list', async () => {
            const { requireBuildingAccess } = await import('@/lib/auth-helpers')
            vi.mocked(requireBuildingAccess).mockResolvedValue({} as any)

            const mockProjects = [{ id: 1, name: 'P1' }]
            vi.mocked(extraordinaryService.getExtraordinaryProjects).mockResolvedValue({ success: true, data: mockProjects } as any)

            const result = await getExtraordinaryProjects('b1')

            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data).toEqual(mockProjects)
            }
        })
    })

    describe('getResidentExtraordinaryPayments', () => {
        it('should return payments for the current resident', async () => {
            const { requireResidentSession } = await import('@/lib/auth-helpers')
            const mockSession = { user: { id: 'resident-1' } }
            vi.mocked(requireResidentSession).mockResolvedValue(mockSession as any)

            const mockPayments = [{ projectId: 1, totalShare: 100 }]
            vi.mocked(extraordinaryService.getResidentExtraordinaryPayments).mockResolvedValue({ success: true, data: mockPayments } as any)

            const result = await getResidentExtraordinaryPayments()

            expect(requireResidentSession).toHaveBeenCalled()
            expect(extraordinaryService.getResidentExtraordinaryPayments).toHaveBeenCalledWith('resident-1')
            expect(result).toEqual({ success: true, data: mockPayments })
        })
    })
})
