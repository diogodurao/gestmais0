"use server"

import { db } from "@/db"
import { building, user, apartments, payments } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { nanoid } from "nanoid"

export async function getOrCreateManagerBuilding(userId: string, userNif: string) {
    // 1. Check if user already has a building
    const existingUser = await db.select().from(user).where(eq(user.id, userId)).limit(1)
    if (!existingUser.length) throw new Error("User not found")

    const currentUser = existingUser[0]

    if (currentUser.buildingId) {
        // Return existing building
        const existingBuilding = await db.select().from(building).where(eq(building.id, currentUser.buildingId)).limit(1)
        return existingBuilding[0]
    }

    // 2. Create new building
    // Generate a simple short code for invites
    // User requested: no hyphens, no capslock. So we use alphanumeric mixed case.
    const { customAlphabet } = await import("nanoid")
    const nanoidCode = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 6)
    const code = nanoidCode()

    // We'll use the user's NIF as the building NIF by default for MVP simplification
    // or we could ask for it. But requirements say "generate buildingid".

    const [newBuilding] = await db.insert(building).values({
        id: crypto.randomUUID(),
        name: "My Condominium", // Default name, editable later
        nif: userNif || "N/A",
        code: code,
        managerId: userId,
    }).returning()

    // 3. Link user to building
    await db.update(user)
        .set({ buildingId: newBuilding.id })
        .where(eq(user.id, userId))

    return newBuilding
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

export async function claimApartment(buildingId: string, unit: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) throw new Error("Unauthorized")

    const userId = session.user.id

    // Check if apartment exists
    const existing = await db.select().from(apartments).where(and(
        eq(apartments.buildingId, buildingId),
        eq(apartments.unit, unit)
    )).limit(1)

    if (existing.length) {
        // Update existing
        await db.update(apartments)
            .set({ residentId: userId })
            .where(eq(apartments.id, existing[0].id))
        return existing[0]
    } else {
        // Create new
        const [newApt] = await db.insert(apartments).values({
            buildingId,
            unit,
            residentId: userId,
        }).returning()
        return newApt
    }
}

export async function getResidentApartment(userId: string) {
    const result = await db.select().from(apartments).where(eq(apartments.residentId, userId)).limit(1)
    return result[0] || null
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
    const units = unitsString.split(',').map(u => u.trim()).filter(Boolean)
    if (!units.length) throw new Error("No units provided")

    const created: typeof apartments.$inferSelect[] = []

    for (const unit of units) {
        const existing = await db.select().from(apartments).where(and(
            eq(apartments.buildingId, buildingId),
            eq(apartments.unit, unit)
        )).limit(1)

        if (!existing.length) {
            const [newApt] = await db.insert(apartments).values({
                buildingId,
                unit,
            }).returning()
            created.push(newApt)
        }
    }

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
