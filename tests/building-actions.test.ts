import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
    createNewBuilding,
    updateBuilding,
    createApartment,
    updateApartment,
    deleteApartment,
    bulkCreateApartments,
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
    }
}))

// Mock auth
vi.mock('@/lib/auth', () => ({
    auth: {
        api: {
            getSession: vi.fn()
        }
    }
}))

// Mock nanoid
vi.mock('nanoid', () => ({
    customAlphabet: () => () => '123456'
}))

describe('Manager CRUD Operations', () => {
    const mockUserId = 'user-123'
    const mockBuildingId = 'building-123'

    beforeEach(() => {
        vi.clearAllMocks()

        // Setup default mock returns for chaining
        const mockReturn = {
            from: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockReturnThis(),
            innerJoin: vi.fn().mockReturnThis(),
            leftJoin: vi.fn().mockReturnThis(),
            set: vi.fn().mockReturnThis(),
            values: vi.fn().mockReturnThis(),
            returning: vi.fn().mockResolvedValue([]),
            then: function(callback: any) { return Promise.resolve(this.returning()).then(callback) } // naive promise mock
        }

        // We need a more robust mock chain for Drizzle
        const createMockChain = (returnValue: any = []) => {
            const chain: any = {
                from: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                limit: vi.fn().mockReturnThis(),
                orderBy: vi.fn().mockReturnThis(),
                innerJoin: vi.fn().mockReturnThis(),
                leftJoin: vi.fn().mockReturnThis(),
                set: vi.fn().mockReturnThis(),
                values: vi.fn().mockReturnThis(),
                returning: vi.fn().mockResolvedValue(returnValue),
            }
            // Add promise behavior
            chain.then = (resolve: any, reject: any) => Promise.resolve(returnValue).then(resolve, reject)
            return chain
        }

        // Default implementation for db methods
        vi.mocked(db.select).mockReturnValue(createMockChain([]))
        vi.mocked(db.insert).mockReturnValue(createMockChain([]))
        vi.mocked(db.update).mockReturnValue(createMockChain([]))
        vi.mocked(db.delete).mockReturnValue(createMockChain([]))
    })

    describe('Building Operations', () => {
        it('should create a new building', async () => {
            const newBuilding = {
                id: 'test-uuid',
                name: 'New Building',
                nif: '123456789',
                code: '123456',
                managerId: mockUserId
            }

            // Mock insert return
            const insertChain = {
                values: vi.fn().mockReturnThis(),
                returning: vi.fn().mockResolvedValue([newBuilding]),
                then: (r: any) => Promise.resolve([newBuilding]).then(r)
            }
            vi.mocked(db.insert).mockReturnValue(insertChain as any)

            // Mock update for setting active building
            const updateChain = {
                set: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                then: (r: any) => Promise.resolve([]).then(r)
            }
            vi.mocked(db.update).mockReturnValue(updateChain as any)

            const result = await createNewBuilding(mockUserId, 'New Building', '123456789')

            expect(db.insert).toHaveBeenCalledTimes(2) // Building + ManagerBuildings
            expect(db.update).toHaveBeenCalledTimes(1) // User active building
            expect(result).toEqual(newBuilding)
        })

        it('should update a building', async () => {
            const updatedBuilding = {
                id: mockBuildingId,
                name: 'Updated Name',
                nif: '987654321',
                updatedAt: new Date()
            }

            const updateChain = {
                set: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                returning: vi.fn().mockResolvedValue([updatedBuilding]),
                then: (r: any) => Promise.resolve([updatedBuilding]).then(r)
            }
            vi.mocked(db.update).mockReturnValue(updateChain as any)

            const result = await updateBuilding(mockBuildingId, { name: 'Updated Name', nif: '987654321' })

            expect(db.update).toHaveBeenCalled()
            expect(result).toEqual(updatedBuilding)
        })

        it('should get or create manager building (existing user w/ active building)', async () => {
            const mockUser = { id: mockUserId, activeBuildingId: mockBuildingId }
            const mockBuilding = { id: mockBuildingId, name: 'My Building' }

            // Mock finding user
            const userQuery = {
                from: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue([mockUser]),
                then: (r: any) => Promise.resolve([mockUser]).then(r)
            }
            vi.mocked(db.select).mockReturnValueOnce(userQuery as any)

            // Mock finding building
            const buildingQuery = {
                from: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue([mockBuilding]),
                then: (r: any) => Promise.resolve([mockBuilding]).then(r)
            }
            vi.mocked(db.select).mockReturnValueOnce(buildingQuery as any)

            const result = await getOrCreateManagerBuilding(mockUserId, '123')
            expect(result).toEqual(mockBuilding)
        })
    })

    describe('Apartment Operations', () => {
        it('should create an apartment', async () => {
            const newApartment = {
                id: 1,
                buildingId: mockBuildingId,
                floor: '1',
                unitType: 'apartment',
                identifier: 'A',
                permillage: 10
            }

            // Mock existing check (empty)
            const existingQuery = {
                from: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue([]),
                then: (r: any) => Promise.resolve([]).then(r)
            }
            vi.mocked(db.select).mockReturnValueOnce(existingQuery as any)

            // Mock insert
            const insertChain = {
                values: vi.fn().mockReturnThis(),
                returning: vi.fn().mockResolvedValue([newApartment]),
                then: (r: any) => Promise.resolve([newApartment]).then(r)
            }
            vi.mocked(db.insert).mockReturnValue(insertChain as any)

            const result = await createApartment(mockBuildingId, {
                floor: '1',
                unitType: 'apartment',
                identifier: 'A',
                permillage: 10
            })

            expect(result).toEqual(newApartment)
        })

        it('should fail creating duplicate apartment', async () => {
             // Mock existing check (found)
             const existingQuery = {
                from: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue([{ id: 1 }]),
                then: (r: any) => Promise.resolve([{ id: 1 }]).then(r)
            }
            vi.mocked(db.select).mockReturnValueOnce(existingQuery as any)

            await expect(createApartment(mockBuildingId, {
                floor: '1',
                unitType: 'apartment',
                identifier: 'A'
            })).rejects.toThrow("Unit already exists on this floor")
        })

        it('should update an apartment', async () => {
            const updatedApt = { id: 1, floor: '2' }

            const updateChain = {
                set: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                returning: vi.fn().mockResolvedValue([updatedApt]),
                then: (r: any) => Promise.resolve([updatedApt]).then(r)
            }
            vi.mocked(db.update).mockReturnValue(updateChain as any)

            const result = await updateApartment(1, { floor: '2' })
            expect(result).toEqual(updatedApt)
        })

        it('should delete an apartment', async () => {
             const deleteChain = {
                where: vi.fn().mockReturnThis(),
                then: (r: any) => Promise.resolve([]).then(r)
            }
            vi.mocked(db.delete).mockReturnValue(deleteChain as any)

            const result = await deleteApartment(1)

            expect(db.delete).toHaveBeenCalledTimes(2) // Payments + Apartment
            expect(result).toBe(true)
        })

        it('should bulk create apartments', async () => {
             // Mock existing check (empty for all)
             // Since bulkCreate calls select in a loop, we mock it generally
             const selectChain = {
                from: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue([]),
                then: (r: any) => Promise.resolve([]).then(r)
             }
             vi.mocked(db.select).mockReturnValue(selectChain as any)

             const newApt = { id: 1 }
             const insertChain = {
                values: vi.fn().mockReturnThis(),
                returning: vi.fn().mockResolvedValue([newApt]),
                then: (r: any) => Promise.resolve([newApt]).then(r)
             }
             vi.mocked(db.insert).mockReturnValue(insertChain as any)

             const units = [
                 { floor: '1', identifier: 'A', unitType: 'apartment' },
                 { floor: '1', identifier: 'B', unitType: 'apartment' }
             ]

             const result = await bulkCreateApartments(mockBuildingId, units)

             expect(result).toHaveLength(2)
             expect(db.insert).toHaveBeenCalledTimes(2)
        })
    })
})
