import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createNewBuilding, joinBuilding, getOrCreateManagerBuilding } from '@/app/actions/building'
import { buildingService } from '@/services/building.service'
import * as authHelpers from '@/lib/session'

// Mock dependencies
vi.mock('@/services/building.service', () => ({
    buildingService: {
        createNewBuilding: vi.fn(),
        joinBuilding: vi.fn(),
        getOrCreateManagerBuilding: vi.fn(),
    }
}))

vi.mock('@/lib/auth-helpers', () => ({
    requireManagerSession: vi.fn(),
    requireResidentSession: vi.fn(),
    requireBuildingAccess: vi.fn(),
    requireSession: vi.fn(),
    requireApartmentAccess: vi.fn(),
}))

// Mock next/cache
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}))

describe('Building Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('createNewBuilding', () => {
        it('should create building when input is valid and user is manager', async () => {
            const mockSession = { user: { id: 'u1', role: 'manager' } }
            vi.mocked(authHelpers.requireManagerSession).mockResolvedValue(mockSession as any)
            vi.mocked(buildingService.createNewBuilding).mockResolvedValue({ id: 'b1', name: 'New Building' } as any)

            const result = await createNewBuilding('New Building', '123456789')

            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data).toEqual({ id: 'b1', name: 'New Building' })
            }
            expect(buildingService.createNewBuilding).toHaveBeenCalledWith('u1', 'New Building', '123456789')
        })

        it('should return error if validation fails (invalid NIF)', async () => {
            const mockSession = { user: { id: 'u1', role: 'manager' } }
            vi.mocked(authHelpers.requireManagerSession).mockResolvedValue(mockSession as any)

            // Invalid NIF (too short)
            const result = await createNewBuilding('Valid Name', '123')

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error).toBeDefined()
            }
            expect(buildingService.createNewBuilding).not.toHaveBeenCalled()
        })

        it('should return error if service throws', async () => {
            const mockSession = { user: { id: 'u1', role: 'manager' } }
            vi.mocked(authHelpers.requireManagerSession).mockResolvedValue(mockSession as any)
            vi.mocked(buildingService.createNewBuilding).mockRejectedValue(new Error('Db error'))

            const result = await createNewBuilding('New Building', '123456789')

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error).toBe('Failed to create building')
            }
        })
    })

    describe('joinBuilding', () => {
        it('should join building when code is valid', async () => {
            const mockSession = { user: { id: 'u2', role: 'resident' } }
            vi.mocked(authHelpers.requireResidentSession).mockResolvedValue(mockSession as any)
            vi.mocked(buildingService.joinBuilding).mockResolvedValue({ id: 'b1', name: 'Building 1' } as any)

            const result = await joinBuilding('ABCDEF')

            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data).toEqual({ id: 'b1', name: 'Building 1' })
            }
            expect(buildingService.joinBuilding).toHaveBeenCalledWith('u2', 'ABCDEF')
        })

        it('should handle service errors gracefully', async () => {
            const mockSession = { user: { id: 'u2', role: 'resident' } }
            vi.mocked(authHelpers.requireResidentSession).mockResolvedValue(mockSession as any)
            vi.mocked(buildingService.joinBuilding).mockRejectedValue(new Error('Invalid code'))

            const result = await joinBuilding('INVALID')

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error).toBe('Invalid code')
            }
        })
    })

    describe('getOrCreateManagerBuilding', () => {
        it('should call service with session user id when authorized', async () => {
            const mockSession = {
                user: {
                    id: 'manager-123',
                    role: 'manager'
                }
            }

            // Mock successful manager session
            vi.mocked(authHelpers.requireManagerSession).mockResolvedValue(mockSession as any)

            // Mock service response
            const mockBuilding = { id: 'building-1', name: 'Test Building' }
            vi.mocked(buildingService.getOrCreateManagerBuilding).mockResolvedValue(mockBuilding as any)

            const result = await getOrCreateManagerBuilding()

            expect(authHelpers.requireManagerSession).toHaveBeenCalled()
            expect(buildingService.getOrCreateManagerBuilding).toHaveBeenCalledWith('manager-123')
            expect(result).toEqual(mockBuilding)
        })

        it('should propagate error if not authorized', async () => {
            // Mock unauthorized error
            vi.mocked(authHelpers.requireManagerSession).mockRejectedValue(new Error('Unauthorized: Manager role required'))

            await expect(getOrCreateManagerBuilding()).rejects.toThrow('Unauthorized: Manager role required')

            expect(buildingService.getOrCreateManagerBuilding).not.toHaveBeenCalled()
        })
    })
})
