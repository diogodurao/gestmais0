import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
    createNewBuilding,
    deleteApartment,
    getOrCreateManagerBuilding,
    bulkCreateApartments,
    createApartment,
    updateApartment,
    updateBuilding,
    joinBuilding,
    claimApartment
} from '@/app/actions/building'
import { db } from '@/db'

describe('Manager CRUD Operations', () => {

    beforeEach(() => {
        vi.clearAllMocks()
        // Reset db methods to basic mocks
        // @ts-ignore
        db.select = vi.fn().mockReturnThis()
        // @ts-ignore
        db.insert = vi.fn().mockReturnThis()
        // @ts-ignore
        db.update = vi.fn().mockReturnThis()
        // @ts-ignore
        db.delete = vi.fn().mockReturnThis()
    })

    describe('getOrCreateManagerBuilding', () => {
        it('should return existing building if user has activeBuildingId', async () => {
            const userId = 'user-1'
            const userNif = '123456789'
            const buildingId = 'building-1'
            const mockUser = { id: userId, activeBuildingId: buildingId }
            const mockBuilding = { id: buildingId, name: 'Test Building' }

            const limitMock = vi.fn()
            const whereMock = vi.fn().mockReturnValue({ limit: limitMock })
            const fromMock = vi.fn().mockReturnValue({ where: whereMock, innerJoin: vi.fn() })
            const selectMock = vi.fn().mockReturnValue({ from: fromMock })

            // @ts-ignore
            db.select = selectMock

            limitMock.mockResolvedValueOnce([mockUser])
            limitMock.mockResolvedValueOnce([mockBuilding])

            const result = await getOrCreateManagerBuilding(userId, userNif)

            expect(result).toEqual(mockBuilding)
        })

        it('should create new building if no existing building found', async () => {
            const userId = 'user-1'
            const userNif = '123456789'
            const mockUser = { id: userId, activeBuildingId: null }
            const newBuildingMock = { id: 'new-id', name: 'My Condominium' }

            const limitMock = vi.fn()
            const whereResult = { limit: limitMock }
            const whereMock = vi.fn().mockReturnValue(whereResult)
            const innerJoinMock = vi.fn().mockReturnValue({ where: whereMock })
            const fromMock = vi.fn().mockReturnValue({ where: whereMock, innerJoin: innerJoinMock })
            const selectMock = vi.fn().mockReturnValue({ from: fromMock })

            const returningMock = vi.fn()
            const valuesMock = vi.fn().mockReturnValue({
                returning: returningMock,
                then: (resolve: any) => resolve()
            })
            const insertMock = vi.fn().mockReturnValue({ values: valuesMock })

            const thenUpdateMock = vi.fn((resolve) => resolve(undefined))
            const whereUpdateMock = vi.fn().mockReturnValue({ then: thenUpdateMock })
            const setMock = vi.fn().mockReturnValue({ where: whereUpdateMock })
            const updateMock = vi.fn().mockReturnValue({ set: setMock })

            // @ts-ignore
            db.select = selectMock
            // @ts-ignore
            db.insert = insertMock
            // @ts-ignore
            db.update = updateMock

            limitMock.mockResolvedValueOnce([mockUser])
            limitMock.mockResolvedValueOnce([])
            returningMock.mockResolvedValueOnce([newBuildingMock])
            valuesMock.mockReturnValueOnce({
                returning: returningMock,
                then: (resolve: any) => resolve(undefined)
            })

            const result = await getOrCreateManagerBuilding(userId, userNif)
            expect(result).toEqual(newBuildingMock)
        })
    })

    describe('createNewBuilding', () => {
        it('should create a new building and set as active', async () => {
            const userId = 'user-1'
            const name = 'New Building'
            const nif = '987654321'
            const newBuildingMock = { id: 'new-id', name: name, nif: nif }

            const returningMock = vi.fn()
            const valuesMock = vi.fn()
            const insertMock = vi.fn().mockReturnValue({ values: valuesMock })

            const thenUpdateMock = vi.fn((resolve) => resolve(undefined))
            const whereUpdateMock = vi.fn().mockReturnValue({ then: thenUpdateMock })
            const setMock = vi.fn().mockReturnValue({ where: whereUpdateMock })
            const updateMock = vi.fn().mockReturnValue({ set: setMock })

            // @ts-ignore
            db.insert = insertMock
            // @ts-ignore
            db.update = updateMock

            valuesMock.mockReturnValueOnce({
                returning: returningMock.mockResolvedValueOnce([newBuildingMock]),
                then: (resolve: any) => resolve(undefined)
            })

            valuesMock.mockReturnValueOnce({
                returning: returningMock,
                then: (resolve: any) => resolve(undefined)
            })

            const result = await createNewBuilding(userId, name, nif)
            expect(result).toEqual(newBuildingMock)
        })
    })

    describe('createApartment', () => {
        it('should create an apartment if not exists', async () => {
            const buildingId = 'b-1'
            const data = { floor: '1', unitType: 'T2', identifier: 'A' }
            const newAptMock = { id: 1, ...data, buildingId }

            const limitMock = vi.fn()
            const whereMock = vi.fn().mockReturnValue({ limit: limitMock })
            const fromMock = vi.fn().mockReturnValue({ where: whereMock })
            const selectMock = vi.fn().mockReturnValue({ from: fromMock })

            const returningMock = vi.fn()
            const valuesMock = vi.fn().mockReturnValue({ returning: returningMock })
            const insertMock = vi.fn().mockReturnValue({ values: valuesMock })

            // @ts-ignore
            db.select = selectMock
            // @ts-ignore
            db.insert = insertMock

            limitMock.mockResolvedValueOnce([])
            returningMock.mockResolvedValueOnce([newAptMock])

            const result = await createApartment(buildingId, data)
            expect(result).toEqual(newAptMock)
        })

        it('should throw error if apartment exists', async () => {
            const buildingId = 'b-1'
            const data = { floor: '1', unitType: 'T2', identifier: 'A' }
            const existingApt = { id: 1, ...data, buildingId }

            const limitMock = vi.fn()
            const whereMock = vi.fn().mockReturnValue({ limit: limitMock })
            const fromMock = vi.fn().mockReturnValue({ where: whereMock })
            const selectMock = vi.fn().mockReturnValue({ from: fromMock })

            // @ts-ignore
            db.select = selectMock

            limitMock.mockResolvedValueOnce([existingApt])
            await expect(createApartment(buildingId, data)).rejects.toThrow("Unit already exists on this floor")
        })
    })

    describe('deleteApartment', () => {
        it('should delete payments then apartment', async () => {
            const apartmentId = 1
            const thenDeleteMock = vi.fn((resolve) => resolve(undefined))
            const whereDeleteMock = vi.fn().mockReturnValue({ then: thenDeleteMock })
            const deleteMock = vi.fn().mockReturnValue({ where: whereDeleteMock })

            // @ts-ignore
            db.delete = deleteMock

            await deleteApartment(apartmentId)
            expect(db.delete).toHaveBeenCalledTimes(2)
        })
    })

    describe('bulkCreateApartments', () => {
        it('should create multiple apartments skipping existing ones', async () => {
            const buildingId = 'b-1'
            const units = [
                { floor: '1', unitType: 'T1', identifier: 'A' },
                { floor: '1', unitType: 'T1', identifier: 'B' }
            ]
            const createdApt = { id: 2, ...units[1], buildingId }

            const limitMock = vi.fn()
            const whereMock = vi.fn().mockReturnValue({ limit: limitMock })
            const fromMock = vi.fn().mockReturnValue({ where: whereMock })
            const selectMock = vi.fn().mockReturnValue({ from: fromMock })

            const returningMock = vi.fn()
            const valuesMock = vi.fn().mockReturnValue({ returning: returningMock })
            const insertMock = vi.fn().mockReturnValue({ values: valuesMock })

            // @ts-ignore
            db.select = selectMock
            // @ts-ignore
            db.insert = insertMock

            limitMock.mockResolvedValueOnce([{ id: 1 }])
            limitMock.mockResolvedValueOnce([])
            returningMock.mockResolvedValueOnce([createdApt])

            const result = await bulkCreateApartments(buildingId, units)
            expect(result).toHaveLength(1)
            expect(result[0]).toEqual(createdApt)
        })
    })

    describe('updateBuilding', () => {
        it('should update building fields', async () => {
            const buildingId = 'b-1'
            const data = { name: 'Updated Name' }
            const updatedBuilding = { id: buildingId, ...data }

            const returningMock = vi.fn()
            const whereUpdateMock = vi.fn().mockReturnValue({ returning: returningMock })
            const setMock = vi.fn().mockReturnValue({ where: whereUpdateMock })
            const updateMock = vi.fn().mockReturnValue({ set: setMock })

            // @ts-ignore
            db.update = updateMock

            returningMock.mockResolvedValueOnce([updatedBuilding])
            const result = await updateBuilding(buildingId, data)
            expect(result).toEqual(updatedBuilding)
        })
    })

    describe('Resident Actions', () => {
        describe('joinBuilding', () => {
            it('should join building if code is valid', async () => {
                const userId = 'user-1'
                const code = '123456'
                const targetBuilding = { id: 'b-1', code }

                const limitMock = vi.fn()
                const whereMock = vi.fn().mockReturnValue({ limit: limitMock })
                const fromMock = vi.fn().mockReturnValue({ where: whereMock })
                const selectMock = vi.fn().mockReturnValue({ from: fromMock })

                const thenUpdateMock = vi.fn((resolve) => resolve(undefined))
                const whereUpdateMock = vi.fn().mockReturnValue({ then: thenUpdateMock })
                const setMock = vi.fn().mockReturnValue({ where: whereUpdateMock })
                const updateMock = vi.fn().mockReturnValue({ set: setMock })

                // @ts-ignore
                db.select = selectMock
                // @ts-ignore
                db.update = updateMock

                limitMock.mockResolvedValueOnce([targetBuilding])

                const result = await joinBuilding(userId, code)
                expect(result).toEqual(targetBuilding)
                expect(db.update).toHaveBeenCalled()
            })

            it('should throw error if code is invalid', async () => {
                const userId = 'user-1'
                const code = 'invalid'

                const limitMock = vi.fn().mockResolvedValueOnce([])
                const whereMock = vi.fn().mockReturnValue({ limit: limitMock })
                const fromMock = vi.fn().mockReturnValue({ where: whereMock })
                const selectMock = vi.fn().mockReturnValue({ from: fromMock })

                // @ts-ignore
                db.select = selectMock

                await expect(joinBuilding(userId, code)).rejects.toThrow("Invalid building code")
            })
        })

        describe('claimApartment', () => {
            it('should claim apartment if available', async () => {
                const aptId = 1
                const mockApt = { id: aptId, residentId: null }
                const mockSession = { user: { id: 'user-1' } }

                // Mock auth session
                // We need to re-mock auth?
                // The global auth mock in setup.ts is:
                // api: { getSession: vi.fn() }

                const { auth } = await import('@/lib/auth')
                // @ts-ignore
                auth.api.getSession.mockResolvedValue(mockSession)

                const limitMock = vi.fn()
                const whereMock = vi.fn().mockReturnValue({ limit: limitMock })
                const fromMock = vi.fn().mockReturnValue({ where: whereMock })
                const selectMock = vi.fn().mockReturnValue({ from: fromMock })

                const thenUpdateMock = vi.fn((resolve) => resolve(undefined))
                const whereUpdateMock = vi.fn().mockReturnValue({ then: thenUpdateMock })
                const setMock = vi.fn().mockReturnValue({ where: whereUpdateMock })
                const updateMock = vi.fn().mockReturnValue({ set: setMock })

                // @ts-ignore
                db.select = selectMock
                // @ts-ignore
                db.update = updateMock

                limitMock.mockResolvedValueOnce([mockApt])

                const result = await claimApartment(aptId)
                expect(result).toEqual(mockApt)
                expect(db.update).toHaveBeenCalled()
            })

            it('should throw if apartment already claimed', async () => {
                const aptId = 1
                const mockApt = { id: aptId, residentId: 'other-user' }
                const mockSession = { user: { id: 'user-1' } }

                const { auth } = await import('@/lib/auth')
                // @ts-ignore
                auth.api.getSession.mockResolvedValue(mockSession)

                const limitMock = vi.fn().mockResolvedValueOnce([mockApt])
                const whereMock = vi.fn().mockReturnValue({ limit: limitMock })
                const fromMock = vi.fn().mockReturnValue({ where: whereMock })
                const selectMock = vi.fn().mockReturnValue({ from: fromMock })

                // @ts-ignore
                db.select = selectMock

                await expect(claimApartment(aptId)).rejects.toThrow("Apartment already claimed")
            })
        })
    })

})
