"use server"

import { db } from "@/db"
import { building, user, apartments, payments } from "@/db/schema"
import { eq, and } from "drizzle-orm"

export async function getOrCreateManagerBuilding(userId: string, userNif: string) {
    const existingUser = await db.select().from(user).where(eq(user.id, userId)).limit(1)
    if (!existingUser.length) throw new Error("User not found")
    const currentUser = existingUser[0]

    const currentBuildings = await db.select().from(building).where(eq(building.managerId, userId))
    let activeBuilding = currentBuildings.find(b => b.id === currentUser.buildingId) || null
    let buildings = [...currentBuildings]

    if (!activeBuilding) {
        if (!currentBuildings.length) {
            const { customAlphabet } = await import("nanoid")
            const nanoidCode = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 6)
            const code = nanoidCode()

            const [newBuilding] = await db.insert(building).values({
                id: crypto.randomUUID(),
                name: "My Condominium",
                nif: userNif || "N/A",
                code,
                managerId: userId,
            }).returning()

            activeBuilding = newBuilding
            buildings = [newBuilding]
        } else {
            activeBuilding = currentBuildings[0]
        }

        await db.update(user)
            .set({ buildingId: activeBuilding.id })
            .where(eq(user.id, userId))
    }

    return { activeBuilding, buildings }
}

export async function joinBuilding(userId: string, code: string) {
    if (!code) throw new Error("Code is required")

    // Find building by code
    const foundBuilding = await db.select().from(building).where(eq(building.code, code)).limit(1)

    if (!foundBuilding.length) {
        throw new Error("Invalid building code")
    }

    const targetBuilding = foundBuilding[0]

    // Link user
    await db.update(user)
        .set({ buildingId: targetBuilding.id })
        .where(eq(user.id, userId))

    return targetBuilding
}

export async function getManagerBuildings(managerId: string) {
    const buildings = await db.select().from(building).where(eq(building.managerId, managerId))
    return buildings
}

export async function setActiveBuilding(managerId: string, buildingId: string) {
    const ownedBuilding = await db.select().from(building).where(and(
        eq(building.managerId, managerId),
        eq(building.id, buildingId)
    )).limit(1)

    if (!ownedBuilding.length) {
        throw new Error("Building not found or not owned by manager")
    }

    await db.update(user)
        .set({ buildingId: buildingId })
        .where(eq(user.id, managerId))

    return ownedBuilding[0]
}

export async function createBuildingForManager(managerId: string, name: string, nif: string | null) {
    const { customAlphabet } = await import("nanoid")
    const nanoidCode = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 6)
    const code = nanoidCode()

    const [newBuilding] = await db.insert(building).values({
        id: crypto.randomUUID(),
        name: name || "New Building",
        nif: nif || "N/A",
        code,
        managerId,
    }).returning()

    await db.update(user)
        .set({ buildingId: newBuilding.id })
        .where(eq(user.id, managerId))

    return newBuilding
}

export async function getResidentBuildingDetails(buildingId: string) {
    const result = await db.select({
        building: building,
        manager: {
            name: user.name,
            email: user.email,
        }
    })
        .from(building)
        .innerJoin(user, eq(building.managerId, user.id))
        .where(eq(building.id, buildingId))
        .limit(1)

    return result[0] || null
}

export async function createApartment(buildingId: string, unit: string) {
    if (!buildingId || !unit) throw new Error("Missing fields")

    // Check if exists
    const existing = await db.select().from(apartments).where(and(
        eq(apartments.buildingId, buildingId),
        eq(apartments.unit, unit)
    )).limit(1)

    if (existing.length) throw new Error("Apartment already exists")

    const [newApt] = await db.insert(apartments).values({
        buildingId,
        unit,
    }).returning()

    return newApt
}

export async function deleteApartment(apartmentId: number) {
    // Delete related payments first (cascade usually handles this if defined, but explicit is safer for MVP)
    await db.delete(payments).where(eq(payments.apartmentId, apartmentId))

    // Delete apartment
    await db.delete(apartments).where(eq(apartments.id, apartmentId))

    return true
}

import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export async function claimApartment(buildingId: string, apartmentId: number, userId: string) {
    if (!buildingId || !apartmentId || !userId) throw new Error("Missing fields")

    const targetApartment = await db.select().from(apartments).where(and(
        eq(apartments.id, apartmentId),
        eq(apartments.buildingId, buildingId)
    )).limit(1)

    if (!targetApartment.length) {
        throw new Error("Apartment not found for this building")
    }

    if (targetApartment[0].residentId && targetApartment[0].residentId !== userId) {
        throw new Error("Apartment already claimed")
    }

    const [updated] = await db.update(apartments)
        .set({ residentId: userId })
        .where(eq(apartments.id, apartmentId))
        .returning()

    // Ensure user is linked to this building
    await db.update(user)
        .set({ buildingId, profileComplete: true, updatedAt: new Date() })
        .where(eq(user.id, userId))

    return updated
}

export async function getResidentApartment(userId: string) {
    const result = await db.select().from(apartments).where(eq(apartments.residentId, userId)).limit(1)
    return result[0] || null
}

export async function getUnclaimedApartments(buildingId: string) {
    const result = await db.select().from(apartments)
        .where(and(
            eq(apartments.buildingId, buildingId),
            eq(apartments.residentId, null)
        ))
        .orderBy(apartments.unit)

    return result
}

export async function getBuildingResidents(buildingId: string) {
    // Get all users linked to this building with role resident
    // Also join with apartment to show their unit if they have one
    const result = await db.select({
        user: user,
        apartment: apartments
    })
        .from(user)
        .leftJoin(apartments, eq(apartments.residentId, user.id))
        .where(and(
            eq(user.buildingId, buildingId),
            eq(user.role, 'resident')
        ))

    return result
}

export async function getBuilding(buildingId: string) {
    const result = await db.select().from(building).where(eq(building.id, buildingId)).limit(1)
    return result[0] || null
}

export async function getResidentStatus(userId: string) {
    const existingUser = await db.select().from(user).where(eq(user.id, userId)).limit(1)
    if (!existingUser.length) throw new Error("User not found")

    const profile = existingUser[0]
    const residentApartment = profile.buildingId ? await getResidentApartment(userId) : null

    return {
        buildingId: profile.buildingId,
        profileComplete: Boolean(profile.profileComplete),
        apartment: residentApartment,
    }
}

export async function getBuildingApartments(buildingId: string) {
    const result = await db.select({
        apartment: apartments,
        resident: {
            id: user.id,
            name: user.name,
            email: user.email,
        }
    })
        .from(apartments)
        .leftJoin(user, eq(apartments.residentId, user.id))
        .where(eq(apartments.buildingId, buildingId))
        .orderBy(apartments.unit)

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
    }
) {
    const [updated] = await db.update(building)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(building.id, buildingId))
        .returning()

    return updated
}

export async function bulkCreateApartments(buildingId: string, unitsString: string) {
    const units = unitsString
        .split(/[\n,]/)
        .map(u => u.trim())
        .filter(Boolean)
    if (!units.length) throw new Error("No units provided")

    // Use batch insert with onConflictDoNothing to handle duplicates efficiently
    const values = units.map(unit => ({
        buildingId,
        unit,
    }));

    const created = await db.insert(apartments)
        .values(values)
        .onConflictDoNothing({ target: [apartments.buildingId, apartments.unit] })
        .returning();

    return created
}

export async function updateApartment(
    apartmentId: number,
    data: {
        unit?: string
        floor?: number | null
        permillage?: number | null
    }
) {
    const [updated] = await db.update(apartments)
        .set(data)
        .where(eq(apartments.id, apartmentId))
        .returning()

    return updated
}

export async function completeResidentProfile(
    userId: string,
    data: {
        name?: string
    }
) {
    if (!userId) throw new Error("Missing user")

    const updatePayload: Partial<typeof user.$inferInsert> = {
        profileComplete: true,
        updatedAt: new Date(),
    }

    if (data.name) {
        updatePayload.name = data.name
    }

    const [updated] = await db.update(user)
        .set(updatePayload)
        .where(eq(user.id, userId))
        .returning({
            id: user.id,
            name: user.name,
            profileComplete: user.profileComplete,
        })

    return updated
}
