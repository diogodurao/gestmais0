import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
    createApartment,
    updateApartment,
    deleteApartment,
    bulkCreateApartments,
    createNewBuilding,
    updateBuilding,
    getOrCreateManagerBuilding
} from '@/app/actions/building'
import { db } from '@/db'
import { building, apartments, payments, managerBuildings, user } from '@/db/schema'

// Mock the db module
vi.mock('@/db', () => {
    const mockChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        // then is a mock function we can configure per test
        then: vi.fn(),
    }
    return { db: mockChain }
})

describe('Manager Building Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('createApartment', () => {
        it('should create an apartment successfully', async () => {
            const buildingId = 'b1'
            const data = {
                floor: '1',
                unitType: 'T2',
                identifier: 'A',
                permillage: 10
            }

            const dbMock = db as any

            // 1. Check existing (empty)
            // 2. Insert (return created)
            dbMock.then
                .mockImplementationOnce((resolve: any) => resolve([]))
                .mockImplementationOnce((resolve: any) => resolve([{ id: 1, ...data, buildingId }]))

            const result = await createApartment(buildingId, data)

            expect(result).toEqual({ id: 1, ...data, buildingId })
            expect(dbMock.insert).toHaveBeenCalledWith(apartments)
            expect(dbMock.values).toHaveBeenCalledWith({
                buildingId,
                floor: data.floor,
                unitType: data.unitType,
                identifier: data.identifier,
                permillage: data.permillage,
            })
        })

        it('should throw error if required fields are missing', async () => {
            await expect(createApartment('b1', {
                floor: '',
                unitType: 'T2',
                identifier: 'A'
            })).rejects.toThrow("Missing required fields")
        })

        it('should throw error if apartment already exists', async () => {
            const buildingId = 'b1'
            const data = {
                floor: '1',
                unitType: 'T2',
                identifier: 'A'
            }

            const dbMock = db as any
            // Existing found
            dbMock.then.mockImplementationOnce((resolve: any) => resolve([ { id: 1 } ]))

            await expect(createApartment(buildingId, data)).rejects.toThrow("Unit already exists on this floor")
        })
    })

    describe('updateApartment', () => {
        it('should update an apartment successfully', async () => {
            const apartmentId = 1
            const data = { unitType: 'T3' }

            const dbMock = db as any
            dbMock.then.mockImplementationOnce((resolve: any) => resolve([{ id: 1, ...data }]))

            const result = await updateApartment(apartmentId, data)

            expect(result).toEqual({ id: 1, ...data })
            expect(dbMock.update).toHaveBeenCalledWith(apartments)
            expect(dbMock.set).toHaveBeenCalledWith(data)
        })
    })

    describe('deleteApartment', () => {
        it('should delete an apartment and related payments', async () => {
            const apartmentId = 1

            const dbMock = db as any
            // delete payments
            dbMock.then.mockImplementationOnce((resolve: any) => resolve(undefined))
            // delete apartment
            dbMock.then.mockImplementationOnce((resolve: any) => resolve(undefined))

            const result = await deleteApartment(apartmentId)

            expect(result).toBe(true)
            expect(dbMock.delete).toHaveBeenCalledTimes(2)
        })
    })

    describe('bulkCreateApartments', () => {
        it('should create multiple apartments skipping existing ones', async () => {
            const buildingId = 'b1'
            const units = [
                { floor: '1', unitType: 'T2', identifier: 'A' },
                { floor: '1', unitType: 'T2', identifier: 'B' }
            ]

            const dbMock = db as any

            // Unit 1: Check existing (empty), Insert (success)
            // Unit 2: Check existing (found), skip

            dbMock.then
                .mockImplementationOnce((resolve: any) => resolve([])) // U1 check
                .mockImplementationOnce((resolve: any) => resolve([{ id: 1, ...units[0] }])) // U1 insert
                .mockImplementationOnce((resolve: any) => resolve([{ id: 2 }])) // U2 check (exists)

            const result = await bulkCreateApartments(buildingId, units)

            expect(result).toHaveLength(1)
            expect(result[0]).toEqual({ id: 1, ...units[0] })
        })

        it('should throw error if no units provided', async () => {
             await expect(bulkCreateApartments('b1', [])).rejects.toThrow("No units provided")
        })
    })

    describe('createNewBuilding', () => {
        it('should create a new building and assign manager', async () => {
            const userId = 'u1'
            const name = 'New Condominium'
            const nif = '123456789'

            const dbMock = db as any

            // insert building
            dbMock.then.mockImplementationOnce((resolve: any) => resolve([{ id: 'b1', name, nif, managerId: userId }]))
            // insert managerBuildings
            dbMock.then.mockImplementationOnce((resolve: any) => resolve(undefined))
            // update user active building
            dbMock.then.mockImplementationOnce((resolve: any) => resolve(undefined))

            const result = await createNewBuilding(userId, name, nif)

            expect(result).toEqual({ id: 'b1', name, nif, managerId: userId })
            expect(dbMock.insert).toHaveBeenCalledWith(building)
            expect(dbMock.insert).toHaveBeenCalledWith(managerBuildings)
            expect(dbMock.update).toHaveBeenCalledWith(user)
        })
    })

    describe('updateBuilding', () => {
        it('should update building details', async () => {
            const buildingId = 'b1'
            const data = { name: 'Updated Name', monthlyQuota: 50 }

            const dbMock = db as any
            dbMock.then.mockImplementationOnce((resolve: any) => resolve([{ id: buildingId, ...data }]))

            const result = await updateBuilding(buildingId, data)

            expect(result).toMatchObject(data)
            expect(dbMock.update).toHaveBeenCalledWith(building)
        })
    })

    describe('getOrCreateManagerBuilding', () => {
        it('should return existing active building', async () => {
            const userId = 'u1'
            const userNif = '123'

            const dbMock = db as any

            // 1. Get User
            dbMock.then.mockImplementationOnce((resolve: any) => resolve([{ id: userId, activeBuildingId: 'b1' }]))
            // 2. Get Building
            dbMock.then.mockImplementationOnce((resolve: any) => resolve([{ id: 'b1', name: 'Existing' }]))

            const result = await getOrCreateManagerBuilding(userId, userNif)
            expect(result).toEqual({ id: 'b1', name: 'Existing' })
        })

        it('should create new building if user has none', async () => {
             const userId = 'u1'
             const userNif = '123'

             const dbMock = db as any

             // 1. Get User (no active building)
             dbMock.then.mockImplementationOnce((resolve: any) => resolve([{ id: userId, activeBuildingId: null }]))
             // 2. Check managed buildings (none)
             dbMock.then.mockImplementationOnce((resolve: any) => resolve([]))
             // 3. Insert building
             dbMock.then.mockImplementationOnce((resolve: any) => resolve([{ id: 'new-b', nif: userNif }]))
             // 4. Insert junction
             dbMock.then.mockImplementationOnce((resolve: any) => resolve(undefined))
             // 5. Update user
             dbMock.then.mockImplementationOnce((resolve: any) => resolve(undefined))

             const result = await getOrCreateManagerBuilding(userId, userNif)
             expect(result).toEqual({ id: 'new-b', nif: userNif })
        })
    })
})
