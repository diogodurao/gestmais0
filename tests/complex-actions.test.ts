import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
    bulkCreateApartments,
    claimApartment,
    joinBuilding,
    getOrCreateManagerBuilding
} from '@/app/actions/building'
import { db } from '@/db'

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

describe('Complex Building Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(db.select).mockReturnValue(mockDbChain([]))
        vi.mocked(db.insert).mockReturnValue(mockDbChain([]))
        vi.mocked(db.update).mockReturnValue(mockDbChain([]))
        vi.mocked(db.delete).mockReturnValue(mockDbChain([]))
    })

    describe('bulkCreateApartments', () => {
        it('should create multiple apartments skipping duplicates', async () => {
            const buildingId = 'building-123'
            const unitsString = "1A, 1B, 2A"

            // 1A exists, 1B and 2A are new
            vi.mocked(db.select)
                .mockReturnValueOnce(mockDbChain([{ id: 1, unit: '1A' }])) // 1A exists
                .mockReturnValueOnce(mockDbChain([])) // 1B new
                .mockReturnValueOnce(mockDbChain([])) // 2A new

            vi.mocked(db.insert)
                .mockReturnValueOnce(mockDbChain([{ id: 2, unit: '1B' }]))
                .mockReturnValueOnce(mockDbChain([{ id: 3, unit: '2A' }]))

            const result = await bulkCreateApartments(buildingId, unitsString)

            expect(result).toHaveLength(2)
            expect(result[0].unit).toBe('1B')
            expect(result[1].unit).toBe('2A')
        })

        it('should throw if no units provided', async () => {
            await expect(bulkCreateApartments('b1', '')).rejects.toThrow("No units provided")
        })
    })

    describe('claimApartment', () => {
        it('should allow user to claim an empty apartment', async () => {
            const buildingId = 'b1'
            const apartmentId = 1
            const userId = 'u1'
            const mockApt = { id: apartmentId, buildingId, residentId: null }

            vi.mocked(db.select).mockReturnValue(mockDbChain([mockApt]))
            vi.mocked(db.update)
                .mockReturnValueOnce(mockDbChain([{ ...mockApt, residentId: userId }])) // apt update
                .mockReturnValueOnce(mockDbChain([])) // user update

            const result = await claimApartment(buildingId, apartmentId, userId)

            expect(db.update).toHaveBeenCalledTimes(2)
            expect(result.residentId).toBe(userId)
        })

        it('should fail if apartment already claimed by someone else', async () => {
            const buildingId = 'b1'
            const apartmentId = 1
            const userId = 'u1'
            const mockApt = { id: apartmentId, buildingId, residentId: 'other-user' }

            vi.mocked(db.select).mockReturnValue(mockDbChain([mockApt]))

            await expect(claimApartment(buildingId, apartmentId, userId)).rejects.toThrow("Apartment already claimed")
        })
    })

    describe('joinBuilding', () => {
        it('should link user to building via code', async () => {
            const userId = 'u1'
            const code = 'CODE123'
            const mockBuilding = { id: 'b1', code }

            vi.mocked(db.select).mockReturnValue(mockDbChain([mockBuilding]))
            vi.mocked(db.update).mockReturnValue(mockDbChain([]))

            const result = await joinBuilding(userId, code)

            expect(db.update).toHaveBeenCalled()
            expect(result).toEqual(mockBuilding)
        })
    })

    describe('getOrCreateManagerBuilding', () => {
        it('should return existing active building', async () => {
            const userId = 'manager-1'
            const userNif = '999'
            const mockUser = { id: userId, buildingId: 'b1' }
            const mockBuilding = { id: 'b1', managerId: userId }

            vi.mocked(db.select)
                .mockReturnValueOnce(mockDbChain([mockUser])) // get user
                .mockReturnValueOnce(mockDbChain([mockBuilding])) // get buildings

            const result = await getOrCreateManagerBuilding(userId, userNif)

            expect(result.activeBuilding).toEqual(mockBuilding)
            expect(result.buildings).toHaveLength(1)
        })

        it('should create new building if user has none', async () => {
            const userId = 'manager-new'
            const userNif = '999'
            const mockUser = { id: userId, buildingId: null }

            vi.mock('nanoid', () => ({
                customAlphabet: () => () => 'newcode'
            }))

            vi.mocked(db.select)
                .mockReturnValueOnce(mockDbChain([mockUser])) // get user
                .mockReturnValueOnce(mockDbChain([])) // get buildings (empty)

            vi.mocked(db.insert).mockReturnValue(mockDbChain([{ id: 'new-b', managerId: userId }]))
            vi.mocked(db.update).mockReturnValue(mockDbChain([]))

            const result = await getOrCreateManagerBuilding(userId, userNif)

            expect(db.insert).toHaveBeenCalled()
            expect(result.activeBuilding.id).toBe('new-b')
        })
    })
})
