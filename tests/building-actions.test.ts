import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
    createBuildingForManager,
    updateBuilding,
    createApartment,
    bulkCreateApartments,
    updateApartment,
    deleteApartment,
    getOrCreateManagerBuilding
} from '@/app/actions/building'
import { db } from '@/db'

// Mock the database
vi.mock('@/db', () => ({
    db: {
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
}))

// Mock nanoid
vi.mock('nanoid', () => ({
    customAlphabet: () => () => '123456',
}))

describe('Manager Building Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('createBuildingForManager', () => {
        it('should create a new building and update the user', async () => {
            const managerId = 'manager-123'
            const name = 'New Building'
            const nif = '123456789'
            const newBuilding = { id: 'test-uuid', name, nif, code: '123456', managerId }

            // Mock db.insert().values().returning()
            const returningMock = vi.fn().mockResolvedValue([newBuilding])
            const valuesMock = vi.fn().mockReturnValue({ returning: returningMock })

            // @ts-ignore
            db.insert.mockReturnValue({ values: valuesMock })

            // Mock db.update().set().where()
            const whereMock = vi.fn().mockResolvedValue([])
            const setMock = vi.fn().mockReturnValue({ where: whereMock })
            // @ts-ignore
            db.update.mockReturnValue({ set: setMock })

            const result = await createBuildingForManager(managerId, name, nif)

            expect(db.insert).toHaveBeenCalled()
            expect(db.update).toHaveBeenCalled()
            expect(result).toEqual(newBuilding)
        })
    })

    describe('updateBuilding', () => {
        it('should update building details', async () => {
            const buildingId = 'building-123'
            const data = { name: 'Updated Name', monthlyQuota: 100 }
            const updatedBuilding = { id: buildingId, ...data }

            // Mock db.update().set().where().returning()
            const returningMock = vi.fn().mockResolvedValue([updatedBuilding])
            const whereMock = vi.fn().mockReturnValue({ returning: returningMock })
            const setMock = vi.fn().mockReturnValue({ where: whereMock })
            // @ts-ignore
            db.update.mockReturnValue({ set: setMock })

            const result = await updateBuilding(buildingId, data)

            expect(db.update).toHaveBeenCalled()
            expect(result).toEqual(updatedBuilding)
        })
    })

    describe('createApartment', () => {
        it('should create a new apartment if it does not exist', async () => {
            const buildingId = 'building-123'
            const unit = '1A'
            const newApartment = { id: 1, buildingId, unit }

            // Mock existence check: db.select().from().where().limit()
            const limitMock = vi.fn().mockResolvedValue([])
            const whereMock = vi.fn().mockReturnValue({ limit: limitMock })
            const fromMock = vi.fn().mockReturnValue({ where: whereMock })
            // @ts-ignore
            db.select.mockReturnValue({ from: fromMock })

            // Mock db.insert().values().returning()
            const returningMock = vi.fn().mockResolvedValue([newApartment])
            const valuesMock = vi.fn().mockReturnValue({ returning: returningMock })
            // @ts-ignore
            db.insert.mockReturnValue({ values: valuesMock })

            const result = await createApartment(buildingId, unit)

            expect(result).toEqual(newApartment)
        })

        it('should throw error if apartment already exists', async () => {
            const buildingId = 'building-123'
            const unit = '1A'

            // Mock existence check returning result
            const limitMock = vi.fn().mockResolvedValue([{ id: 1 }])
            const whereMock = vi.fn().mockReturnValue({ limit: limitMock })
            const fromMock = vi.fn().mockReturnValue({ where: whereMock })
            // @ts-ignore
            db.select.mockReturnValue({ from: fromMock })

            await expect(createApartment(buildingId, unit)).rejects.toThrow("Apartment already exists")
        })
    })

    describe('bulkCreateApartments', () => {
        it('should create multiple apartments', async () => {
            const buildingId = 'building-123'
            const unitsString = '1A, 1B'

            // Mock existence check (always empty for this test)
            const limitMock = vi.fn().mockResolvedValue([])
            const whereMock = vi.fn().mockReturnValue({ limit: limitMock })
            const fromMock = vi.fn().mockReturnValue({ where: whereMock })
            // @ts-ignore
            db.select.mockReturnValue({ from: fromMock })

            // Mock db.insert().values().returning()
            const returningMock = vi.fn().mockImplementation(() => Promise.resolve([{ id: Math.random() }]))
            const valuesMock = vi.fn().mockReturnValue({ returning: returningMock })
            // @ts-ignore
            db.insert.mockReturnValue({ values: valuesMock })

            const result = await bulkCreateApartments(buildingId, unitsString)

            expect(result).toHaveLength(2)
            expect(db.insert).toHaveBeenCalledTimes(2)
        })
    })

    describe('updateApartment', () => {
        it('should update apartment details', async () => {
            const apartmentId = 1
            const data = { unit: '1C', floor: 1 }
            const updatedApartment = { id: apartmentId, ...data }

            // Mock db.update().set().where().returning()
            const returningMock = vi.fn().mockResolvedValue([updatedApartment])
            const whereMock = vi.fn().mockReturnValue({ returning: returningMock })
            const setMock = vi.fn().mockReturnValue({ where: whereMock })
            // @ts-ignore
            db.update.mockReturnValue({ set: setMock })

            const result = await updateApartment(apartmentId, data)

            expect(result).toEqual(updatedApartment)
        })
    })

    describe('deleteApartment', () => {
        it('should delete apartment and related payments', async () => {
            const apartmentId = 1

            // Mock db.delete().where()
            const whereMock = vi.fn().mockResolvedValue([])
            // @ts-ignore
            db.delete.mockReturnValue({ where: whereMock })

            const result = await deleteApartment(apartmentId)

            expect(db.delete).toHaveBeenCalledTimes(2) // Once for payments, once for apartments
            expect(result).toBe(true)
        })
    })

    describe('getOrCreateManagerBuilding', () => {
        it('should return existing building if user has one', async () => {
            const userId = 'user-123'
            const userNif = '123'
            const buildingId = 'building-123'
            const userMock = { id: userId, buildingId }
            const buildingMock = { id: buildingId, managerId: userId }

            // Mock user fetch
            const limitMockUser = vi.fn().mockResolvedValue([userMock])
            const whereMockUser = vi.fn().mockReturnValue({ limit: limitMockUser })

            // Mock buildings fetch
            // db.select().from(user) ... and db.select().from(building) ...
            // We need to differentiate calls. Since select() returns a builder, we can chain mocks.
            // But db.select() is called multiple times.

            // A simple way is to mock implementation of select or chain
            // Let's rely on call order or inspection of arguments if needed,
            // but for simplicity with vitest mocks we can mock return values in sequence if they are the same chain structure.
            // However, the structure is slightly different.
            // 1. db.select().from(user).where().limit()
            // 2. db.select().from(building).where()

            const fromMock = vi.fn()
            // @ts-ignore
            db.select.mockReturnValue({ from: fromMock })

            // First call: from(user) -> where -> limit
            const limitMock = vi.fn()
            const whereMock = vi.fn()

            // Logic to handle different table selects
            fromMock.mockImplementation((table) => {
                // We can't easily check table identity if it's an object from schema import
                // But we can check if it has properties we know
                return {
                    where: whereMock
                }
            })

            whereMock.mockImplementation(() => {
                return {
                    limit: limitMock,
                    // If it's the building query, it doesn't have limit(). But the code calls .where() and expects a promise-like array?
                    // "const currentBuildings = await db.select().from(building).where(eq(building.managerId, userId))"
                    // It awaits the result of where(). So where() should return a promise (thenable)
                    then: (resolve: any) => resolve([buildingMock]),
                    // It is also iterable? No, await handles the promise.
                }
            })

            limitMock.mockResolvedValue([userMock])

            // Re-setup more robust mocks for this specific test
            // @ts-ignore
            db.select.mockReturnValue({
                 from: vi.fn().mockImplementation((table) => {
                     return {
                         where: vi.fn().mockImplementation(() => {
                             // This is tricky because we have two calls with different return types (array vs array with limit)
                             // Let's look at the function:
                             // 1. await db.select().from(user).where(...).limit(1)
                             // 2. await db.select().from(building).where(...)

                             const mockPromise: any = Promise.resolve([buildingMock])
                             mockPromise.limit = vi.fn().mockResolvedValue([userMock])
                             return mockPromise
                         })
                     }
                 })
            })

            const result = await getOrCreateManagerBuilding(userId, userNif)

            expect(result.activeBuilding).toEqual(buildingMock)
        })
    })
})
