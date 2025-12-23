import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
    createBuildingForManager,
    updateBuilding,
    createApartment,
    updateApartment,
    deleteApartment,
    bulkCreateApartments
} from '@/app/actions/building'

// Mock dependencies
vi.mock('nanoid', () => ({
    customAlphabet: () => () => 'abcdef'
}))

// Define mockDb factory to avoid hoisting issues
const mockDbMethods = {
    select: vi.fn(),
    from: vi.fn(),
    where: vi.fn(),
    limit: vi.fn(),
    insert: vi.fn(),
    values: vi.fn(),
    update: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    returning: vi.fn(),
    innerJoin: vi.fn(),
    leftJoin: vi.fn(),
    orderBy: vi.fn(),
    then: vi.fn(),
}

// We need to access the mock object in tests, so we import it from the mocked module
// But since we are defining the mock factory, we need to handle the recursive nature properly.

// Best practice for hoisting: define the mock object *inside* the factory or use vi.hoisted.
const { mockDb } = vi.hoisted(() => {
    const methods = {
        select: vi.fn(),
        from: vi.fn(),
        where: vi.fn(),
        limit: vi.fn(),
        insert: vi.fn(),
        values: vi.fn(),
        update: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
        returning: vi.fn(),
        innerJoin: vi.fn(),
        leftJoin: vi.fn(),
        orderBy: vi.fn(),
        then: vi.fn((resolve) => resolve([])),
    }

    // Set up chainable returns
    Object.values(methods).forEach(mock => {
        if (mock !== methods.then) {
            mock.mockReturnValue(methods)
        }
    })

    return { mockDb: methods }
})

vi.mock('@/db', () => ({
    db: mockDb
}))

describe('Manager Building Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Reset chainable returns
        Object.values(mockDb).forEach(mock => {
            if (mock !== mockDb.then) {
                mock.mockReturnValue(mockDb)
            }
        })
        // Reset default resolution
        mockDb.then.mockImplementation((resolve) => resolve([]))
    })

    describe('createBuildingForManager', () => {
        it('should create a building and link it to the manager', async () => {
            const managerId = 'manager-123'
            const name = 'New Condominium'
            const nif = '123456789'
            const newBuilding = { id: 'building-123', name, nif, managerId, code: 'abcdef' }

            // Mock insert returning new building
            // db.insert().values().returning()
            mockDb.returning.mockImplementationOnce(() => Promise.resolve([newBuilding]))

            // Mock update user: db.update().set().where() -> returns nothing/promise
            // Since we use await db.update(...), it calls .then() on the result of .where()
            // .where() returns mockDb.
            // mockDb.then resolves to [] by default.

            const result = await createBuildingForManager(managerId, name, nif)

            expect(mockDb.insert).toHaveBeenCalled()
            expect(mockDb.values).toHaveBeenCalledWith(expect.objectContaining({
                name,
                nif,
                managerId,
                code: 'abcdef'
            }))
            expect(mockDb.returning).toHaveBeenCalled()

            // Verify user update
            expect(mockDb.update).toHaveBeenCalled()
            expect(mockDb.set).toHaveBeenCalledWith({ buildingId: newBuilding.id })

            expect(result).toEqual(newBuilding)
        })
    })

    describe('updateBuilding', () => {
        it('should update building details', async () => {
            const buildingId = 'building-123'
            const data = { name: 'Updated Name', monthlyQuota: 50 }
            const updatedBuilding = { id: buildingId, ...data }

            mockDb.returning.mockImplementationOnce(() => Promise.resolve([updatedBuilding]))

            const result = await updateBuilding(buildingId, data)

            expect(mockDb.update).toHaveBeenCalled()
            expect(mockDb.set).toHaveBeenCalledWith(expect.objectContaining({
                name: 'Updated Name',
                monthlyQuota: 50
            }))
            expect(mockDb.where).toHaveBeenCalled()
            expect(result).toEqual(updatedBuilding)
        })
    })

    describe('createApartment', () => {
        it('should create an apartment if it does not exist', async () => {
            const buildingId = 'building-123'
            const unit = '1A'
            const newApartment = { id: 1, buildingId, unit }

            // Mock existing check (returns empty array)
            mockDb.limit.mockImplementationOnce(() => Promise.resolve([]))

            // Mock insert returning new apartment
            mockDb.returning.mockImplementationOnce(() => Promise.resolve([newApartment]))

            const result = await createApartment(buildingId, unit)

            expect(mockDb.select).toHaveBeenCalled()
            expect(mockDb.insert).toHaveBeenCalled()
            expect(mockDb.values).toHaveBeenCalledWith({ buildingId, unit })
            expect(result).toEqual(newApartment)
        })

        it('should throw error if apartment already exists', async () => {
            const buildingId = 'building-123'
            const unit = '1A'
            const existingApartment = { id: 1, buildingId, unit }

            // Mock existing check (returns existing apartment)
            mockDb.limit.mockImplementationOnce(() => Promise.resolve([existingApartment]))

            await expect(createApartment(buildingId, unit)).rejects.toThrow("Apartment already exists")
            expect(mockDb.insert).not.toHaveBeenCalled()
        })
    })

    describe('updateApartment', () => {
        it('should update apartment details', async () => {
            const apartmentId = 1
            const data = { floor: 2, permillage: 10 }
            const updatedApartment = { id: apartmentId, ...data }

            mockDb.returning.mockImplementationOnce(() => Promise.resolve([updatedApartment]))

            const result = await updateApartment(apartmentId, data)

            expect(mockDb.update).toHaveBeenCalled()
            expect(mockDb.set).toHaveBeenCalledWith(data)
            expect(result).toEqual(updatedApartment)
        })
    })

    describe('deleteApartment', () => {
        it('should delete apartment and related payments', async () => {
            const apartmentId = 1

            // Mock delete payments
            // mockDb.delete called first time
            // mockDb.delete called second time

            await deleteApartment(apartmentId)

            expect(mockDb.delete).toHaveBeenCalledTimes(2)
        })
    })

    describe('bulkCreateApartments', () => {
        it('should create multiple apartments skipping duplicates', async () => {
            const buildingId = 'building-123'
            const unitsString = "1A, 1B"
            const apt1 = { id: 1, buildingId, unit: '1A' }
            const apt2 = { id: 2, buildingId, unit: '1B' }

            // Iteration 1: 1A
            // Check existing: []
            mockDb.limit.mockImplementationOnce(() => Promise.resolve([]))
            // Insert returning
            mockDb.returning.mockImplementationOnce(() => Promise.resolve([apt1]))

            // Iteration 2: 1B
            // Check existing: []
            mockDb.limit.mockImplementationOnce(() => Promise.resolve([]))
            // Insert returning
            mockDb.returning.mockImplementationOnce(() => Promise.resolve([apt2]))

            const result = await bulkCreateApartments(buildingId, unitsString)

            expect(result).toHaveLength(2)
            expect(result).toEqual([apt1, apt2])
            expect(mockDb.insert).toHaveBeenCalledTimes(2)
        })

        it('should skip existing apartments', async () => {
            const buildingId = 'building-123'
            const unitsString = "1A"
            const existingApt = { id: 1, buildingId, unit: '1A' }

            // Check existing: [existingApt]
            mockDb.limit.mockImplementationOnce(() => Promise.resolve([existingApt]))

            const result = await bulkCreateApartments(buildingId, unitsString)

            expect(result).toHaveLength(0)
            expect(mockDb.insert).not.toHaveBeenCalled()
        })
    })
})
