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

// Helper to verify manager ownership
async function verifyManager(buildingId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session || !session.user) throw new Error("Unauthorized")

    // Check if the user is the manager of the building
    const b = await db.select().from(building).where(eq(building.id, buildingId)).limit(1)
    if (!b.length || b[0].managerId !== session.user.id) {
        throw new Error("Unauthorized: Not the building manager")
    }
    return session.user
}

export async function createApartment(buildingId: string, unit: string) {
    await verifyManager(buildingId)

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
    // We need buildingId to verify manager. First fetch the apartment
    const apt = await db.select().from(apartments).where(eq(apartments.id, apartmentId)).limit(1)
    if (!apt.length) throw new Error("Apartment not found")

    await verifyManager(apt[0].buildingId)

    // Delete related payments first (cascade usually handles this if defined, but explicit is safer for MVP)
    await db.delete(payments).where(eq(payments.apartmentId, apartmentId))

    // Delete apartment
    await db.delete(apartments).where(eq(apartments.id, apartmentId))

    return true
}

// New actions for Manager
export async function updateBuilding(buildingId: string, data: Partial<typeof building.$inferInsert>) {
    await verifyManager(buildingId)

    await db.update(building)
        .set(data)
        .where(eq(building.id, buildingId))
    return true
}

export async function getBuildingApartments(buildingId: string) {
    const result = await db.select({
        id: apartments.id,
        unit: apartments.unit,
        residentId: apartments.residentId,
        residentName: user.name,
    })
        .from(apartments)
        .leftJoin(user, eq(apartments.residentId, user.id))
        .where(eq(apartments.buildingId, buildingId))
        .orderBy(apartments.unit)

    return result
}

// New actions for Resident
export async function getAvailableApartments(buildingId: string) {
    // Return apartments that have no residentId
    const result = await db.select().from(apartments)
        .where(and(
            eq(apartments.buildingId, buildingId),
            // We want apartments where residentId is null
        ))
        // Filtering for null in code or using isNull()

    // Drizzle isNull helper needed? Or just filter results.
    // Let's import isNull from drizzle-orm
    return result.filter(apt => !apt.residentId)
}

import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export async function claimApartment(buildingId: string, unit: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) throw new Error("Unauthorized")

    const userId = session.user.id

    // Check if apartment exists and is free
    const existing = await db.select().from(apartments).where(and(
        eq(apartments.buildingId, buildingId),
        eq(apartments.unit, unit)
    )).limit(1)

    if (existing.length) {
        const apt = existing[0]
        if (apt.residentId) {
            throw new Error("Apartment is already taken")
        }

        // Claim it
        await db.update(apartments)
            .set({ residentId: userId })
            .where(eq(apartments.id, apt.id))
        return apt
    } else {
        // We do NOT create new apartments here anymore (Manager must create them)
        // Only if legacy support needed? Requirement says "select from list"
        throw new Error("Apartment not found")
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
