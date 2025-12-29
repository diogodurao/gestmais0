import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
    createApartment,
    updateApartment,
    deleteApartment,
    bulkCreateApartments,
    getOrCreateManagerBuilding,
    createNewBuilding,
    updateBuilding
} from '@/app/actions/building'
import { db } from '@/db'
import { building, user, apartments, payments, managerBuildings } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'

// Mock db
vi.mock('@/db', () => {
    const mockDb: any = {
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        transaction: vi.fn(),
    }
    mockDb.transaction.mockImplementation((cb: any) => cb(mockDb))
    return { db: mockDb }
})

// Mock nanoid
vi.mock('nanoid', () => ({
    customAlphabet: () => () => '123456',
}))

describe('Building Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks()

        // Setup chainable mocks
        // Since we are reusing the same db mock object (mockDb defined in factory),
        // we need to make sure we attach the mock return values to the globally imported db object
        // because that is what is used in the tests to verify calls.
        // Actually, the 'db' imported here IS the mockDb object.

        const createChainableMock = (resolvedValue: any) => {
            return {
                from: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                limit: vi.fn().mockReturnThis(),
                innerJoin: vi.fn().mockReturnThis(),
                leftJoin: vi.fn().mockReturnThis(),
                orderBy: vi.fn().mockReturnThis(),
                set: vi.fn().mockReturnThis(),
                values: vi.fn().mockReturnThis(),
                returning: vi.fn().mockReturnValue(Promise.resolve(resolvedValue)),
                then: (resolve: any) => resolve(resolvedValue),
            }
        }

        // Reset default behaviors
        vi.mocked(db.select).mockReturnThis()
        vi.mocked(db.insert).mockReturnThis()
        vi.mocked(db.update).mockReturnThis()
        vi.mocked(db.delete).mockReturnThis()
    })

    describe('Apartment CRUD', () => {
        it('should create an apartment', async () => {
            // Mock empty existing apartment
            const selectMock = {
                from: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue([]), // No existing apartment
            }
            vi.mocked(db.select).mockReturnValue(selectMock as any)

            // Mock insert return
            const newApt = { id: 1, floor: '1', identifier: 'A' }
            const insertMock = {
                values: vi.fn().mockReturnThis(),
                returning: vi.fn().mockResolvedValue([newApt]),
            }
            vi.mocked(db.insert).mockReturnValue(insertMock as any)

            const result = await createApartment('b1', {
                floor: '1',
                unitType: 'T1',
                identifier: 'A'
            })

            expect(result).toEqual(newApt)
            expect(db.insert).toHaveBeenCalledWith(apartments)
        })

        it('should update an apartment', async () => {
            const updatedApt = { id: 1, floor: '2' }
            const updateMock = {
                set: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                returning: vi.fn().mockResolvedValue([updatedApt]),
            }
            vi.mocked(db.update).mockReturnValue(updateMock as any)

            const result = await updateApartment(1, { floor: '2' })

            expect(result).toEqual(updatedApt)
            expect(db.update).toHaveBeenCalledWith(apartments)
        })

        it('should delete an apartment and its payments', async () => {
            // Mock deletes
            const deleteMock = {
                where: vi.fn().mockResolvedValue(undefined),
            }
            vi.mocked(db.delete).mockReturnValue(deleteMock as any)

            const result = await deleteApartment(1)

            expect(result).toBe(true)
            // Should verify order or that both were called.
            // db.delete called twice?
            expect(db.delete).toHaveBeenCalledTimes(2)
            expect(db.delete).toHaveBeenCalledWith(payments)
            expect(db.delete).toHaveBeenCalledWith(apartments)
        })

        it('should bulk create apartments', async () => {
             // Mock select to return empty (no duplicates)
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

            const units = [
                { floor: '1', unitType: 'T1', identifier: 'A' },
                { floor: '1', unitType: 'T1', identifier: 'B' }
            ]

            const result = await bulkCreateApartments('b1', units)

            expect(result).toHaveLength(2)
            expect(db.insert).toHaveBeenCalledTimes(2)
        })
    })

    describe('Manager Building Operations', () => {
        it('should create new building for manager', async () => {
             // Mock insert
             const newBuilding = { id: 'b1', code: '123456' }
             const insertMock = {
                 values: vi.fn().mockReturnThis(),
                 returning: vi.fn().mockResolvedValue([newBuilding]),
             }
             vi.mocked(db.insert).mockReturnValue(insertMock as any)

             // Mock update user
             const updateMock = {
                 set: vi.fn().mockReturnThis(),
                 where: vi.fn().mockResolvedValue(undefined),
             }
             vi.mocked(db.update).mockReturnValue(updateMock as any)

             const result = await createNewBuilding('u1', 'New Building', '123456789')

             expect(result).toEqual(newBuilding)
             expect(db.insert).toHaveBeenCalledWith(building)
             expect(db.insert).toHaveBeenCalledWith(managerBuildings)
             expect(db.update).toHaveBeenCalledWith(user)
        })

        it('should update building details', async () => {
            const updatedBuilding = { id: 'b1', name: 'Updated' }
            const updateMock = {
                set: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                returning: vi.fn().mockResolvedValue([updatedBuilding]),
            }
            vi.mocked(db.update).mockReturnValue(updateMock as any)

            const result = await updateBuilding('b1', { name: 'Updated' })

            expect(result).toEqual(updatedBuilding)
        })
    })
})
