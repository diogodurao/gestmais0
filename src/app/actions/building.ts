"use server"

import { db } from "@/db"
import { building, user, apartments, payments, managerBuildings } from "@/db/schema"
import { eq, and, isNull, asc } from "drizzle-orm"
import { requireSession, requireBuildingAccess } from "@/lib/auth-helpers"

export async function getOrCreateManagerBuilding(userId: string) {
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

    const { customAlphabet } = await import("nanoid")
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

export async function createNewBuilding(userId: string, name: string, nif: string) {
    const { customAlphabet } = await import("nanoid")
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

export async function getManagerBuildings(userId: string) {
    const result = await db.select({
        building: building,
        isOwner: managerBuildings.isOwner,
    })
        .from(managerBuildings)
        .innerJoin(building, eq(managerBuildings.buildingId, building.id))
        .where(eq(managerBuildings.managerId, userId))

    return result
}

export async function switchActiveBuilding(buildingId: string) {
    const { session } = await requireBuildingAccess(buildingId)
    await db.update(user).set({ activeBuildingId: buildingId }).where(eq(user.id, session.user.id))
    return true
}

// ==========================================
// RESIDENT ACTIONS
// ==========================================

export async function joinBuilding(userId: string, code: string) {
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

export async function getResidentBuildingDetails(buildingId: string) {
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

export async function claimApartment(apartmentId: number) {
    const session = await requireSession()
    const userId = session.user.id

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

export async function getResidentApartment(userId: string) {
    const result = await db.select().from(apartments).where(eq(apartments.residentId, userId)).limit(1)
    return result[0] || null
}

export async function getUnclaimedApartments(buildingId: string) {
    const result = await db.select()
        .from(apartments)
        .where(and(eq(apartments.buildingId, buildingId), isNull(apartments.residentId)))
        .orderBy(asc(apartments.id))

    return result
}

// ==========================================
// BUILDING INFO ACTIONS
// ==========================================

export async function getBuildingResidents(buildingId: string) {
    const result = await db.select({ user: user, apartment: apartments })
        .from(user)
        .leftJoin(apartments, eq(apartments.residentId, user.id))
        .where(and(eq(user.buildingId, buildingId), eq(user.role, 'resident')))

    return result
}

export async function getBuilding(buildingId: string) {
    const result = await db.select().from(building).where(eq(building.id, buildingId)).limit(1)
    return result[0] || null
}

export async function getBuildingApartments(buildingId: string) {
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

export async function updateBuilding(
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
    await requireBuildingAccess(buildingId)

    const [updated] = await db.update(building)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(building.id, buildingId))
        .returning()

    return updated
}

export async function completeBuildingSetup(buildingId: string) {
    await requireBuildingAccess(buildingId)
    const [updated] = await db.update(building)
        .set({ setupComplete: true, updatedAt: new Date() })
        .where(eq(building.id, buildingId))
        .returning()
    return updated
}

// ==========================================
// APARTMENT CRUD ACTIONS
// ==========================================

export async function createApartment(
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

export async function updateApartment(
    apartmentId: number,
    data: { unit?: string; permillage?: number | null }
) {
    const [updated] = await db.update(apartments).set(data).where(eq(apartments.id, apartmentId)).returning()
    return updated
}

export async function deleteApartment(apartmentId: number) {
    await db.delete(payments).where(eq(payments.apartmentId, apartmentId))
    await db.delete(apartments).where(eq(apartments.id, apartmentId))
    return true
}

export async function bulkDeleteApartments(apartmentIds: number[]) {
    if (!apartmentIds.length) return true

    await requireSession()
    const { inArray } = await import("drizzle-orm")

    await db.delete(payments).where(inArray(payments.apartmentId, apartmentIds))
    await db.delete(apartments).where(inArray(apartments.id, apartmentIds))

    return true
}

export async function bulkCreateApartments(
    buildingId: string,
    units: Array<{ unit: string; permillage?: number | null }>
) {
    if (!units.length) throw new Error("No units provided")

    const created: typeof apartments.$inferSelect[] = []

    for (const u of units) {
        const existing = await db.select().from(apartments).where(and(
            eq(apartments.buildingId, buildingId),
            eq(apartments.unit, u.unit)
        )).limit(1)

        if (!existing.length) {
            const [newApt] = await db.insert(apartments).values({
                buildingId,
                unit: u.unit,
                permillage: u.permillage,
            }).returning()
            created.push(newApt)
        }
    }

    return created
}