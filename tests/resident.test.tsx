import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock DB
vi.mock('@/db', () => {
  const mockDb = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    transaction: vi.fn((cb) => cb(mockDb)),
  }
  return { db: mockDb }
})

import { db } from '@/db'
import {
  joinBuilding,
  claimApartment,
  getResidentBuildingDetails,
  getUnclaimedApartments
} from '@/app/actions/building'
import { building, user, apartments } from '@/db/schema'

// Mock auth
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}))

import { auth } from '@/lib/auth'

describe('Resident Actions', () => {
  const userId = 'user-resident'

  beforeEach(() => {
    vi.clearAllMocks()
    const mockDb = db as any
    mockDb.select.mockReturnThis()
    mockDb.from.mockReturnThis()
    mockDb.where.mockReturnThis()
    mockDb.limit.mockReturnThis()
    mockDb.orderBy.mockReturnThis()
    mockDb.innerJoin.mockReturnThis()
    mockDb.update.mockReturnThis()
    mockDb.set.mockReturnThis()
  })

  describe('joinBuilding', () => {
    it('should join a building with valid code', async () => {
      const mockDb = db as any
      // Find building by code
      mockDb.limit.mockResolvedValueOnce([{ id: 'build-1', code: 'CODE123' }])
      // Where for finding building
      mockDb.where.mockReturnValueOnce(mockDb)

      // Update user
      // where for update user
      mockDb.where.mockResolvedValueOnce(undefined)

      const result = await joinBuilding(userId, 'CODE123')
      expect(result).toEqual({ id: 'build-1', code: 'CODE123' })
      expect(mockDb.update).toHaveBeenCalledWith(user)
    })

    it('should throw error if code is invalid', async () => {
      const mockDb = db as any
      // Find building by code -> empty
      mockDb.limit.mockResolvedValueOnce([])
      mockDb.where.mockReturnValueOnce(mockDb)

      await expect(joinBuilding(userId, 'INVALID')).rejects.toThrow('Invalid building code')
    })
  })

  describe('claimApartment', () => {
    it('should claim an available apartment', async () => {
      const mockDb = db as any
      const mockSession = { user: { id: userId } }
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any)

      // 1. Verify apartment exists and unclaimed
      mockDb.limit.mockResolvedValueOnce([{ id: 1, residentId: null }])
      mockDb.where.mockReturnValueOnce(mockDb)

      // 2. Claim it (update)
      // where for update
      mockDb.where.mockResolvedValueOnce(undefined)

      const result = await claimApartment(1)
      expect(result).toEqual({ id: 1, residentId: null })
      expect(mockDb.update).toHaveBeenCalledWith(apartments)
      expect(mockDb.set).toHaveBeenCalledWith({ residentId: userId })
    })

    it('should fail if apartment is already claimed', async () => {
      const mockDb = db as any
      const mockSession = { user: { id: userId } }
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any)

      // 1. Verify apartment
      mockDb.limit.mockResolvedValueOnce([{ id: 1, residentId: 'other-user' }])
      mockDb.where.mockReturnValueOnce(mockDb)

      await expect(claimApartment(1)).rejects.toThrow('Apartment already claimed')
    })
  })

  describe('getUnclaimedApartments', () => {
    it('should return list of unclaimed apartments', async () => {
      const mockDb = db as any
      const mockApts = [
        { id: 1, floor: '1', identifier: 'A' },
        { id: 2, floor: '2', identifier: 'B' }
      ]

      // select().from().where().orderBy()
      // orderBy returns promise
      mockDb.orderBy.mockResolvedValueOnce(mockApts)
      // where returns this
      mockDb.where.mockReturnValueOnce(mockDb)

      const result = await getUnclaimedApartments('build-1')
      expect(result).toEqual(mockApts)
    })
  })
})
