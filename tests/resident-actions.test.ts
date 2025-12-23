import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
    joinBuilding,
    claimApartment,
    getResidentStatus
} from '@/app/actions/building'

// Mock dependencies
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

vi.mock('next/headers', () => ({
    headers: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
    auth: {
        api: {
            getSession: vi.fn()
        }
    }
}))

describe('Resident Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        Object.values(mockDb).forEach(mock => {
            if (mock !== mockDb.then) {
                mock.mockReturnValue(mockDb)
            }
        })
        mockDb.then.mockImplementation((resolve) => resolve([]))
    })

    describe('joinBuilding', () => {
        it('should join building if code is valid', async () => {
            const userId = 'user-123'
            const code = 'abcdef'
            const building = { id: 'building-123', code }

            // Mock find building
            mockDb.limit.mockImplementationOnce(() => Promise.resolve([building]))

            // Mock update user
            mockDb.where.mockReturnThis() // for update().set().where()

            const result = await joinBuilding(userId, code)

            expect(mockDb.select).toHaveBeenCalled()
            expect(mockDb.update).toHaveBeenCalled()
            expect(mockDb.set).toHaveBeenCalledWith({ buildingId: building.id })
            expect(result).toEqual(building)
        })

        it('should throw error if code is invalid', async () => {
            const userId = 'user-123'
            const code = 'invalid'

            // Mock find building: returns []
            mockDb.limit.mockImplementationOnce(() => Promise.resolve([]))

            await expect(joinBuilding(userId, code)).rejects.toThrow("Invalid building code")
            expect(mockDb.update).not.toHaveBeenCalled()
        })
    })

    describe('claimApartment', () => {
        it('should claim apartment if available', async () => {
            const buildingId = 'building-123'
            const apartmentId = 1
            const userId = 'user-123'
            const apartment = { id: 1, buildingId, residentId: null }
            const updatedApt = { ...apartment, residentId: userId }

            // Check apartment: returns [apartment]
            mockDb.limit.mockImplementationOnce(() => Promise.resolve([apartment]))

            // Update apartment: returns [updatedApt]
            mockDb.returning.mockImplementationOnce(() => Promise.resolve([updatedApt]))

            // Update user: returns nothing
            mockDb.then.mockImplementationOnce((resolve) => resolve([]))

            const result = await claimApartment(buildingId, apartmentId, userId)

            expect(mockDb.update).toHaveBeenCalledTimes(2) // Once for apt, once for user
            expect(result).toEqual(updatedApt)
        })

        it('should throw error if apartment already claimed', async () => {
            const buildingId = 'building-123'
            const apartmentId = 1
            const userId = 'user-123'
            const apartment = { id: 1, buildingId, residentId: 'other-user' }

            // Check apartment: returns [apartment]
            mockDb.limit.mockImplementationOnce(() => Promise.resolve([apartment]))

            await expect(claimApartment(buildingId, apartmentId, userId)).rejects.toThrow("Apartment already claimed")
        })
    })

    describe('getResidentStatus', () => {
        it('should return resident status', async () => {
            const userId = 'user-123'
            const user = { id: userId, buildingId: 'building-123', profileComplete: true }
            const apartment = { id: 1, unit: '1A' }

            // Get user: returns [user]
            mockDb.limit.mockImplementationOnce(() => Promise.resolve([user]))

            // Get apartment: returns [apartment]
            mockDb.limit.mockImplementationOnce(() => Promise.resolve([apartment]))

            const result = await getResidentStatus(userId)

            expect(result).toEqual({
                buildingId: 'building-123',
                profileComplete: true,
                apartment: apartment
            })
        })
    })
})
