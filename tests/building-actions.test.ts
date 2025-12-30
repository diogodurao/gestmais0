import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createNewBuilding,
  getOrCreateManagerBuilding,
  createApartment,
  deleteApartment,
  bulkCreateApartments,
  getManagerBuildings
} from '@/app/actions/building'
import { db } from '@/db'
import { auth } from '@/lib/auth'

// Mock the database
vi.mock('@/db', () => {
  const mockDb: any = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    from: vi.fn(),
    where: vi.fn(),
    limit: vi.fn(),
    innerJoin: vi.fn(),
    leftJoin: vi.fn(),
    orderBy: vi.fn(),
    values: vi.fn(),
    set: vi.fn(),
    returning: vi.fn().mockResolvedValue([]),
    // Mock then for await
    then: (resolve: any) => resolve([]),
  }

  // Set up chainable returns
  mockDb.select.mockReturnThis()
  mockDb.from.mockReturnThis()
  mockDb.where.mockReturnThis()
  mockDb.limit.mockReturnThis()
  mockDb.innerJoin.mockReturnThis()
  mockDb.leftJoin.mockReturnThis()
  mockDb.orderBy.mockReturnThis()
  mockDb.values.mockReturnThis()
  mockDb.set.mockReturnThis()

  // Transaction calls callback with the mockDb itself
  mockDb.transaction = vi.fn((callback: any) => callback(mockDb))

  return { db: mockDb }
})

describe('Manager Building Actions', () => {
  const userId = 'user-123'

  beforeEach(() => {
    vi.clearAllMocks()

    // We need to re-apply the mock return values because clearAllMocks() might clear implementation details
    // if not configured carefully, but here we just reset call history mostly.
    // However, to be safe and ensure clean state:
    const mockDb = db as any
    mockDb.select.mockReturnThis()
    mockDb.from.mockReturnThis()
    mockDb.where.mockReturnThis()
    mockDb.limit.mockReturnThis()
    mockDb.innerJoin.mockReturnThis()
    mockDb.leftJoin.mockReturnThis()
    mockDb.orderBy.mockReturnThis()
    mockDb.values.mockReturnThis()
    mockDb.set.mockReturnThis()
    mockDb.returning.mockResolvedValue([])
  })

  describe('getOrCreateManagerBuilding', () => {
    it('should return existing active building', async () => {
      const mockBuilding = { id: 'b-1', name: 'Existing Building' }
      const mockUser = { id: userId, activeBuildingId: 'b-1' }

      const mockDb = db as any
      // Mock user query
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            limit: vi.fn().mockResolvedValueOnce([mockUser])
          })
        })
      })

      // Mock building query
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            limit: vi.fn().mockResolvedValueOnce([mockBuilding])
          })
        })
      })

      const result = await getOrCreateManagerBuilding(userId, '123456789')
      expect(result).toEqual(mockBuilding)
    })

    it('should create new building if user has none', async () => {
      const mockUser = { id: userId, activeBuildingId: null }
      const newBuilding = { id: 'uuid-1234-5678', name: 'My Condominium', code: 'fixed_id_12345' }

      const mockDb = db as any
      // User query
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            limit: vi.fn().mockResolvedValueOnce([mockUser])
          })
        })
      })

      // Existing managed buildings query (empty)
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          innerJoin: vi.fn().mockReturnValueOnce({
            where: vi.fn().mockReturnValueOnce({
              limit: vi.fn().mockResolvedValueOnce([])
            })
          })
        })
      })

      // Insert building
      mockDb.insert.mockReturnValueOnce({
        values: vi.fn().mockReturnValueOnce({
          returning: vi.fn().mockResolvedValueOnce([newBuilding])
        })
      })

      // Insert junction
      mockDb.insert.mockReturnValueOnce({
        values: vi.fn().mockResolvedValueOnce(undefined)
      })

      // Update user
      mockDb.update.mockReturnValueOnce({
        set: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockResolvedValueOnce(undefined)
        })
      })

      const result = await getOrCreateManagerBuilding(userId, '123456789')
      expect(result).toEqual(newBuilding)
      expect(mockDb.insert).toHaveBeenCalledTimes(2)
      expect(mockDb.update).toHaveBeenCalledTimes(1)
    })
  })

  describe('createNewBuilding', () => {
    it('should create a new building and set as active', async () => {
      const newBuilding = { id: 'uuid-1234-5678', name: 'New Condominium', code: 'fixed_id_12345' }
      const mockDb = db as any

      mockDb.insert.mockReturnValueOnce({
        values: vi.fn().mockReturnValueOnce({
          returning: vi.fn().mockResolvedValueOnce([newBuilding])
        })
      })

      mockDb.insert.mockReturnValueOnce({
        values: vi.fn().mockResolvedValueOnce(undefined)
      })

      mockDb.update.mockReturnValueOnce({
        set: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockResolvedValueOnce(undefined)
        })
      })

      const result = await createNewBuilding(userId, 'New Condominium', '123456789')
      expect(result).toEqual(newBuilding)
    })
  })

  describe('getManagerBuildings', () => {
    it('should return list of managed buildings', async () => {
      const mockResult = [
        { building: { id: 'b-1', name: 'B1' }, isOwner: true },
        { building: { id: 'b-2', name: 'B2' }, isOwner: false }
      ]

      const mockDb = db as any
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          innerJoin: vi.fn().mockReturnValueOnce({
            where: vi.fn().mockResolvedValueOnce(mockResult)
          })
        })
      })

      const result = await getManagerBuildings(userId)
      expect(result).toEqual(mockResult)
    })
  })

  describe('createApartment', () => {
    it('should create an apartment if it does not exist', async () => {
      const buildingId = 'b-1'
      const aptData = { floor: '1', unitType: 'T2', identifier: 'E' }
      const newApt = { id: 1, ...aptData, buildingId }

      const mockDb = db as any
      // Check existing
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            limit: vi.fn().mockResolvedValueOnce([])
          })
        })
      })

      // Insert
      mockDb.insert.mockReturnValueOnce({
        values: vi.fn().mockReturnValueOnce({
          returning: vi.fn().mockResolvedValueOnce([newApt])
        })
      })

      const result = await createApartment(buildingId, aptData)
      expect(result).toEqual(newApt)
    })

    it('should throw error if apartment exists', async () => {
      const buildingId = 'b-1'
      const aptData = { floor: '1', unitType: 'T2', identifier: 'E' }

      const mockDb = db as any
      // Check existing
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            limit: vi.fn().mockResolvedValueOnce([{ id: 1 }])
          })
        })
      })

      await expect(createApartment(buildingId, aptData)).rejects.toThrow("Unit already exists on this floor")
    })
  })

  describe('deleteApartment', () => {
    it('should delete payments and then the apartment', async () => {
      const aptId = 1
      const mockDb = db as any

      // Delete payments
      mockDb.delete.mockReturnValueOnce({
        where: vi.fn().mockResolvedValueOnce(undefined)
      })

      // Delete apartment
      mockDb.delete.mockReturnValueOnce({
        where: vi.fn().mockResolvedValueOnce(undefined)
      })

      const result = await deleteApartment(aptId)
      expect(result).toBe(true)
      expect(mockDb.delete).toHaveBeenCalledTimes(2)
    })
  })

  describe('bulkCreateApartments', () => {
    it('should create multiple apartments skipping existing ones', async () => {
      const buildingId = 'b-1'
      const units = [
        { floor: '1', unitType: 'T2', identifier: 'E' },
        { floor: '1', unitType: 'T2', identifier: 'D' }
      ]

      const mockDb = db as any

      // First unit - exists
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            limit: vi.fn().mockResolvedValueOnce([{ id: 1 }])
          })
        })
      })

      // Second unit - does not exist
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            limit: vi.fn().mockResolvedValueOnce([])
          })
        })
      })

      // Insert second unit
      mockDb.insert.mockReturnValueOnce({
        values: vi.fn().mockReturnValueOnce({
          returning: vi.fn().mockResolvedValueOnce([{ id: 2, ...units[1], buildingId }])
        })
      })

      const result = await bulkCreateApartments(buildingId, units)
      expect(result).toHaveLength(1)
      expect(result[0].identifier).toBe('D')
    })
  })
})
