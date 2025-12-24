import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
    createBuildingForManager,
    updateBuilding,
    createApartment,
    deleteApartment,
    getManagerBuildings,
    setActiveBuilding
} from '@/app/actions/building'
import { db } from '@/db'
import * as nanoid from 'nanoid'

// Mock the db
vi.mock('@/db', () => {
    return {
        db: {
            select: vi.fn(),
            insert: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            transaction: vi.fn((callback) => callback({
                select: vi.fn().mockReturnThis(),
                insert: vi.fn().mockReturnThis(),
                update: vi.fn().mockReturnThis(),
                delete: vi.fn().mockReturnThis(),
            }))
        }
    }
})

// Helper to mock chainable db calls
const mockDbChain = (result: any = []) => {
    const chain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue(result),
        then: (resolve: any) => resolve(result)
    };
    return chain;
}

describe('Manager Building Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Reset db mocks
        vi.mocked(db.select).mockReturnValue(mockDbChain([]))
        vi.mocked(db.insert).mockReturnValue(mockDbChain([]))
        vi.mocked(db.update).mockReturnValue(mockDbChain([]))
        vi.mocked(db.delete).mockReturnValue(mockDbChain([]))
    })

    describe('createBuildingForManager', () => {
        it('should create a new building and update user', async () => {
            const managerId = 'manager-123'
            const buildingName = 'Test Building'
            const buildingNif = '123456789'
            const mockBuilding = {
                id: 'test-uuid',
                name: buildingName,
                nif: buildingNif,
                code: '123456',
                managerId
            }

            // Mock nanoid
            vi.mock('nanoid', () => ({
                customAlphabet: () => () => '123456'
            }))

            vi.mocked(db.insert).mockReturnValue(mockDbChain([mockBuilding]))
            vi.mocked(db.update).mockReturnValue(mockDbChain([{ id: managerId }]))

            const result = await createBuildingForManager(managerId, buildingName, buildingNif)

            expect(db.insert).toHaveBeenCalled()
            expect(db.update).toHaveBeenCalled() // Should update user's buildingId
            expect(result).toEqual(mockBuilding)
        })
    })

    describe('updateBuilding', () => {
        it('should update building details', async () => {
            const buildingId = 'building-123'
            const updateData = { name: 'Updated Name', city: 'Lisbon' }
            const mockUpdatedBuilding = { id: buildingId, ...updateData }

            vi.mocked(db.update).mockReturnValue(mockDbChain([mockUpdatedBuilding]))

            const result = await updateBuilding(buildingId, updateData)

            expect(db.update).toHaveBeenCalled()
            expect(result).toEqual(mockUpdatedBuilding)
        })
    })

    describe('createApartment', () => {
        it('should create an apartment if it does not exist', async () => {
            const buildingId = 'building-123'
            const unit = '1A'
            const mockApartment = { id: 1, buildingId, unit }

            // Mock check for existing apartment (return empty)
            vi.mocked(db.select).mockReturnValue(mockDbChain([]))
            // Mock insert
            vi.mocked(db.insert).mockReturnValue(mockDbChain([mockApartment]))

            const result = await createApartment(buildingId, unit)

            expect(db.select).toHaveBeenCalled() // Check existence
            expect(db.insert).toHaveBeenCalled()
            expect(result).toEqual(mockApartment)
        })

        it('should throw error if apartment exists', async () => {
            const buildingId = 'building-123'
            const unit = '1A'

            // Mock check for existing apartment (return existing)
            vi.mocked(db.select).mockReturnValue(mockDbChain([{ id: 1, unit }]))

            await expect(createApartment(buildingId, unit)).rejects.toThrow("Apartment already exists")
        })
    })

    describe('deleteApartment', () => {
        it('should delete apartment and related payments', async () => {
            const apartmentId = 123

            vi.mocked(db.delete).mockReturnValue(mockDbChain([]))

            const result = await deleteApartment(apartmentId)

            expect(db.delete).toHaveBeenCalledTimes(2) // Once for payments, once for apartment
            expect(result).toBe(true)
        })
    })

    describe('getManagerBuildings', () => {
        it('should return list of buildings', async () => {
            const managerId = 'manager-123'
            const mockBuildings = [{ id: 'b1', name: 'B1' }, { id: 'b2', name: 'B2' }]

            vi.mocked(db.select).mockReturnValue(mockDbChain(mockBuildings))

            const result = await getManagerBuildings(managerId)

            expect(db.select).toHaveBeenCalled()
            expect(result).toEqual(mockBuildings)
        })
    })

    describe('setActiveBuilding', () => {
        it('should set active building if owned by manager', async () => {
            const managerId = 'manager-123'
            const buildingId = 'building-123'
            const mockBuilding = { id: buildingId, managerId }

            // Mock finding the building
            vi.mocked(db.select).mockReturnValue(mockDbChain([mockBuilding]))
            // Mock updating user
            vi.mocked(db.update).mockReturnValue(mockDbChain([]))

            const result = await setActiveBuilding(managerId, buildingId)

            expect(db.select).toHaveBeenCalled()
            expect(db.update).toHaveBeenCalled()
            expect(result).toEqual(mockBuilding)
        })

        it('should throw error if building not found or not owned', async () => {
            const managerId = 'manager-123'
            const buildingId = 'building-123'

            // Mock finding the building (empty)
            vi.mocked(db.select).mockReturnValue(mockDbChain([]))

            await expect(setActiveBuilding(managerId, buildingId)).rejects.toThrow("Building not found or not owned by manager")
        })
    })
})
