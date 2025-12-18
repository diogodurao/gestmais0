import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Create mocks inside the factory or use hoited variables if needed,
// but easier to just define the object structure inside the mock factory.

const mockDbMethods = {
    select: vi.fn(),
    from: vi.fn(),
    where: vi.fn(),
    limit: vi.fn(),
    innerJoin: vi.fn(),
    leftJoin: vi.fn(),
    orderBy: vi.fn(),
    insert: vi.fn(),
    values: vi.fn(),
    returning: vi.fn(),
    update: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
}

// Make them chainable by default
Object.keys(mockDbMethods).forEach(key => {
    mockDbMethods[key].mockReturnThis()
})

// We need to export this so we can access it in tests
// But vi.mock is hoisted, so we can't access local variables.
// The solution is to import the mocked module in the test.

vi.mock('@/db', () => {
    const methods: any = {
        select: vi.fn(),
        from: vi.fn(),
        where: vi.fn(),
        limit: vi.fn(),
        innerJoin: vi.fn(),
        leftJoin: vi.fn(),
        orderBy: vi.fn(),
        insert: vi.fn(),
        values: vi.fn(),
        returning: vi.fn(),
        update: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
    }

    // Setup chainable return
    Object.values(methods).forEach((fn: any) => fn.mockReturnValue(methods))

    return {
        db: methods
    }
})

// Mock nanoid
vi.mock('nanoid', () => ({
    customAlphabet: () => () => 'mock-code-123',
}))

// Mock schema imports
vi.mock('@/db/schema', () => ({
    building: { id: 'building_id', managerId: 'manager_id', code: 'code', nif: 'nif' },
    user: { id: 'user_id', buildingId: 'building_id', role: 'role', name: 'name', email: 'email', profileComplete: 'profile_complete', updatedAt: 'updated_at' },
    apartments: { id: 'apartments_id', buildingId: 'building_id', unit: 'unit', residentId: 'resident_id' },
    payments: { id: 'payments_id', apartmentId: 'apartment_id' },
}))

// Import the actions AFTER mocking
import * as buildingActions from '@/app/actions/building'
import { db } from '@/db' // This will be the mocked version

describe('Manager Operations', () => {

    // Type checking helper
    const mockDb = db as any

    beforeEach(() => {
        vi.clearAllMocks()
        // Reset default chainable behavior
        Object.values(mockDb).forEach((fn: any) => fn.mockReturnValue(mockDb))
    })

    describe('createBuildingForManager', () => {
        it('should create a building and update the user', async () => {
            const managerId = 'manager-1'
            const name = 'New Building'
            const nif = '123456789'

            const newBuilding = { id: 'b-1', name, nif, code: 'mock-code-123', managerId }

            // Mock returning to resolve to [newBuilding]
            mockDb.returning.mockResolvedValue([newBuilding])

            // Mock where for the update to resolve (usually update doesn't return unless returning is called,
            // but here we might have `await db.update...`)
            // In the code: await db.update(user).set(...).where(...)
            // where returns a Promise in the real Drizzle if not chained further.
            mockDb.where.mockResolvedValue(undefined)

            const result = await buildingActions.createBuildingForManager(managerId, name, nif)

            expect(mockDb.insert).toHaveBeenCalled()
            expect(mockDb.values).toHaveBeenCalledWith(expect.objectContaining({
                name,
                nif,
                managerId
            }))
            expect(mockDb.update).toHaveBeenCalled()
            expect(result).toEqual(newBuilding)
        })
    })

    describe('updateBuilding', () => {
        it('should update building details', async () => {
            const buildingId = 'b-1'
            const data = { name: 'Updated Name', city: 'Lisbon' }
            const updatedBuilding = { id: buildingId, ...data }

            // returning resolves to [updatedBuilding]
            mockDb.returning.mockResolvedValue([updatedBuilding])

            const result = await buildingActions.updateBuilding(buildingId, data)

            expect(mockDb.update).toHaveBeenCalled()
            expect(mockDb.set).toHaveBeenCalledWith(expect.objectContaining(data))
            expect(result).toEqual(updatedBuilding)
        })
    })

    describe('bulkCreateApartments', () => {
        it('should create multiple apartments skipping existing ones', async () => {
            const buildingId = 'b-1'
            const unitsString = 'Unit A, Unit B'

            // Mock limit to return empty array (meaning no existing apartment)
            mockDb.limit.mockResolvedValue([])

            // Mock returning to return the created apartment
            // Since it's a loop, we need to handle sequential calls.

            // Logic:
            // 1. select()...limit(1) -> []
            // 2. insert()...returning() -> [aptA]
            // 3. select()...limit(1) -> []
            // 4. insert()...returning() -> [aptB]

            mockDb.limit
                .mockResolvedValueOnce([]) // Check Unit A
                .mockResolvedValueOnce([]) // Check Unit B

            mockDb.returning
                .mockResolvedValueOnce([{ id: 1, unit: 'Unit A', buildingId }])
                .mockResolvedValueOnce([{ id: 2, unit: 'Unit B', buildingId }])

            const result = await buildingActions.bulkCreateApartments(buildingId, unitsString)

            expect(result).toHaveLength(2)
            expect(result[0].unit).toBe('Unit A')
            expect(result[1].unit).toBe('Unit B')
        })
    })

    describe('updateApartment', () => {
        it('should update apartment details', async () => {
            const apartmentId = 1
            const data = { floor: 2, permillage: 10 }
            const updatedApt = { id: apartmentId, ...data }

            mockDb.returning.mockResolvedValue([updatedApt])

            const result = await buildingActions.updateApartment(apartmentId, data)

            expect(mockDb.update).toHaveBeenCalled()
            expect(mockDb.set).toHaveBeenCalledWith(data)
            expect(result).toEqual(updatedApt)
        })
    })

    describe('deleteApartment', () => {
        it('should delete payments and then the apartment', async () => {
            const apartmentId = 1

            // where resolves to undefined (end of chain)
            mockDb.where.mockResolvedValue(undefined)

            await buildingActions.deleteApartment(apartmentId)

            // Should be called twice: once for payments, once for apartment
            expect(mockDb.delete).toHaveBeenCalledTimes(2)
        })
    })
})
