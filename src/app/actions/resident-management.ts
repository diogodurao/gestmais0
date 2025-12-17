"use server"

import { db } from "@/db"
import { apartments, user, managerBuildings } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

// ==========================================
// RESIDENT MANAGEMENT ACTIONS
// ==========================================

export async function removeResidentFromBuilding(residentId: string, buildingId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session || session.user.role !== 'manager') {
        throw new Error("Unauthorized")
    }

    // Verify manager owns/manages this building
    const managedBuilding = await db.select()
        .from(managerBuildings)
        .where(and(
            eq(managerBuildings.managerId, session.user.id),
            eq(managerBuildings.buildingId, buildingId)
        ))
        .limit(1)

    if (!managedBuilding.length) {
        throw new Error("Unauthorized: You do not manage this building")
    }
    
    // 1. Unassign apartment if they have one IN THIS BUILDING
    await db.update(apartments)
        .set({ residentId: null })
        .where(and(
            eq(apartments.residentId, residentId),
            eq(apartments.buildingId, buildingId)
        ))

    // 2. Remove building association from user
    await db.update(user)
        .set({ buildingId: null })
        .where(and(
            eq(user.id, residentId),
            eq(user.buildingId, buildingId)
        ))

    return true
}

export async function updateResidentUnit(residentId: string, newApartmentId: number | null) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session || session.user.role !== 'manager') {
        throw new Error("Unauthorized")
    }

    // Helper to check building access
    const checkBuildingAccess = async (bId: string) => {
        const access = await db.select()
            .from(managerBuildings)
            .where(and(
                eq(managerBuildings.managerId, session.user.id),
                eq(managerBuildings.buildingId, bId)
            ))
            .limit(1)
        if (!access.length) throw new Error("Unauthorized access to building")
    }

    // 1. Check current apartment ownership (if any)
    const currentApt = await db.select().from(apartments).where(eq(apartments.residentId, residentId)).limit(1)
    if (currentApt.length) {
        await checkBuildingAccess(currentApt[0].buildingId)
    }

    // 2. Check target apartment ownership (if assigning)
    if (newApartmentId) {
        const targetApt = await db.select().from(apartments).where(eq(apartments.id, newApartmentId)).limit(1)
        if (!targetApt.length) throw new Error("Apartment not found")
        
        await checkBuildingAccess(targetApt[0].buildingId)
    }

    // 3. Clear current apartment
    // Note: We verified we manage the building of currentApt above, so it's safe to clear
    await db.update(apartments)
        .set({ residentId: null })
        .where(eq(apartments.residentId, residentId))

    // 4. Assign new apartment if provided
    if (newApartmentId) {
        // Check if new apartment is free (concurrency safe-ish)
        const apt = await db.select().from(apartments).where(eq(apartments.id, newApartmentId)).limit(1)
        if (!apt.length) throw new Error("Apartment not found")
        if (apt[0].residentId) throw new Error("Apartment already occupied")

        await db.update(apartments)
            .set({ residentId: residentId })
            .where(eq(apartments.id, newApartmentId))
    }

    return true
}
