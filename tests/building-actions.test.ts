import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  createBuildingForManager,
  updateBuilding,
  createApartment,
  deleteApartment,
  bulkCreateApartments,
  updateApartment,
} from "@/app/actions/building"

// Mock nanoid
vi.mock("nanoid", () => ({
  customAlphabet: () => () => "123456",
}))

// Mock DB
vi.mock("@/db", () => {
  const mockDb = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    transaction: vi.fn((cb) => cb(mockDb)),
  }
  return {
    db: mockDb,
  }
})

// Import db after mock
import { db } from "@/db"

describe("Building Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Setup chainable mocks
    const mockChain = () => {
      const chain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve([])), // Default empty array
      }
      return chain
    }

    db.select.mockReturnValue(mockChain())

    db.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: "test-id" }]),
      }),
    })

    db.update.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: "test-id" }]),
        }),
      }),
    })

    db.delete.mockReturnValue({
      where: vi.fn().mockResolvedValue([]),
    })
  })

  describe("createBuildingForManager", () => {
    it("should create a building and update user", async () => {
      const mockBuilding = { id: "new-building-id", code: "123456", managerId: "manager-1" }

      db.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockBuilding]),
        }),
      })

      db.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      })

      const result = await createBuildingForManager("manager-1", "Test Building", "123456789")

      expect(db.insert).toHaveBeenCalled()
      expect(db.update).toHaveBeenCalled() // User update
      expect(result).toEqual(mockBuilding)
    })
  })

  describe("updateBuilding", () => {
    it("should update building details", async () => {
      const mockUpdated = { id: "b-1", name: "Updated Name" }

      db.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdated]),
          }),
        }),
      })

      const result = await updateBuilding("b-1", { name: "Updated Name" })

      expect(db.update).toHaveBeenCalled()
      expect(result).toEqual(mockUpdated)
    })
  })

  describe("createApartment", () => {
    it("should create apartment if not exists", async () => {
        const selectChain = {
            from: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue([]),
        }
        db.select.mockReturnValue(selectChain)

        const mockApt = { id: 1, unit: "1A", buildingId: "b-1" }
        db.insert.mockReturnValue({
            values: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([mockApt]),
            }),
        })

        const result = await createApartment("b-1", "1A")

        expect(db.select).toHaveBeenCalled()
        expect(db.insert).toHaveBeenCalled()
        expect(result).toEqual(mockApt)
    })

    it("should throw error if apartment exists", async () => {
         const selectChain = {
            from: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue([{ id: 1 }]),
        }
        db.select.mockReturnValue(selectChain)

        await expect(createApartment("b-1", "1A")).rejects.toThrow("Apartment already exists")
    })
  })

  describe("deleteApartment", () => {
    it("should delete payments and apartment", async () => {
        const aptId = 123
        await deleteApartment(aptId)

        expect(db.delete).toHaveBeenCalledTimes(2)
    })
  })

  describe("bulkCreateApartments", () => {
    it("should create multiple apartments skipping existing ones", async () => {
        const buildingId = "b-1"
        const units = "1A\n1B"

        const selectChain = {
            from: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            limit: vi.fn()
                .mockResolvedValueOnce([{ id: 1 }])
                .mockResolvedValueOnce([]),
        }
        db.select.mockReturnValue(selectChain)

        const mockApt = { id: 2, unit: "1B", buildingId }
        db.insert.mockReturnValue({
            values: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([mockApt]),
            }),
        })

        const result = await bulkCreateApartments(buildingId, units)

        expect(db.insert).toHaveBeenCalledTimes(1)
        expect(result).toHaveLength(1)
        expect(result[0]).toEqual(mockApt)
    })

    it("should throw if no units provided", async () => {
        await expect(bulkCreateApartments("b-1", "")).rejects.toThrow("No units provided")
    })
  })

  describe("updateApartment", () => {
      it("should update apartment details", async () => {
          const mockUpdated = { id: 1, unit: "1A Updated" }

          db.update.mockReturnValue({
              set: vi.fn().mockReturnValue({
                  where: vi.fn().mockReturnValue({
                      returning: vi.fn().mockResolvedValue([mockUpdated]),
                  }),
              }),
          })

          const result = await updateApartment(1, { unit: "1A Updated" })

          expect(db.update).toHaveBeenCalled()
          expect(result).toEqual(mockUpdated)
      })
  })
})
