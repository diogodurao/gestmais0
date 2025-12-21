import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createApartment, updateApartment, deleteApartment, bulkCreateApartments } from '@/app/actions/building'
import { db } from '@/db'

// Mock the db instance
vi.mock('@/db', () => {
  return {
    db: {
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }
  }
})

describe('Apartment CRUD Actions', () => {
  const buildingId = 'test-building-id'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createApartment', () => {
    it('should create a new apartment', async () => {
      const data = { floor: '1', unitType: 'T2', identifier: 'Esq', permillage: 10 }
      const mockApt = { id: 1, ...data, buildingId }

      // Mock checking for existing apartment (return empty)
      const selectMock = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([])
          })
        })
      })
      ;(db.select as any) = selectMock

      // Mock insertion
      const insertMock = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockApt])
        })
      })
      ;(db.insert as any) = insertMock

      const result = await createApartment(buildingId, data)

      expect(result).toEqual(mockApt)
    })

    it('should throw error if apartment already exists', async () => {
        const data = { floor: '1', unitType: 'T2', identifier: 'Esq' }

        // Mock checking for existing apartment (return existing)
        const selectMock = vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([{ id: 1 }])
            })
          })
        })
        ;(db.select as any) = selectMock

        await expect(createApartment(buildingId, data)).rejects.toThrow("Unit already exists on this floor")
      })
  })

  describe('updateApartment', () => {
    it('should update apartment details', async () => {
      const aptId = 1
      const data = { unitType: 'T3' }
      const mockUpdatedApt = { id: aptId, ...data }

      const updateMock = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedApt])
          })
        })
      })
      ;(db.update as any) = updateMock

      const result = await updateApartment(aptId, data)

      expect(result).toEqual(mockUpdatedApt)
    })
  })

  describe('deleteApartment', () => {
    it('should delete apartment and related payments', async () => {
      const aptId = 1

      const deleteMock = vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue({})
      })
      ;(db.delete as any) = deleteMock

      const result = await deleteApartment(aptId)

      expect(result).toBe(true)
      expect(db.delete).toHaveBeenCalledTimes(2) // Once for payments, once for apartments
    })
  })

  describe('bulkCreateApartments', () => {
    it('should create multiple apartments if they do not exist', async () => {
        const units = [
            { floor: '1', unitType: 'T2', identifier: 'A' },
            { floor: '1', unitType: 'T2', identifier: 'B' }
        ]
        const mockCreatedUnits = units.map((u, i) => ({ id: i + 1, ...u, buildingId }))

        // Mock select to return empty for both checks
        const selectMock = vi.fn().mockReturnValue({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([])
                })
            })
        })
        ;(db.select as any) = selectMock

        // Mock insert
        const insertMock = vi.fn()
        insertMock.mockReturnValueOnce({
            values: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([mockCreatedUnits[0]])
            })
        })
        insertMock.mockReturnValueOnce({
            values: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([mockCreatedUnits[1]])
            })
        })
        ;(db.insert as any) = insertMock

        const result = await bulkCreateApartments(buildingId, units)

        expect(result).toHaveLength(2)
        expect(db.insert).toHaveBeenCalledTimes(2)
    })
  })
})
