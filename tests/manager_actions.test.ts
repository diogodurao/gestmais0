import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import {
    createApartment,
    updateApartment,
    deleteApartment,
    bulkCreateApartments,
    createNewBuilding,
    updateBuilding
} from '@/app/actions/building'

// Mock the dependencies
vi.mock('@/db', () => {
    return {
        db: {
            select: vi.fn(),
            insert: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            from: vi.fn(),
            where: vi.fn(),
            limit: vi.fn(),
            orderBy: vi.fn(),
            innerJoin: vi.fn(),
            leftJoin: vi.fn(),
            values: vi.fn(),
            set: vi.fn(),
            returning: vi.fn(),
        }
    }
})

import { db } from '@/db'

// Mock headers and auth
vi.mock('next/headers', () => ({
    headers: vi.fn(),
}))

// Create a mock for getSession
const mockGetSession = vi.fn()

vi.mock('@/lib/auth', () => ({
    auth: {
        api: {
            getSession: (...args: any[]) => mockGetSession(...args),
        }
    }
}))

vi.mock('nanoid', () => ({
    customAlphabet: () => () => '123456'
}))

// Helper to reset mocks and setup chain
const setupDbMock = () => {
    vi.clearAllMocks()

    // Default mock session (authenticated)
    mockGetSession.mockResolvedValue({
        user: { id: 'user1', name: 'Manager' },
        session: { id: 'session1' }
    })

    // Create a chain object that mimics the Drizzle query builder
    const chain: any = {
        from: vi.fn(),
        where: vi.fn(),
        limit: vi.fn(),
        orderBy: vi.fn(),
        innerJoin: vi.fn(),
        leftJoin: vi.fn(),
        values: vi.fn(),
        set: vi.fn(),
        returning: vi.fn(),
        // Make it "thenable" to support await directly on the chain
        then: function(resolve: any) {
             // Default behavior: resolve with undefined or mock return
             resolve([])
        }
    }

    // Wire up methods to return the chain
    chain.from.mockReturnValue(chain)
    chain.where.mockReturnValue(chain)
    chain.limit.mockReturnValue(chain)
    chain.orderBy.mockReturnValue(chain)
    chain.innerJoin.mockReturnValue(chain)
    chain.leftJoin.mockReturnValue(chain)
    chain.values.mockReturnValue(chain)
    chain.set.mockReturnValue(chain)
    chain.returning.mockReturnValue(chain)

    // Wire up the main methods to return the chain
    ;(db.select as any).mockImplementation(() => chain)
    ;(db.insert as any).mockImplementation(() => chain)
    ;(db.update as any).mockImplementation(() => chain)
    ;(db.delete as any).mockImplementation(() => chain)

    return chain
}

describe('Manager Building Actions (CRUD)', () => {

    describe('createApartment', () => {
        it('should create an apartment successfully when it does not exist', async () => {
            const mockDbChain = setupDbMock()

            // Mock check if exists (return empty array)
            // We need to intercept the limit call to return specific values
            mockDbChain.limit.mockImplementation(() => {
                 // Return a promise-like object that resolves to []
                 return Promise.resolve([])
            })

            // Mock insert return
            const newApt = { id: 1, buildingId: 'b1', floor: '1', identifier: 'A', unitType: 'apartment' }
            mockDbChain.returning.mockResolvedValue([newApt])

            const result = await createApartment('b1', {
                floor: '1',
                unitType: 'apartment',
                identifier: 'A'
            })

            expect(db.select).toHaveBeenCalled()
            expect(db.insert).toHaveBeenCalled()
            expect(result).toEqual(newApt)
        })

        it('should throw error if apartment already exists', async () => {
            const mockDbChain = setupDbMock()

            // Mock check if exists (return existing apt)
            mockDbChain.limit.mockResolvedValue([{ id: 1 }])

            await expect(createApartment('b1', {
                floor: '1',
                unitType: 'apartment',
                identifier: 'A'
            })).rejects.toThrow('Unit already exists on this floor')
        })

        it('should throw error if required fields are missing', async () => {
             await expect(createApartment('b1', {
                floor: '',
                unitType: 'apartment',
                identifier: 'A'
            })).rejects.toThrow('Missing required fields')
        })
    })

    describe('updateApartment', () => {
        it('should update an apartment successfully', async () => {
            const mockDbChain = setupDbMock()

            const updatedApt = { id: 1, buildingId: 'b1', floor: '2', identifier: 'B', unitType: 'apartment' }
            mockDbChain.returning.mockResolvedValue([updatedApt])

            const result = await updateApartment(1, {
                floor: '2',
                identifier: 'B'
            })

            expect(db.update).toHaveBeenCalled()
            expect(result).toEqual(updatedApt)
        })
    })

    describe('deleteApartment', () => {
        it('should delete an apartment and its payments', async () => {
            const mockDbChain = setupDbMock()

            await deleteApartment(1)

            // Should call delete twice: one for payments, one for apartments
            expect(db.delete).toHaveBeenCalledTimes(2)
        })
    })

    describe('bulkCreateApartments', () => {
        it('should create multiple apartments skipping existing ones', async () => {
             const mockDbChain = setupDbMock()

             // First unit exists, second one does not
             mockDbChain.limit
                .mockResolvedValueOnce([{ id: 1 }]) // First check
                .mockResolvedValueOnce([])          // Second check

             const newApt = { id: 2, floor: '2', identifier: 'B' }
             mockDbChain.returning.mockResolvedValue([newApt])

             const result = await bulkCreateApartments('b1', [
                 { floor: '1', identifier: 'A', unitType: 'apartment' },
                 { floor: '2', identifier: 'B', unitType: 'apartment' }
             ])

             expect(result).toHaveLength(1)
             expect(result[0]).toEqual(newApt)
        })
    })

    describe('createNewBuilding', () => {
        it('should create a new building and manager association', async () => {
            const mockDbChain = setupDbMock()

            const newBuilding = { id: 'b1', name: 'New Building', code: '123456' }
            mockDbChain.returning.mockResolvedValue([newBuilding])

            const result = await createNewBuilding('u1', 'New Building', '123456789')

            expect(db.insert).toHaveBeenCalledTimes(2) // building + managerBuildings
            expect(db.update).toHaveBeenCalledTimes(1) // update user active building
            expect(result).toEqual(newBuilding)
        })
    })

    describe('updateBuilding', () => {
        it('should update building details', async () => {
            const mockDbChain = setupDbMock()

            const updatedBuilding = { id: 'b1', name: 'Updated Name' }
            mockDbChain.returning.mockResolvedValue([updatedBuilding])

            const result = await updateBuilding('b1', { name: 'Updated Name' })

            expect(db.update).toHaveBeenCalled()
            expect(result).toEqual(updatedBuilding)
        })
    })
})
