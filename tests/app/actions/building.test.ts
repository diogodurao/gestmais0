import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
    createNewBuilding,
    updateBuilding,
    getBuilding,
    createApartment,
    updateApartment,
    deleteApartment,
    getBuildingApartments,
    getOrCreateManagerBuilding,
    switchActiveBuilding,
    joinBuilding,
    claimApartment
} from '@/app/actions/building'
import { auth } from '@/lib/auth'

// Use vi.hoisted to create the mock object before modules are evaluated
const mocks = vi.hoisted(() => {
    const mockDbMethods = {
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        from: vi.fn(),
        where: vi.fn(),
        limit: vi.fn(),
        innerJoin: vi.fn(),
        leftJoin: vi.fn(),
        returning: vi.fn(),
        orderBy: vi.fn(),
        set: vi.fn(),
        values: vi.fn(),
    }
    return {
        db: mockDbMethods,
        auth: {
            api: {
                getSession: vi.fn(),
            }
        }
    }
})

// Mock `auth` from `@/lib/auth`
vi.mock('@/lib/auth', () => ({
    auth: mocks.auth
}))

// Mock `db` from `@/db`
vi.mock('@/db', () => ({
    db: mocks.db,
}))

// Mock nanoid
vi.mock('nanoid', () => ({
    customAlphabet: () => () => '123456',
}))

// Helper to reset the mock implementation for chaining
function setupDbMock() {
    mocks.db.select.mockReturnValue(mocks.db)
    mocks.db.insert.mockReturnValue(mocks.db)
    mocks.db.update.mockReturnValue(mocks.db)
    mocks.db.delete.mockReturnValue(mocks.db)
    mocks.db.from.mockReturnValue(mocks.db)
    mocks.db.where.mockReturnValue(mocks.db)
    mocks.db.limit.mockReturnValue(mocks.db)
    mocks.db.innerJoin.mockReturnValue(mocks.db)
    mocks.db.leftJoin.mockReturnValue(mocks.db)
    mocks.db.returning.mockReturnValue(mocks.db)
    mocks.db.orderBy.mockReturnValue(mocks.db)
    mocks.db.set.mockReturnValue(mocks.db)
    mocks.db.values.mockReturnValue(mocks.db)
}

describe('Building CRUD Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        setupDbMock()
    })

    describe('getOrCreateManagerBuilding', () => {
        it('should return active building if user has one', async () => {
            const userId = 'u1'
            const buildingId = 'b1'
            const user = { id: userId, activeBuildingId: buildingId }
            const building = { id: buildingId, name: 'B1' }

            mocks.db.limit
                .mockResolvedValueOnce([user]) // existingUser
                .mockResolvedValueOnce([building]) // existingBuilding

            const result = await getOrCreateManagerBuilding(userId, '123')
            expect(result).toEqual(building)
        })

        it('should return first managed building if active is not set', async () => {
            const userId = 'u1'
            const building = { id: 'b1', name: 'B1' }
            const user = { id: userId, activeBuildingId: null }
            const managed = { building: building }

            mocks.db.limit
                .mockResolvedValueOnce([user]) // existingUser
                .mockResolvedValueOnce([managed]) // existingManagedBuildings

            const result = await getOrCreateManagerBuilding(userId, '123')
            expect(result).toEqual(building)
            expect(mocks.db.update).toHaveBeenCalled() // should set active building
        })

        it('should create a new building if user has none', async () => {
            const userId = 'u1'
            const user = { id: userId, activeBuildingId: null }
            const newBuilding = { id: 'new-b', name: 'My Condominium' }

            mocks.db.limit
                .mockResolvedValueOnce([user]) // existingUser
                .mockResolvedValueOnce([]) // existingManagedBuildings

            mocks.db.returning.mockResolvedValueOnce([newBuilding])

            const result = await getOrCreateManagerBuilding(userId, '123')
            expect(result).toEqual(newBuilding)
            expect(mocks.db.insert).toHaveBeenCalledTimes(2) // building + junction
        })
    })

    describe('createNewBuilding', () => {
        it('should create a new building and assign it to the manager', async () => {
            const userId = 'user-1'
            const name = 'New Building'
            const nif = '123456789'
            const newBuilding = { id: 'building-1', name, nif, code: '123456', managerId: userId }

            mocks.db.returning.mockResolvedValueOnce([newBuilding]) // for building insert

            const result = await createNewBuilding(userId, name, nif)

            expect(mocks.db.insert).toHaveBeenCalledTimes(2) // building + managerBuildings
            expect(mocks.db.update).toHaveBeenCalledTimes(1) // user activeBuildingId
            expect(result).toEqual(newBuilding)
        })
    })

    describe('switchActiveBuilding', () => {
        it('should switch active building if user has access', async () => {
            const userId = 'u1'
            const buildingId = 'b2'

            mocks.auth.api.getSession.mockResolvedValue({ user: { id: userId } })
            mocks.db.limit.mockResolvedValueOnce([{ managerId: userId, buildingId }]) // access check

            const result = await switchActiveBuilding(buildingId)
            expect(result).toBe(true)
            expect(mocks.db.update).toHaveBeenCalled()
        })

        it('should throw error if access denied', async () => {
            const userId = 'u1'
            const buildingId = 'b2'

            mocks.auth.api.getSession.mockResolvedValue({ user: { id: userId } })
            mocks.db.limit.mockResolvedValueOnce([]) // no access

            await expect(switchActiveBuilding(buildingId)).rejects.toThrow('Access denied')
        })
    })

    describe('joinBuilding', () => {
        it('should join building with valid code', async () => {
            const userId = 'u1'
            const code = 'valid'
            const building = { id: 'b1', code }

            mocks.db.limit.mockResolvedValueOnce([building])

            const result = await joinBuilding(userId, code)
            expect(result).toEqual(building)
            expect(mocks.db.update).toHaveBeenCalled() // updates user.buildingId
        })
    })

    describe('claimApartment', () => {
        it('should claim unclaimed apartment', async () => {
            const userId = 'u1'
            const aptId = 1
            const apt = { id: aptId, residentId: null }

            mocks.auth.api.getSession.mockResolvedValue({ user: { id: userId } })
            mocks.db.limit.mockResolvedValueOnce([apt])

            const result = await claimApartment(aptId)
            expect(result).toEqual(apt)
            expect(mocks.db.update).toHaveBeenCalled()
        })

        it('should fail if apartment already claimed', async () => {
            const userId = 'u1'
            const aptId = 1
            const apt = { id: aptId, residentId: 'other' }

            mocks.auth.api.getSession.mockResolvedValue({ user: { id: userId } })
            mocks.db.limit.mockResolvedValueOnce([apt])

            await expect(claimApartment(aptId)).rejects.toThrow('Apartment already claimed')
        })
    })

    describe('updateBuilding', () => {
        it('should update building details', async () => {
            const buildingId = 'building-1'
            const updateData = { name: 'Updated Name', city: 'Lisbon' }
            const updatedBuilding = { id: buildingId, ...updateData }

            mocks.db.returning.mockResolvedValueOnce([updatedBuilding])

            const result = await updateBuilding(buildingId, updateData)

            expect(mocks.db.update).toHaveBeenCalled()
            expect(mocks.db.set).toHaveBeenCalledWith(expect.objectContaining(updateData))
            expect(result).toEqual(updatedBuilding)
        })
    })

    describe('getBuilding', () => {
        it('should return building details', async () => {
            const buildingId = 'building-1'
            const buildingData = { id: buildingId, name: 'Building 1' }

            mocks.db.limit.mockResolvedValueOnce([buildingData])

            const result = await getBuilding(buildingId)

            expect(mocks.db.select).toHaveBeenCalled()
            expect(mocks.db.where).toHaveBeenCalled()
            expect(result).toEqual(buildingData)
        })
    })
})

describe('Apartment CRUD Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        setupDbMock()
    })

    describe('createApartment', () => {
        it('should create a new apartment if it does not exist', async () => {
            const buildingId = 'building-1'
            const data = { floor: '1', unitType: 'apartment', identifier: 'A', permillage: 10 }
            const newApt = { id: 1, buildingId, ...data }

            mocks.db.limit.mockResolvedValueOnce([]) // existing check returns empty
            mocks.db.returning.mockResolvedValueOnce([newApt])

            const result = await createApartment(buildingId, data)

            expect(mocks.db.insert).toHaveBeenCalled()
            expect(result).toEqual(newApt)
        })

        it('should throw error if apartment already exists', async () => {
            const buildingId = 'building-1'
            const data = { floor: '1', unitType: 'apartment', identifier: 'A' }

            mocks.db.limit.mockResolvedValueOnce([data]) // existing check returns match

            await expect(createApartment(buildingId, data)).rejects.toThrow('Unit already exists on this floor')
        })
    })

    describe('updateApartment', () => {
        it('should update apartment details', async () => {
            const apartmentId = 1
            const data = { identifier: 'B' }
            const updatedApt = { id: apartmentId, ...data }

            mocks.db.returning.mockResolvedValueOnce([updatedApt])

            const result = await updateApartment(apartmentId, data)

            expect(mocks.db.update).toHaveBeenCalled()
            expect(mocks.db.set).toHaveBeenCalledWith(data)
            expect(result).toEqual(updatedApt)
        })
    })

    describe('deleteApartment', () => {
        it('should delete apartment and related payments', async () => {
            const apartmentId = 1

            mocks.db.where.mockResolvedValue(undefined) // delete resolves to nothing

            const result = await deleteApartment(apartmentId)

            expect(mocks.db.delete).toHaveBeenCalledTimes(2) // payments + apartments
            expect(result).toBe(true)
        })
    })

    describe('getBuildingApartments', () => {
        it('should list all apartments for a building', async () => {
            const buildingId = 'building-1'
            const apartmentsList = [
                { apartment: { id: 1, identifier: 'A' }, resident: null },
                { apartment: { id: 2, identifier: 'B' }, resident: { id: 'u1' } }
            ]

            mocks.db.orderBy.mockResolvedValueOnce(apartmentsList)

            const result = await getBuildingApartments(buildingId)

            expect(mocks.db.select).toHaveBeenCalled()
            expect(mocks.db.leftJoin).toHaveBeenCalled()
            expect(result).toEqual(apartmentsList)
        })
    })
})
