import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getOrCreateManagerBuilding } from '../building'
import { buildingService } from '@/services/building.service'
import * as authHelpers from '@/lib/auth-helpers'

// Mock dependencies
vi.mock('@/services/building.service', () => ({
    buildingService: {
        getOrCreateManagerBuilding: vi.fn()
    }
}))

vi.mock('@/lib/auth-helpers', () => ({
    requireManagerSession: vi.fn(),
    requireSession: vi.fn(),
    requireBuildingAccess: vi.fn(),
    requireResidentSession: vi.fn()
}))

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn()
}))

describe('getOrCreateManagerBuilding Server Action', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

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
