import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
    createBuildingForManager,
    updateBuilding,
    createApartment,
    deleteApartment,
    bulkCreateApartments,
    getOrCreateManagerBuilding
} from '@/app/actions/building'
import { db } from '@/db'
import { user, building, apartments } from '@/db/schema'

// Mock the database
vi.mock('@/db', () => ({
    db: {
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        transaction: vi.fn((callback) => callback({
            select: vi.fn(),
            insert: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        })),
    },
}))

// Mock nanoid
vi.mock('nanoid', () => ({
    customAlphabet: () => () => '123456',
}))

describe('Building Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('createBuildingForManager', () => {
        it('should create a new building and link it to the manager', async () => {
            const managerId = 'manager-1'
            const newBuilding = {
                id: 'test-uuid',
                name: 'New Building',
                nif: 'N/A',
                code: '123456',
                managerId,
            }

            // Mock insert building
            const insertMock = {
                values: vi.fn().mockReturnThis(),
                returning: vi.fn().mockResolvedValue([newBuilding]),
            }
            vi.mocked(db.insert).mockReturnValue(insertMock as any)

            // Mock update user
            const updateMock = {
                set: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
            }
            vi.mocked(db.update).mockReturnValue(updateMock as any)

            const result = await createBuildingForManager(managerId, 'New Building', null)

            expect(db.insert).toHaveBeenCalledWith(building)
            expect(insertMock.values).toHaveBeenCalledWith(expect.objectContaining({
                name: 'New Building',
                managerId,
                code: '123456'
            }))
            expect(db.update).toHaveBeenCalledWith(user)
            expect(result).toEqual(newBuilding)
        })
    })

    describe('updateBuilding', () => {
        it('should update building details', async () => {
            const buildingId = 'building-1'
            const updateData = { name: 'Updated Name', city: 'City' }
            const updatedBuilding = { id: buildingId, ...updateData }

            const updateMock = {
                set: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                returning: vi.fn().mockResolvedValue([updatedBuilding]),
            }
            vi.mocked(db.update).mockReturnValue(updateMock as any)

            const result = await updateBuilding(buildingId, updateData)

            expect(db.update).toHaveBeenCalledWith(building)
            expect(updateMock.set).toHaveBeenCalledWith(expect.objectContaining(updateData))
            expect(result).toEqual(updatedBuilding)
        })
    })

    describe('createApartment', () => {
        it('should create a new apartment if not exists', async () => {
            const buildingId = 'building-1'
            const unit = '1A'
            const newApt = { id: 1, buildingId, unit }

            // Mock check exists
            const selectMock = {
                from: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue([]),
            }
            vi.mocked(db.select).mockReturnValue(selectMock as any)

            // Mock insert
            const insertMock = {
                values: vi.fn().mockReturnThis(),
                returning: vi.fn().mockResolvedValue([newApt]),
            }
            vi.mocked(db.insert).mockReturnValue(insertMock as any)

            const result = await createApartment(buildingId, unit)

            expect(result).toEqual(newApt)
        })

        it('should throw error if apartment already exists', async () => {
            const buildingId = 'building-1'
            const unit = '1A'

            // Mock check exists
            const selectMock = {
                from: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue([{ id: 1 }]),
            }
            vi.mocked(db.select).mockReturnValue(selectMock as any)

            await expect(createApartment(buildingId, unit)).rejects.toThrow('Apartment already exists')
        })
    })

    describe('deleteApartment', () => {
        it('should delete payments and then apartment', async () => {
            const apartmentId = 1

            const deleteMock = {
                where: vi.fn().mockResolvedValue(undefined),
            }
            vi.mocked(db.delete).mockReturnValue(deleteMock as any)

            await deleteApartment(apartmentId)

            // First call deletes payments
            expect(db.delete).toHaveBeenNthCalledWith(1, expect.anything()) // payments
            // Second call deletes apartments
            expect(db.delete).toHaveBeenNthCalledWith(2, apartments)

            expect(deleteMock.where).toHaveBeenCalledTimes(2)
        })
    })

    describe('bulkCreateApartments', () => {
        it('should create multiple apartments skipping existing ones', async () => {
            const buildingId = 'building-1'
            const unitsString = '1A, 1B'

            // Mock check exists (return empty for both)
            const selectMock = {
                from: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue([]),
            }
            vi.mocked(db.select).mockReturnValue(selectMock as any)

            // Mock insert
            const insertMock = {
                values: vi.fn().mockReturnThis(),
                returning: vi.fn().mockImplementation(() => Promise.resolve([{ id: Math.random() }])),
            }
            vi.mocked(db.insert).mockReturnValue(insertMock as any)

            const result = await bulkCreateApartments(buildingId, unitsString)

            expect(result).toHaveLength(2)
            expect(db.insert).toHaveBeenCalledTimes(2)
        })
    })

    describe('getOrCreateManagerBuilding', () => {
        it('should return existing building if manager has one', async () => {
            const userId = 'manager-1'
            const userNif = '123456789'
            const buildingId = 'building-1'

            // Mock user query
            const userSelectMock = {
                from: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue([{ id: userId, buildingId }]),
            }

            // Mock buildings query
            const buildingsSelectMock = {
                from: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                // This mock is tricky because it's used twice in the function with different chains?
                // Actually `getOrCreateManagerBuilding` calls `db.select().from(user)` then `db.select().from(building)`
            }

            vi.mocked(db.select)
                .mockReturnValueOnce(userSelectMock as any)
                .mockReturnValueOnce({
                    from: vi.fn().mockReturnThis(),
                    where: vi.fn().mockResolvedValue([{ id: buildingId, managerId: userId }])
                } as any)

            const result = await getOrCreateManagerBuilding(userId, userNif)

            expect(result.activeBuilding).toBeDefined()
            expect(result.activeBuilding.id).toBe(buildingId)
        })
    })
})
