import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createNewBuilding, getOrCreateManagerBuilding, updateBuilding } from '@/app/actions/building'
import { db } from '@/db'

// Mock the db instance
vi.mock('@/db', () => {
  return {
    db: {
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      transaction: vi.fn(),
    }
  }
})

describe('Manager Building Actions', () => {
  const userId = 'test-user-id'
  const userNif = '123456789'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createNewBuilding', () => {
    it('should create a new building and assign it to the manager', async () => {
      // Setup mocks
      const mockBuilding = { id: 'new-building-id', name: 'New Building', nif: '123456789' }

      const insertMock = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockBuilding])
        })
      })

      const updateMock = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue({})
        })
      })

      // Use `as any` to override typescript checks on mocked object
      ;(db.insert as any) = insertMock
      ;(db.update as any) = updateMock

      const result = await createNewBuilding(userId, 'New Building', userNif)

      expect(result).toEqual(mockBuilding)
      expect(db.insert).toHaveBeenCalledTimes(2) // 1 for building, 1 for managerBuildings
      expect(db.update).toHaveBeenCalledTimes(1) // 1 for user activeBuildingId
    })
  })

  describe('getOrCreateManagerBuilding', () => {
    it('should return existing active building if set', async () => {
      // Mock finding user with active building
      const mockUser = { id: userId, activeBuildingId: 'active-building-id' }
      const mockBuilding = { id: 'active-building-id', name: 'Active Building' }

      const selectMock = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockImplementation((n) => {
                // If checking user (first call usually)
                if (selectMock.mock.calls.length === 1) return Promise.resolve([mockUser])
                // If checking building
                return Promise.resolve([mockBuilding])
            })
          })
        }),
        innerJoin: vi.fn().mockReturnThis(),
      })

      ;(db.select as any) = selectMock

      const result = await getOrCreateManagerBuilding(userId, userNif)

      expect(result).toEqual(mockBuilding)
    })

    it('should create a new building if manager has none', async () => {
      // Mock user with no active building and no managed buildings
      const mockUser = { id: userId, activeBuildingId: null }
      const mockNewBuilding = { id: 'new-building-id', name: 'My Condominium' }

      // Setup chainable mocks
      const selectMock = vi.fn()
      // First call: check user
      selectMock.mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue([mockUser])
              })
          })
      })

      // Second call: check existing managed buildings (return empty)
      selectMock.mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
              innerJoin: vi.fn().mockReturnValue({
                  where: vi.fn().mockReturnValue({
                      limit: vi.fn().mockResolvedValue([])
                  })
              })
          })
      })

      ;(db.select as any) = selectMock

      const insertMock = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockNewBuilding])
        })
      })

      const updateMock = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue({})
        })
      })

      ;(db.insert as any) = insertMock
      ;(db.update as any) = updateMock

      const result = await getOrCreateManagerBuilding(userId, userNif)

      expect(result).toEqual(mockNewBuilding)
    })
  })

  describe('updateBuilding', () => {
    it('should update building details', async () => {
      const buildingId = 'building-id'
      const updateData = { name: 'Updated Name', city: 'Lisbon' }
      const mockUpdatedBuilding = { id: buildingId, ...updateData }

      const updateMock = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedBuilding])
          })
        })
      })

      ;(db.update as any) = updateMock

      const result = await updateBuilding(buildingId, updateData)

      expect(result).toEqual(mockUpdatedBuilding)
      expect(db.update).toHaveBeenCalledWith(expect.anything()) // We can check specific table if we import schema
    })
  })
})
