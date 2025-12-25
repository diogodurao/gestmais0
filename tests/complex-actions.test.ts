import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
    getOrCreateManagerBuilding,
    joinBuilding,
    setActiveBuilding,
    claimApartment,
    updateBuilding
} from '@/app/actions/building'
import { db } from '@/db'

// Mock the database
vi.mock('@/db', () => ({
    db: {
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
}))

describe('Complex Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('joinBuilding', () => {
        it('should link user to building if code is valid', async () => {
            const userId = 'user-1'
            const code = 'CODE123'
            const buildingMock = { id: 'b1', code }

            // Mock find building
            const limitMock = vi.fn().mockResolvedValue([buildingMock])
            const whereMock = vi.fn().mockReturnValue({ limit: limitMock })
            // @ts-ignore
            db.select.mockReturnValue({ from: vi.fn().mockReturnValue({ where: whereMock }) })

            // Mock update user
            const whereMockUpdate = vi.fn().mockResolvedValue([])
            const setMock = vi.fn().mockReturnValue({ where: whereMockUpdate })
            // @ts-ignore
            db.update.mockReturnValue({ set: setMock })

            const result = await joinBuilding(userId, code)
            expect(result).toEqual(buildingMock)
        })

        it('should throw if code invalid', async () => {
            // Mock empty building
            const limitMock = vi.fn().mockResolvedValue([])
            const whereMock = vi.fn().mockReturnValue({ limit: limitMock })
            // @ts-ignore
            db.select.mockReturnValue({ from: vi.fn().mockReturnValue({ where: whereMock }) })

            await expect(joinBuilding('u1', 'bad')).rejects.toThrow("Invalid building code")
        })
    })

    describe('setActiveBuilding', () => {
        it('should switch active building for manager', async () => {
            const managerId = 'm1'
            const buildingId = 'b1'
            const buildingMock = { id: buildingId, managerId }

            // Mock check ownership
            const limitMock = vi.fn().mockResolvedValue([buildingMock])
            const whereMock = vi.fn().mockReturnValue({ limit: limitMock })
            // @ts-ignore
            db.select.mockReturnValue({ from: vi.fn().mockReturnValue({ where: whereMock }) })

            // Mock update
            const whereMockUpdate = vi.fn().mockResolvedValue([])
            const setMock = vi.fn().mockReturnValue({ where: whereMockUpdate })
            // @ts-ignore
            db.update.mockReturnValue({ set: setMock })

            const result = await setActiveBuilding(managerId, buildingId)
            expect(result).toEqual(buildingMock)
        })
    })

    describe('claimApartment', () => {
        it('should claim empty apartment', async () => {
            const userId = 'u1'
            const buildingId = 'b1'
            const aptId = 1
            const aptMock = { id: aptId, buildingId, residentId: null }
            const updatedMock = { ...aptMock, residentId: userId }

            // Mock find apartment
            const limitMock = vi.fn().mockResolvedValue([aptMock])
            const whereMock = vi.fn().mockReturnValue({ limit: limitMock })
            // @ts-ignore
            db.select.mockReturnValue({ from: vi.fn().mockReturnValue({ where: whereMock }) })

            // Mock update apartment and user
            const returningMock = vi.fn().mockResolvedValue([updatedMock])
            const whereMockUpdate = vi.fn().mockReturnValue({ returning: returningMock })
            const setMock = vi.fn().mockReturnValue({ where: whereMockUpdate })

            // Mock update user (second update call)
            // We need to handle multiple db.update calls.
            // First call is apt, second is user.
            let updateCallCount = 0
            // @ts-ignore
            db.update.mockImplementation(() => {
                updateCallCount++
                if (updateCallCount === 1) { // Apartment update
                    return {
                         set: vi.fn().mockReturnValue({
                             where: vi.fn().mockReturnValue({
                                 returning: vi.fn().mockResolvedValue([updatedMock])
                             })
                         })
                    }
                } else { // User update
                    return {
                        set: vi.fn().mockReturnValue({
                            where: vi.fn().mockResolvedValue([])
                        })
                    }
                }
            })

            const result = await claimApartment(buildingId, aptId, userId)
            expect(result).toEqual(updatedMock)
        })

        it('should throw if apartment already claimed', async () => {
            const aptMock = { id: 1, buildingId: 'b1', residentId: 'other-user' }
             // Mock find apartment
            const limitMock = vi.fn().mockResolvedValue([aptMock])
            const whereMock = vi.fn().mockReturnValue({ limit: limitMock })
            // @ts-ignore
            db.select.mockReturnValue({ from: vi.fn().mockReturnValue({ where: whereMock }) })

            await expect(claimApartment('b1', 1, 'u1')).rejects.toThrow("Apartment already claimed")
        })
    })
})
