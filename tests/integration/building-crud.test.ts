import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as buildingActions from '@/app/actions/building'
import { db } from '@/db'

// Mock the DB
vi.mock('@/db', () => {
  return {
    db: {
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
    }
  }
})

// Mock nanoid
vi.mock('nanoid', () => {
  return {
    customAlphabet: () => () => '123456'
  }
})

// Mock crypto
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid'
  }
})

describe('Building Actions CRUD', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Helper to create a chainable mock object
  const createChainableMock = () => {
    const mock: any = {}
    mock.from = vi.fn().mockReturnValue(mock)
    mock.where = vi.fn().mockReturnValue(mock)
    mock.limit = vi.fn().mockReturnValue(mock)
    mock.innerJoin = vi.fn().mockReturnValue(mock)
    mock.leftJoin = vi.fn().mockReturnValue(mock)
    mock.orderBy = vi.fn().mockReturnValue(mock)
    mock.returning = vi.fn().mockReturnValue(mock)
    mock.set = vi.fn().mockReturnValue(mock)
    mock.values = vi.fn().mockReturnValue(mock)

    // Mocking promise behavior for await
    mock.then = (resolve: any) => resolve([])

    return mock
  }

  describe('getOrCreateManagerBuilding', () => {
    it('should return existing building if manager has one', async () => {
      const mockUser = { id: 'user-1', buildingId: 'b-1' }
      const mockBuilding = { id: 'b-1', managerId: 'user-1', name: 'Existing' }

      const selectMock = vi.fn()
      // First call for user, second for building
      selectMock
        .mockReturnValueOnce({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([mockUser])
                })
            })
        })
        .mockReturnValueOnce({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue([mockBuilding])
            })
        })

      vi.mocked(db.select).mockImplementation(selectMock)

      const result = await buildingActions.getOrCreateManagerBuilding('user-1', '123456789')
      expect(result.activeBuilding).toEqual(mockBuilding)
      expect(result.buildings).toEqual([mockBuilding])
    })

    it('should create a new building if manager has none', async () => {
      const mockUser = { id: 'user-1', buildingId: null }

      const selectMock = vi.fn()
      // First call for user, second for building (empty)
      selectMock
        .mockReturnValueOnce({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([mockUser])
                })
            })
        })
        .mockReturnValueOnce({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue([])
            })
        })

      vi.mocked(db.select).mockImplementation(selectMock)

      const mockNewBuilding = { id: 'test-uuid', name: 'My Condominium', managerId: 'user-1' }

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockNewBuilding])
        })
      } as any)

      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue({})
        })
      } as any)

      const result = await buildingActions.getOrCreateManagerBuilding('user-1', '123456789')
      expect(result.activeBuilding).toEqual(mockNewBuilding)
    })
  })

  describe('createApartment', () => {
    it('should create an apartment if it does not exist', async () => {
      const selectMock = vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue([]) // No existing apartment
              })
          })
      })
      vi.mocked(db.select).mockImplementation(selectMock)

      const mockNewApartment = { id: 1, buildingId: 'b-1', unit: '1A' }
      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockNewApartment])
        })
      } as any)

      const result = await buildingActions.createApartment('b-1', '1A')
      expect(result).toEqual(mockNewApartment)
    })

    it('should throw error if apartment exists', async () => {
       const selectMock = vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue([{ id: 1 }]) // Existing
              })
          })
      })
      vi.mocked(db.select).mockImplementation(selectMock)

      await expect(buildingActions.createApartment('b-1', '1A')).rejects.toThrow('Apartment already exists')
    })
  })

  describe('updateApartment', () => {
    it('should update apartment details', async () => {
      const mockUpdated = { id: 1, unit: '1B', floor: 1, permillage: 10 }

      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdated])
          })
        })
      } as any)

      const result = await buildingActions.updateApartment(1, { unit: '1B', floor: 1, permillage: 10 })
      expect(result).toEqual(mockUpdated)
    })
  })

  describe('deleteApartment', () => {
    it('should delete apartment and related payments', async () => {
      vi.mocked(db.delete).mockReturnValue({
        where: vi.fn().mockResolvedValue({})
      } as any)

      const result = await buildingActions.deleteApartment(1)
      expect(result).toBe(true)
      expect(db.delete).toHaveBeenCalledTimes(2) // Once for payments, once for apartment
    })
  })

  describe('updateBuilding', () => {
    it('should update building details', async () => {
        const mockUpdated = { id: 'b-1', name: 'Updated Name' }

        vi.mocked(db.update).mockReturnValue({
            set: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([mockUpdated])
                })
            })
        } as any)

        const result = await buildingActions.updateBuilding('b-1', { name: 'Updated Name' })
        expect(result).toEqual(mockUpdated)
    })
  })

  describe('bulkCreateApartments', () => {
    it('should create multiple apartments skipping existing ones', async () => {
        const selectMock = vi.fn()
        // First check (1A) - exists
        selectMock.mockReturnValueOnce({
             from: vi.fn().mockReturnValue({
                 where: vi.fn().mockReturnValue({
                     limit: vi.fn().mockResolvedValue([{ id: 1 }])
                 })
             })
        })
        // Second check (1B) - does not exist
        .mockReturnValueOnce({
             from: vi.fn().mockReturnValue({
                 where: vi.fn().mockReturnValue({
                     limit: vi.fn().mockResolvedValue([])
                 })
             })
        })

        vi.mocked(db.select).mockImplementation(selectMock)

        const mockNewApartment = { id: 2, buildingId: 'b-1', unit: '1B' }
        vi.mocked(db.insert).mockReturnValue({
            values: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([mockNewApartment])
            })
        } as any)

        const result = await buildingActions.bulkCreateApartments('b-1', '1A, 1B')
        expect(result).toHaveLength(1)
        expect(result[0]).toEqual(mockNewApartment)
        expect(db.insert).toHaveBeenCalledTimes(1)
    })
  })
})
