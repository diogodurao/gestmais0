"use server"

import { db } from "@/db"
import { apartments, user } from "@/db/schema"
import { eq, and, isNull } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { requireManager, requireBuildingAccess } from "@/lib/auth-helpers"
import { residentService } from "@/services/resident.service"

export async function removeResidentFromBuilding(residentId: string, buildingId: string) {
    await requireBuildingAccess(buildingId)

    await db.update(apartments)
        .set({ residentId: null })
        .where(and(eq(apartments.residentId, residentId), eq(apartments.buildingId, buildingId)))

    await db.update(user)
        .set({ buildingId: null })
        .where(and(eq(user.id, residentId), eq(user.buildingId, buildingId)))

    revalidatePath("/dashboard")
    return true
}

export async function unclaimApartmentAction(apartmentId: number) {
    const session = await requireManager()

    const apt = await db.select().from(apartments).where(eq(apartments.id, apartmentId)).limit(1)
    if (!apt.length) throw new Error("Apartment not found")

    await requireBuildingAccess(apt[0].buildingId)

    await residentService.unclaimApartment(apartmentId)

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/settings")
    return true
}

export async function updateResidentUnit(residentId: string, newApartmentId: number | null) {
    const session = await requireManager()

    return await db.transaction(async (tx) => {
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

        return true
    })
}