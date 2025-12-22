import { describe, it, expect, vi, beforeEach } from 'vitest'

// Hoist the mockDb so it can be used in vi.mock
const { mockDb } = vi.hoisted(() => {
  const mockDb = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    rightJoin: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    transaction: vi.fn((cb) => cb(mockDb)),
  }
  return { mockDb }
})

// Mock the db module
vi.mock('@/db', () => ({
  db: mockDb,
}))

// Mock nanoid
vi.mock('nanoid', () => ({
  customAlphabet: () => () => 'nanoid123',
}))

import {
  createBuildingForManager,
  updateBuilding,
  createApartment,
  updateApartment,
  deleteApartment,
  bulkCreateApartments,
  getOrCreateManagerBuilding
} from '@/app/actions/building'
import { building, apartments, payments } from '@/db/schema'

describe('Manager Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Reset mock returns to return this by default for chainable methods
    mockDb.select.mockReturnThis()
    mockDb.from.mockReturnThis()
    mockDb.where.mockReturnThis()
    mockDb.limit.mockReturnThis()
    mockDb.offset.mockReturnThis()
    mockDb.orderBy.mockReturnThis()
    mockDb.innerJoin.mockReturnThis()
    mockDb.leftJoin.mockReturnThis()
    mockDb.rightJoin.mockReturnThis()
    mockDb.insert.mockReturnThis()
    mockDb.values.mockReturnThis()
    mockDb.returning.mockReturnThis()
    mockDb.update.mockReturnThis()
    mockDb.set.mockReturnThis()
    mockDb.delete.mockReturnThis()
  })

  describe('createBuildingForManager', () => {
    it('should create a new building and link it to the manager', async () => {
      const managerId = 'manager-123'
      const name = 'New Building'
      const nif = '123456789'
      const newBuilding = { id: 'building-new', name, nif, managerId, code: 'nanoid123' }

      mockDb.returning.mockResolvedValueOnce([newBuilding])

      const result = await createBuildingForManager(managerId, name, nif)

      expect(mockDb.insert).toHaveBeenCalledWith(building)
      expect(mockDb.values).toHaveBeenCalledWith(expect.objectContaining({
        name,
        nif,
        managerId,
        code: 'nanoid123'
      }))
      expect(mockDb.update).toHaveBeenCalled() // updates user
      expect(result).toEqual(newBuilding)
    })
  })

  describe('updateBuilding', () => {
    it('should update building details', async () => {
      const buildingId = 'building-123'
      const data = { name: 'Updated Name', city: 'Lisbon' }
      const updatedBuilding = { id: buildingId, ...data }

      mockDb.returning.mockResolvedValueOnce([updatedBuilding])

      const result = await updateBuilding(buildingId, data)

      expect(mockDb.update).toHaveBeenCalledWith(building)
      expect(mockDb.set).toHaveBeenCalledWith(expect.objectContaining({
        ...data,
        updatedAt: expect.any(Date)
      }))
      expect(mockDb.where).toHaveBeenCalled()
      expect(result).toEqual(updatedBuilding)
    })
  })

  describe('createApartment', () => {
    it('should create a new apartment if it does not exist', async () => {
      const buildingId = 'building-123'
      const unit = '1A'

      // First select returns empty (not existing)
      mockDb.limit.mockResolvedValueOnce([])

      // Insert returns new apartment
      const newApt = { id: 1, buildingId, unit }
      mockDb.returning.mockResolvedValueOnce([newApt])

      const result = await createApartment(buildingId, unit)

      expect(mockDb.select).toHaveBeenCalled()
      expect(mockDb.insert).toHaveBeenCalledWith(apartments)
      expect(mockDb.values).toHaveBeenCalledWith({ buildingId, unit })
      expect(result).toEqual(newApt)
    })

    it('should throw error if apartment already exists', async () => {
      const buildingId = 'building-123'
      const unit = '1A'

      // First select returns existing apartment
      mockDb.limit.mockResolvedValueOnce([{ id: 1, buildingId, unit }])

      await expect(createApartment(buildingId, unit)).rejects.toThrow('Apartment already exists')
    })
  })

  describe('updateApartment', () => {
    it('should update apartment details', async () => {
      const apartmentId = 1
      const data = { unit: '1B', floor: 1 }
      const updatedApt = { id: apartmentId, ...data }

      mockDb.returning.mockResolvedValueOnce([updatedApt])

      const result = await updateApartment(apartmentId, data)

      expect(mockDb.update).toHaveBeenCalledWith(apartments)
      expect(mockDb.set).toHaveBeenCalledWith(data)
      expect(result).toEqual(updatedApt)
    })
  })

  describe('deleteApartment', () => {
    it('should delete apartment and related payments', async () => {
      const apartmentId = 1

      await deleteApartment(apartmentId)

      expect(mockDb.delete).toHaveBeenCalledWith(payments)
      expect(mockDb.delete).toHaveBeenCalledWith(apartments)
    })
  })

  describe('bulkCreateApartments', () => {
    it('should create multiple apartments skipping existing ones', async () => {
      const buildingId = 'building-123'
      const unitsString = '1A, 1B'

      // Mock checks for existing
      mockDb.limit
        .mockResolvedValueOnce([]) // 1A not found
        .mockResolvedValueOnce([{ id: 2, unit: '1B' }]) // 1B found

      // Mock insert for 1A
      mockDb.returning.mockResolvedValueOnce([{ id: 1, unit: '1A', buildingId }])

      const result = await bulkCreateApartments(buildingId, unitsString)

      expect(result).toHaveLength(1)
      expect(result[0].unit).toBe('1A')
      expect(mockDb.insert).toHaveBeenCalledTimes(1)
    })
  })

  describe('getOrCreateManagerBuilding', () => {
      it('should return existing building if manager has one', async () => {
          const userId = 'manager-123'
          const userNif = '123'
          const buildingId = 'building-123'

          const userResponse = [{ id: userId, buildingId }]
          const buildingsResponse = [{ id: buildingId, managerId: userId }]

          let callCount = 0
          mockDb.then = vi.fn((resolve) => {
             // console.log(`mockDb.then called: ${callCount}`)
             if (callCount === 0) resolve(userResponse)
             else if (callCount === 1) resolve(buildingsResponse)
             else resolve([])
             callCount++
          }) as any

          const result = await getOrCreateManagerBuilding(userId, userNif)

          expect(result.activeBuilding.id).toBe(buildingId)
          expect(result.buildings).toHaveLength(1)
      })

      it('should create new building if manager has none', async () => {
          const userId = 'manager-123'
          const userNif = '123'

          const userResponse = [{ id: userId, buildingId: null }]
          const buildingsResponse: any[] = []
          const insertResponse = [{ id: 'new-id', managerId: userId }]

          let callCount = 0
          mockDb.then = vi.fn((resolve) => {
             if (callCount === 0) resolve(userResponse) // getUser
             else if (callCount === 1) resolve(buildingsResponse) // getBuildings
             else if (callCount === 2) resolve(insertResponse) // insert building
             else resolve([]) // update user
             callCount++
          }) as any

          const result = await getOrCreateManagerBuilding(userId, userNif)

          expect(result.activeBuilding.id).toBe('new-id')
          expect(mockDb.insert).toHaveBeenCalled()
      })
  })
})
