"use server"

import { db } from "@/db"
import { building, user, apartments, payments, managerBuildings } from "@/db/schema"
import { eq, and, isNull, asc } from "drizzle-orm"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

// ==========================================
// MANAGER BUILDING ACTIONS
// ==========================================

export async function getOrCreateManagerBuilding(userId: string, userNif: string) {
    // 1. Check if user has an active building selected
    const existingUser = await db.select().from(user).where(eq(user.id, userId)).limit(1)
    if (!existingUser.length) throw new Error("User not found")

    const currentUser = existingUser[0]

    // If manager has an active building, return it
    if (currentUser.activeBuildingId) {
        const existingBuilding = await db.select().from(building).where(eq(building.id, currentUser.activeBuildingId)).limit(1)
        if (existingBuilding.length) return existingBuilding[0]
    }

    // Check if manager has any buildings via junction table
    const existingManagedBuildings = await db.select()
        .from(managerBuildings)
        .innerJoin(building, eq(managerBuildings.buildingId, building.id))
        .where(eq(managerBuildings.managerId, userId))
        .limit(1)

    if (existingManagedBuildings.length) {
        // Set the first one as active
        const firstBuilding = existingManagedBuildings[0].building
        await db.update(user)
            .set({ activeBuildingId: firstBuilding.id })
            .where(eq(user.id, userId))
        return firstBuilding
    }

    // 2. Create new building
    const { customAlphabet } = await import("nanoid")
    const nanoidCode = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 6)
    const code = nanoidCode()

    const [newBuilding] = await db.insert(building).values({
        id: crypto.randomUUID(),
        name: "My Condominium",
        nif: userNif || "N/A",
        code: code,
        managerId: userId,
    }).returning()

    // 3. Create junction table entry
    await db.insert(managerBuildings).values({
        managerId: userId,
        buildingId: newBuilding.id,
        isOwner: true,
    })

    // 4. Set as active building
    await db.update(user)
        .set({ activeBuildingId: newBuilding.id })
        .where(eq(user.id, userId))

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
    }).returning()

    // Create junction table entry
    await db.insert(managerBuildings).values({
        managerId: userId,
        buildingId: newBuilding.id,
        isOwner: true,
    })

    // Set as active building
    await db.update(user)
        .set({ activeBuildingId: newBuilding.id })
        .where(eq(user.id, userId))

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
    // Get current user from session
    const session = await auth.api.getSession({
        headers: await headers()
    })
    
    if (!session) throw new Error("Unauthorized")
    
    const userId = session.user.id

    // Verify manager has access to this building
    const access = await db.select()
        .from(managerBuildings)
        .where(and(
            eq(managerBuildings.managerId, userId),
            eq(managerBuildings.buildingId, buildingId)
        ))
        .limit(1)

    if (!access.length) throw new Error("Access denied to this building")

    await db.update(user)
        .set({ activeBuildingId: buildingId })
        .where(eq(user.id, userId))

    return true
}

// ==========================================
// RESIDENT ACTIONS
// ==========================================

export async function joinBuilding(userId: string, code: string) {
    if (!code) throw new Error("Code is required")

    const foundBuilding = await db.select().from(building).where(eq(building.code, code)).limit(1)

    if (!foundBuilding.length) {
        throw new Error("Invalid building code")
    }

    const targetBuilding = foundBuilding[0]

    await db.update(user)
        .set({ buildingId: targetBuilding.id })
        .where(eq(user.id, userId))

    return targetBuilding
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

export async function claimApartment(apartmentId: number) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) throw new Error("Unauthorized")

    const userId = session.user.id

    // Use a transaction and atomic update to prevent race conditions
    return await db.transaction(async (tx) => {
        // 1. Unassign any existing apartment for this user
        await tx.update(apartments)
            .set({ residentId: null })
            .where(eq(apartments.residentId, userId))

        // 2. Claim the new one
        const updateResult = await tx.update(apartments)
            .set({ residentId: userId })
            .where(and(
                eq(apartments.id, apartmentId),
                isNull(apartments.residentId)
            ))
            .returning()

        if (updateResult.length === 0) {
            // Check if it exists at all to provide better error message
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
        .where(and(
            eq(apartments.buildingId, buildingId),
            isNull(apartments.residentId)
        ))
        .orderBy(asc(apartments.floor), asc(apartments.identifier))

    return result
}

// ==========================================
// BUILDING INFO ACTIONS
// ==========================================

export async function getBuildingResidents(buildingId: string) {
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
        .orderBy(asc(apartments.floor), asc(apartments.identifier))

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

// ==========================================
// APARTMENT CRUD ACTIONS
// ==========================================


export async function createApartment(
    buildingId: string,
    data: {
        floor: string
        unitType: string
        identifier: string
        permillage?: number | null
    }
) {
    if (!buildingId || !data.floor || !data.unitType || !data.identifier) {
        throw new Error("Missing required fields")
    }

    // Check if exists (same floor + identifier + unitType)
    const existing = await db.select().from(apartments).where(and(
        eq(apartments.buildingId, buildingId),
        eq(apartments.floor, data.floor),
        eq(apartments.identifier, data.identifier),
        eq(apartments.unitType, data.unitType)
    )).limit(1)

    if (existing.length) throw new Error("Unit already exists on this floor")

    const [newApt] = await db.insert(apartments).values({
        buildingId,
        floor: data.floor,
        unitType: data.unitType,
        identifier: data.identifier,
        permillage: data.permillage,
    }).returning()

    return newApt
}

export async function updateApartment(
    apartmentId: number,
    data: {
        floor?: string
        unitType?: string
        identifier?: string
        permillage?: number | null
    }
) {
    const [updated] = await db.update(apartments)
        .set(data)
        .where(eq(apartments.id, apartmentId))
        .returning()

    return updated
}

export async function deleteApartment(apartmentId: number) {
    // Delete related payments first
    await db.delete(payments).where(eq(payments.apartmentId, apartmentId))

    // Delete apartment
    await db.delete(apartments).where(eq(apartments.id, apartmentId))

    return true
}

export async function bulkDeleteApartments(apartmentIds: number[]) {
    if (!apartmentIds.length) return true

    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session || session.user.role !== 'manager') {
        throw new Error("Unauthorized")
    }

    // Delete related payments first for all apartments
    await db.delete(payments).where(eq(payments.apartmentId, apartmentIds[0])) // simplified for now, should use inArray
    // Actually, Drizzle supports inArray
    const { inArray } = await import("drizzle-orm")
    
    await db.delete(payments).where(inArray(payments.apartmentId, apartmentIds))
    await db.delete(apartments).where(inArray(apartments.id, apartmentIds))

    return true
}

// Bulk create - simplified for structured units
export async function bulkCreateApartments(
    buildingId: string,
    units: Array<{
        floor: string
        unitType: string
        identifier: string
        permillage?: number | null
    }>
) {
    if (!units.length) throw new Error("No units provided")

    const created: typeof apartments.$inferSelect[] = []

    for (const unit of units) {
        const existing = await db.select().from(apartments).where(and(
            eq(apartments.buildingId, buildingId),
            eq(apartments.floor, unit.floor),
            eq(apartments.identifier, unit.identifier),
            eq(apartments.unitType, unit.unitType)
        )).limit(1)

        if (!existing.length) {
            const [newApt] = await db.insert(apartments).values({
                buildingId,
                floor: unit.floor,
                unitType: unit.unitType,
                identifier: unit.identifier,
                permillage: unit.permillage,
            }).returning()
            created.push(newApt)
        }
    }

    return created
}
