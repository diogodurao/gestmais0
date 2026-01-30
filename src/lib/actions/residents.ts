"use server"

import { db } from "@/db"
import { apartments, user } from "@/db/schema"
import { eq, and, isNull } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { requireManagerSession, requireBuildingAccess, requireBuildingOwnerAccess } from "@/lib/auth-helpers"
import { residentService } from "@/services/resident.service"
import { ActionResult } from "@/lib/types"
import { ROUTES } from "@/lib/routes"

export async function removeResidentFromBuilding(residentId: string, buildingId: string): Promise<ActionResult<boolean>> {
    // Only building owners can remove residents
    await requireBuildingOwnerAccess(buildingId)
    try {
        await db.update(apartments)
            .set({ residentId: null })
            .where(and(eq(apartments.residentId, residentId), eq(apartments.buildingId, buildingId)))

        await db.update(user)
            .set({ buildingId: null })
            .where(and(eq(user.id, residentId), eq(user.buildingId, buildingId)))

        revalidatePath(ROUTES.DASHBOARD.HOME)
        return { success: true, data: true }
    } catch (error) {
        return { success: false, error: "Failed to remove resident" }
    }
}

export async function unclaimApartmentAction(apartmentId: number): Promise<ActionResult<boolean>> {
    try {
        const apt = await db.select().from(apartments).where(eq(apartments.id, apartmentId)).limit(1)
        if (!apt.length) return { success: false, error: "Apartment not found" }

        // Only building owners can unclaim apartments
        await requireBuildingOwnerAccess(apt[0].buildingId)

        await residentService.unclaimApartment(apartmentId)

        revalidatePath(ROUTES.DASHBOARD.HOME)
        revalidatePath(ROUTES.DASHBOARD.SETTINGS)
        return { success: true, data: true }
    } catch (error) {
        return { success: false, error: "Failed to unclaim apartment" }
    }
}

export async function updateResidentUnit(residentId: string, newApartmentId: number | null): Promise<ActionResult<boolean>> {
    const session = await requireManagerSession()
    try {
        await db.transaction(async (tx) => {
            const checkBuildingAccess = async (bId: string) => {
                const { managerBuildings } = await import("@/db/schema")
                const access = await tx.select()
                    .from(managerBuildings)
                    .where(and(eq(managerBuildings.managerId, session.user.id), eq(managerBuildings.buildingId, bId)))
                    .limit(1)
                if (!access.length) throw new Error("Unauthorized access to building")
            }

            const currentApt = await tx.select().from(apartments).where(eq(apartments.residentId, residentId)).limit(1)
            if (currentApt.length) {
                await checkBuildingAccess(currentApt[0].buildingId)
            }

            if (newApartmentId) {
                const targetApt = await tx.select().from(apartments).where(eq(apartments.id, newApartmentId)).limit(1)
                if (!targetApt.length) throw new Error("Apartment not found")
                await checkBuildingAccess(targetApt[0].buildingId)
            }

            await tx.update(apartments).set({ residentId: null }).where(eq(apartments.residentId, residentId))

            if (newApartmentId) {
                const updateResult = await tx.update(apartments)
                    .set({ residentId: residentId })
                    .where(and(eq(apartments.id, newApartmentId), isNull(apartments.residentId)))
                    .returning()

                if (updateResult.length === 0) throw new Error("Apartment already occupied or not found")
            }
        })
        return { success: true, data: true }
    } catch (error) {
        const msg = error instanceof Error ? error.message : "Failed to update resident unit"
        return { success: false, error: msg }
    }
}