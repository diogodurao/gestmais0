import { db } from "@/db"
import { building, user, apartments, payments, managerBuildings } from "@/db/schema"
import { eq, and, isNull, asc, inArray } from "drizzle-orm"
import { customAlphabet } from "nanoid"

export class BuildingService {
    async getOrCreateManagerBuilding(userId: string) {
        const existingUser = await db.select().from(user).where(eq(user.id, userId)).limit(1)
        if (!existingUser.length) throw new Error("User not found")

        const currentUser = existingUser[0]

        if (currentUser.activeBuildingId) {
            const existingBuilding = await db.select().from(building).where(eq(building.id, currentUser.activeBuildingId)).limit(1)
            if (existingBuilding.length) return existingBuilding[0]
        }

        const existingManagedBuildings = await db.select()
            .from(managerBuildings)
            .innerJoin(building, eq(managerBuildings.buildingId, building.id))
            .where(eq(managerBuildings.managerId, userId))
            .limit(1)

        if (existingManagedBuildings.length) {
            const firstBuilding = existingManagedBuildings[0].building
            await db.update(user).set({ activeBuildingId: firstBuilding.id }).where(eq(user.id, userId))
            return firstBuilding
        }

        const nanoidCode = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 6)
        const code = nanoidCode()

        const [newBuilding] = await db.insert(building).values({
            id: crypto.randomUUID(),
            name: `BUILDING_${code.toUpperCase()}`,
            nif: "N/A",
            code: code,
            managerId: userId,
            subscriptionStatus: 'incomplete',
        }).returning()

        await db.insert(managerBuildings).values({
            managerId: userId,
            buildingId: newBuilding.id,
            isOwner: true,
        })

        await db.update(user).set({ activeBuildingId: newBuilding.id }).where(eq(user.id, userId))

        return newBuilding
    }

    async createNewBuilding(userId: string, name: string, nif: string) {
        const nanoidCode = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 6)
        const code = nanoidCode()

        const [newBuilding] = await db.insert(building).values({
            id: crypto.randomUUID(),
            name: name || "New Building",
            nif: nif || "N/A",
            code: code,
            managerId: userId,
            subscriptionStatus: 'incomplete',
        }).returning()

        await db.insert(managerBuildings).values({
            managerId: userId,
            buildingId: newBuilding.id,
            isOwner: true,
        })

        await db.update(user).set({ activeBuildingId: newBuilding.id }).where(eq(user.id, userId))

        return newBuilding
    }

    async getManagerBuildings(userId: string) {
        const result = await db.select({
            building: building,
            isOwner: managerBuildings.isOwner,
        })
            .from(managerBuildings)
            .innerJoin(building, eq(managerBuildings.buildingId, building.id))
            .where(eq(managerBuildings.managerId, userId))

        return result
    }

    async switchActiveBuilding(userId: string, buildingId: string) {
        // Validation of access should happen in the caller or here if we pass session context, 
        // for now we trust the caller has verified access or we verify it here via DB

        // Ensure user has access
        const access = await db.select().from(managerBuildings).where(and(
            eq(managerBuildings.managerId, userId),
            eq(managerBuildings.buildingId, buildingId)
        )).limit(1)

        if (!access.length) throw new Error("Unauthorized access to building")

        await db.update(user).set({ activeBuildingId: buildingId }).where(eq(user.id, userId))
        return true
    }

    // Resident Actions
    async joinBuilding(userId: string, code: string) {
        if (!code) throw new Error("Code is required")

        const normalizedCode = code.toLowerCase().trim()
        const foundBuilding = await db.select().from(building).where(eq(building.code, normalizedCode)).limit(1)

        if (!foundBuilding.length) throw new Error("Invalid building code")

        const targetBuilding = foundBuilding[0]

        if (targetBuilding.subscriptionStatus !== 'active') {
            throw new Error("This building is not accepting residents at this time")
        }

        await db.update(user).set({ buildingId: targetBuilding.id }).where(eq(user.id, userId))

        return targetBuilding
    }

    async getResidentBuildingDetails(buildingId: string) {
        const result = await db.select({
            building: building,
            manager: { name: user.name, email: user.email }
        })
            .from(building)
            .innerJoin(user, eq(building.managerId, user.id))
            .where(eq(building.id, buildingId))
            .limit(1)

        return result[0] || null
    }

    async claimApartment(userId: string, apartmentId: number) {
        return await db.transaction(async (tx) => {
            await tx.update(apartments).set({ residentId: null }).where(eq(apartments.residentId, userId))

            const updateResult = await tx.update(apartments)
                .set({ residentId: userId })
                .where(and(eq(apartments.id, apartmentId), isNull(apartments.residentId)))
                .returning()

            if (updateResult.length === 0) {
                const exists = await tx.select().from(apartments).where(eq(apartments.id, apartmentId)).limit(1)
                if (!exists.length) throw new Error("Apartment not found")
                throw new Error("Apartment already claimed")
            }

            return updateResult[0]
        })
    }

    async getResidentApartment(userId: string) {
        const result = await db.select().from(apartments).where(eq(apartments.residentId, userId)).limit(1)
        return result[0] || null
    }

    async getUnclaimedApartments(buildingId: string) {
        const result = await db.select()
            .from(apartments)
            .where(and(eq(apartments.buildingId, buildingId), isNull(apartments.residentId)))
            .orderBy(asc(apartments.id))

        return result
    }

    // Building Info
    async getBuildingResidents(buildingId: string) {
        const result = await db.select({ user: user, apartment: apartments })
            .from(user)
            .leftJoin(apartments, eq(apartments.residentId, user.id))
            .where(and(eq(user.buildingId, buildingId), eq(user.role, 'resident')))

        return result
    }

    async getBuilding(buildingId: string) {
        const result = await db.select().from(building).where(eq(building.id, buildingId)).limit(1)
        return result[0] || null
    }

    async getBuildingApartments(buildingId: string) {
        const result = await db.select({
            apartment: apartments,
            resident: { id: user.id, name: user.name, email: user.email }
        })
            .from(apartments)
            .leftJoin(user, eq(apartments.residentId, user.id))
            .where(eq(apartments.buildingId, buildingId))
            .orderBy(asc(apartments.id))

        return result
    }

    async updateBuilding(
        buildingId: string,
        data: {
            name?: string
            nif?: string
            iban?: string | null
            city?: string | null
            street?: string | null
            number?: string | null
            quotaMode?: string
            monthlyQuota?: number
            totalApartments?: number
        }
    ) {
        // Caller checks permissions
        const [updated] = await db.update(building)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(building.id, buildingId))
            .returning()

        return updated
    }

    async completeBuildingSetup(buildingId: string) {
        const [updated] = await db.update(building)
            .set({ setupComplete: true, updatedAt: new Date() })
            .where(eq(building.id, buildingId))
            .returning()
        return updated
    }

    // Apartment CRUD
    async createApartment(
        buildingId: string,
        data: { unit: string; permillage?: number | null }
    ) {
        if (!buildingId || !data.unit) {
            throw new Error("Missing required fields")
        }

        const existing = await db.select().from(apartments).where(and(
            eq(apartments.buildingId, buildingId),
            eq(apartments.unit, data.unit)
        )).limit(1)

        if (existing.length) throw new Error("Unit already exists")

        const [newApt] = await db.insert(apartments).values({
            buildingId,
            unit: data.unit,
            permillage: data.permillage,
        }).returning()

        return newApt
    }

    async updateApartment(
        apartmentId: number,
        data: { unit?: string; permillage?: number | null }
    ) {
        const [updated] = await db.update(apartments).set(data).where(eq(apartments.id, apartmentId)).returning()
        return updated
    }

    async deleteApartment(apartmentId: number) {
        await db.delete(payments).where(eq(payments.apartmentId, apartmentId))
        await db.delete(apartments).where(eq(apartments.id, apartmentId))
        return true
    }

    async bulkDeleteApartments(apartmentIds: number[]) {
        if (!apartmentIds.length) return true

        await db.delete(payments).where(inArray(payments.apartmentId, apartmentIds))
        await db.delete(apartments).where(inArray(apartments.id, apartmentIds))

        return true
    }


}

export const buildingService = new BuildingService()
