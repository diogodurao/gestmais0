import { describe, it, expect, vi, beforeEach } from 'vitest'

// We cannot use local variables in the factory unless they are also hoisted or defined inside.
// To share state, we can use a helper or just define it inside and access it via the module mock (if we could import it back).

// Best approach for Vitest:
// 1. Mock the module to return an object we control.
// 2. Import that object in the test file (it will be the mocked one).

vi.mock('@/db', () => {
    const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        transaction: vi.fn((cb) => cb(mockDb)),
    }
    return {
        db: mockDb
    }
})

// Import the mocked module
import { db } from '@/db'
import {
  createNewBuilding,
  getOrCreateManagerBuilding,
  updateBuilding,
  createApartment,
  updateApartment,
  deleteApartment,
  bulkCreateApartments,
} from '@/app/actions/building'
import { building, managerBuildings, apartments, payments, user } from '@/db/schema'

// Mock authentication
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}))

describe('Manager Building Actions', () => {
  const userId = 'user-123'
  const userNif = '123456789'

  beforeEach(() => {
    vi.clearAllMocks()

    // Reset chain
    const mockDb = db as any
    mockDb.select.mockReturnThis()
    mockDb.from.mockReturnThis()
    mockDb.where.mockReturnThis()
    mockDb.limit.mockReturnThis()
    mockDb.insert.mockReturnThis()
    mockDb.values.mockReturnThis()
    mockDb.returning.mockReturnThis()
    mockDb.update.mockReturnThis()
    mockDb.set.mockReturnThis()
    mockDb.delete.mockReturnThis()
  })

  describe('getOrCreateManagerBuilding', () => {
    it('should return existing active building', async () => {
      const mockDb = db as any
      mockDb.limit
        .mockResolvedValueOnce([{ id: userId, activeBuildingId: 'build-1' }]) // User query
        .mockResolvedValueOnce([{ id: 'build-1', name: 'Existing Building' }]) // Building query

      const result = await getOrCreateManagerBuilding(userId, userNif)
      expect(result).toEqual({ id: 'build-1', name: 'Existing Building' })
    })

    it('should create new building if none exists', async () => {
      const mockDb = db as any
      mockDb.limit.mockResolvedValueOnce([{ id: userId, activeBuildingId: null }])
      mockDb.limit.mockResolvedValueOnce([])
      mockDb.returning.mockResolvedValueOnce([{ id: 'new-build', name: 'My Condominium' }])

      const result = await getOrCreateManagerBuilding(userId, userNif)

      expect(result).toEqual({ id: 'new-build', name: 'My Condominium' })
      expect(mockDb.insert).toHaveBeenCalledWith(building)
      expect(mockDb.insert).toHaveBeenCalledWith(managerBuildings)
      expect(mockDb.update).toHaveBeenCalledWith(user)
    })
  })

  describe('createNewBuilding', () => {
    it('should create a new building', async () => {
      const mockDb = db as any
      mockDb.returning.mockResolvedValueOnce([{ id: 'new-build-2', name: 'Another Building' }])

      const result = await createNewBuilding(userId, 'Another Building', '987654321')
      expect(result).toEqual({ id: 'new-build-2', name: 'Another Building' })
      expect(mockDb.insert).toHaveBeenCalledWith(building)
      expect(mockDb.insert).toHaveBeenCalledWith(managerBuildings)
    })
  })

  describe('updateBuilding', () => {
    it('should update building details', async () => {
      const mockDb = db as any
      const updateData = { name: 'Updated Name', city: 'New City' }
      mockDb.returning.mockResolvedValueOnce([{ id: 'build-1', ...updateData }])

      const result = await updateBuilding('build-1', updateData)
      expect(result).toEqual({ id: 'build-1', ...updateData })
      expect(mockDb.update).toHaveBeenCalledWith(building)
    })
  })

  describe('Apartment CRUD', () => {
    const buildingId = 'build-1'

    it('should create an apartment', async () => {
      const mockDb = db as any
      const aptData = { floor: '1', unitType: 'T2', identifier: 'Left' }

      mockDb.limit.mockResolvedValueOnce([])
      mockDb.returning.mockResolvedValueOnce([{ id: 1, ...aptData, buildingId }])

      const result = await createApartment(buildingId, aptData)
      expect(result).toEqual({ id: 1, ...aptData, buildingId })
      expect(mockDb.insert).toHaveBeenCalledWith(apartments)
    })

    it('should fail if apartment already exists', async () => {
      const mockDb = db as any
      const aptData = { floor: '1', unitType: 'T2', identifier: 'Left' }
      mockDb.limit.mockResolvedValueOnce([{}])

      await expect(createApartment(buildingId, aptData)).rejects.toThrow('Unit already exists on this floor')
    })

    it('should update an apartment', async () => {
      const mockDb = db as any
      const aptData = { identifier: 'Right' }
      mockDb.returning.mockResolvedValueOnce([{ id: 1, ...aptData }])

      const result = await updateApartment(1, aptData)
      expect(result).toEqual({ id: 1, ...aptData })
      expect(mockDb.update).toHaveBeenCalledWith(apartments)
    })

    it('should delete an apartment', async () => {
      const mockDb = db as any
      const result = await deleteApartment(1)
      expect(result).toBe(true)
      expect(mockDb.delete).toHaveBeenCalledWith(payments)
      expect(mockDb.delete).toHaveBeenCalledWith(apartments)
    })

    it('should bulk create apartments skipping duplicates', async () => {
        const mockDb = db as any
        const units = [
            { floor: '1', unitType: 'T2', identifier: 'A' },
            { floor: '1', unitType: 'T2', identifier: 'B' }
        ]

        // Loop runs twice.
        // Iteration 1:
        // check existing: select().from().where().limit(1) -> []
        // insert: insert().values().returning() -> [{id: 1, ...}]

        // Iteration 2:
        // check existing: select().from().where().limit(1) -> [{id: 2}]
        // insert: skipped

        // Mocking sequences:

        // Iteration 1 Limit (check)
        mockDb.limit.mockResolvedValueOnce([])
        // Iteration 1 Where (check)
        mockDb.where.mockReturnValueOnce(mockDb)

        // Iteration 1 Returning (insert)
        mockDb.returning.mockResolvedValueOnce([{ id: 1, ...units[0], buildingId }])

        // Iteration 2 Limit (check)
        mockDb.limit.mockResolvedValueOnce([{ id: 2, ...units[1] }])
        // Iteration 2 Where (check)
        mockDb.where.mockReturnValueOnce(mockDb)

        // Iteration 2 Insert should NOT happen.

        const result = await bulkCreateApartments(buildingId, units)

        expect(result).toHaveLength(1)
        expect(result[0].identifier).toBe('A')
        expect(mockDb.insert).toHaveBeenCalledTimes(1)
    })
  })
})
