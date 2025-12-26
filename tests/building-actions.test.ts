import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createNewBuilding,
  getOrCreateManagerBuilding,
  createApartment,
  updateApartment,
  deleteApartment,
  bulkCreateApartments
} from '@/app/actions/building'
import { mockDb } from './setup'
import { building, managerBuildings, user, apartments, payments } from '@/db/schema'

describe('Building Actions (Manager CRUD)', () => {

  describe('createNewBuilding', () => {
    it('should create a new building and manager association', async () => {
      // Setup
      const userId = 'user-1'
      const name = 'New Building'
      const nif = '123456789'

      // Mock db.insert(building).values(...).returning()
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{
            id: 'building-1',
            name,
            nif,
            code: '123456',
            managerId: userId
          }])
        })
      } as any)

      // Mock db.insert(managerBuildings).values(...)
      // Note: we are mocking the module, and db.insert is a function that returns an object with methods.
      // Since createNewBuilding calls db.insert twice, we need to handle that.

      const insertMock = vi.fn()
      mockDb.insert = insertMock as any

      // 1. Building insert
      insertMock.mockReturnValueOnce({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{
            id: 'building-1',
            name,
            nif,
            code: '123456',
            managerId: userId
          }])
        })
      })

      // 2. Manager buildings insert
      insertMock.mockReturnValueOnce({
        values: vi.fn().mockResolvedValue({})
      })

      // Mock db.update(user).set(...).where(...)
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue({})
        })
      } as any)

      // Execute
      const result = await createNewBuilding(userId, name, nif)

      // Verify
      expect(result).toEqual({
        id: 'building-1',
        name,
        nif,
        code: '123456',
        managerId: userId
      })

      // Verify calls
      expect(mockDb.insert).toHaveBeenCalledTimes(2) // building + managerBuildings
      expect(mockDb.update).toHaveBeenCalledWith(user)
    })
  })

  describe('getOrCreateManagerBuilding', () => {
    it('should create a new building if manager has none', async () => {
      const userId = 'user-1'
      const userNif = '999999999'

      // Mock user lookup
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: userId, activeBuildingId: null }])
          })
        })
      } as any)

      // Mock existing managed buildings lookup (return empty)
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([])
            })
          })
        })
      } as any)

      // We need to override the mocks specifically because of multiple selects
      // But mockDeep returns a new mock for each call unless configured otherwise.
      // Or we can use `mockImplementation` or rely on the order.
      // A better way with Drizzle mocks is complex. Let's try to mock the chain precisely.

      const selectMock = vi.fn()
      mockDb.select = selectMock as any

      // 1. User lookup
      const userQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: userId, activeBuildingId: null }])
      }

      // 2. Existing managed buildings
      const managedBuildingsQuery = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([])
      }

      selectMock
        .mockReturnValueOnce(userQuery) // User check
        .mockReturnValueOnce(managedBuildingsQuery) // Manager buildings check

      // Mock Inserts
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{
            id: 'building-new',
            name: 'My Condominium',
            nif: userNif,
            code: '123456',
            managerId: userId
          }])
        })
      } as any)

       // Mock db.insert(managerBuildings).values(...)
       // Note: createNewBuilding also calls insert, so we might need to be careful which one we are mocking if we reused createNewBuilding?
       // No, getOrCreateManagerBuilding calls db.insert directly.

      // Mock Update
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue({})
        })
      } as any)

      const result = await getOrCreateManagerBuilding(userId, userNif)

      expect(result.id).toBe('building-new')
    })
  })

  describe('createApartment', () => {
    it('should create an apartment if not exists', async () => {
      const buildingId = 'b-1'
      const data = {
        floor: '1',
        unitType: 'apartment',
        identifier: 'A',
        permillage: 10
      }

      // Mock check existing
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]) // No existing
          })
        })
      } as any)

      // Mock insert
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ ...data, id: 1, buildingId }])
        })
      } as any)

      const result = await createApartment(buildingId, data)
      expect(result).toEqual({ ...data, id: 1, buildingId })
    })

    it('should throw if apartment exists', async () => {
        const buildingId = 'b-1'
        const data = {
          floor: '1',
          unitType: 'apartment',
          identifier: 'A'
        }

        // Mock check existing
        mockDb.select.mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([{ id: 1 }]) // Exists
            })
          })
        } as any)

        await expect(createApartment(buildingId, data)).rejects.toThrow("Unit already exists on this floor")
      })
  })

  describe('updateApartment', () => {
      it('should update apartment details', async () => {
          const aptId = 1
          const data = { identifier: 'B' }

          mockDb.update.mockReturnValue({
              set: vi.fn().mockReturnValue({
                  where: vi.fn().mockReturnValue({
                      returning: vi.fn().mockResolvedValue([{ id: aptId, identifier: 'B' }])
                  })
              })
          } as any)

          const result = await updateApartment(aptId, data)
          expect(result.identifier).toBe('B')
      })
  })

  describe('deleteApartment', () => {
      it('should delete payments and then apartment', async () => {
          const aptId = 1

          mockDb.delete.mockReturnValue({
              where: vi.fn().mockResolvedValue({})
          } as any)

          const result = await deleteApartment(aptId)

          expect(result).toBe(true)
          // Should be called twice (payments, apartments)
          expect(mockDb.delete).toHaveBeenCalledTimes(2)
          expect(mockDb.delete).toHaveBeenCalledWith(payments)
          expect(mockDb.delete).toHaveBeenCalledWith(apartments)
      })
  })

  describe('bulkCreateApartments', () => {
      it('should create multiple apartments skipping existing ones', async () => {
          const buildingId = 'b-1'
          const units = [
              { floor: '1', unitType: 'apt', identifier: 'A' },
              { floor: '1', unitType: 'apt', identifier: 'B' }
          ]

          const selectMock = vi.fn()
          mockDb.select = selectMock as any

          // 1. Check A (exists)
          selectMock.mockReturnValueOnce({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([{ id: 1 }])
                })
            })
          })

          // 2. Check B (not exists)
          selectMock.mockReturnValueOnce({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([])
                })
            })
          })

          // Mock insert
          mockDb.insert.mockReturnValue({
            values: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([{ id: 2, ...units[1] }])
            })
          } as any)

          const result = await bulkCreateApartments(buildingId, units)

          expect(result).toHaveLength(1)
          expect(result[0].identifier).toBe('B')
      })
  })
})
