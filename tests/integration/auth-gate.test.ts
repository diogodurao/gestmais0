import { describe, it, expect, vi, beforeEach } from 'vitest'
import { joinBuilding, createNewBuilding } from '@/app/actions/building'
import { db } from '@/db'

// Mock DB
vi.mock('@/db', () => ({
  db: {
    select: vi.fn(() => ({
        from: vi.fn(() => ({
            where: vi.fn(() => ({
                limit: vi.fn().mockResolvedValue([])
            }))
        })),
        innerJoin: vi.fn(() => ({
            where: vi.fn(() => ({
                limit: vi.fn().mockResolvedValue([])
            }))
        }))
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn().mockResolvedValue([{ id: 'test-user-id' }])
      }))
    })),
    insert: vi.fn(() => ({
        values: vi.fn(() => ({
            returning: vi.fn().mockResolvedValue([{ id: 'new-building-id', code: '123456', subscriptionStatus: 'incomplete' }])
        }))
    }))
  }
}))

describe('Auth Flow & Gates', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should prevent joining a building with incomplete subscription', async () => {
        // Mock finding building
        const mockSelect = vi.mocked(db.select)
        mockSelect.mockReturnValue({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([{
                        id: 'building-incomplete',
                        code: 'code123',
                        subscriptionStatus: 'incomplete'
                    }])
                })
            })
        } as any)

        await expect(joinBuilding('user-1', 'code123'))
            .rejects.toThrow('This building is not accepting residents at this time')
    })

    it('should allow joining a building with active subscription', async () => {
        const mockSelect = vi.mocked(db.select)
        mockSelect.mockReturnValue({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([{
                        id: 'building-active',
                        code: 'code123',
                        subscriptionStatus: 'active'
                    }])
                })
            })
        } as any)

        const result = await joinBuilding('user-1', 'code123')
        expect(result.id).toBe('building-active')
        expect(db.update).toHaveBeenCalled()
    })

    it('createNewBuilding should create building with incomplete status', async () => {
        const building = await createNewBuilding('manager-1', 'My Building', '123456789')
        expect(building.subscriptionStatus).toBe('incomplete')
    })
})
