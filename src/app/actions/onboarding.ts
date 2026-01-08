"use server"

import { db } from "@/db"
import { user, building } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { requireSession } from "@/lib/session"
import { ActionResult } from "@/lib/types"
import { ROUTES } from "@/lib/routes"
import { updateUserProfile } from "@/app/actions/user"

// Import original actions
import { joinBuilding as _joinBuilding, claimApartment as _claimApartment } from "@/app/actions/building"

// Wrap re-exports in async functions to satisfy "use server" requirements
export async function joinBuilding(code: string) {
    return _joinBuilding(code)
}

export async function selectApartment(apartmentId: number) {
    return _claimApartment(apartmentId)
}

export async function completeOnboarding(userId: string): Promise<ActionResult<void>> {
    const session = await requireSession()

    if (session.user.id !== userId) {
        return { success: false, error: "Não autorizado" }
    }

    try {
        // Find if user has any building
        const userBuilding = await db.query.building.findFirst({
            where: eq(building.managerId, userId)
        })

        if (!userBuilding) {
            return { success: false, error: "Não foi encontrado nenhum edifício" }
        }

        // Mark building setup as complete
        await db.update(building)
            .set({ setupComplete: true })
            .where(eq(building.id, userBuilding.id))

        revalidatePath(ROUTES.DASHBOARD.HOME)

        return { success: true, data: undefined }
    } catch (error) {
        console.error("Error completing onboarding:", error)
        return { success: false, error: "Não foi possível completar o registo" }
    }
}

export async function completeResidentOnboarding(userId: string, iban: string | null): Promise<ActionResult<void>> {
    const session = await requireSession()

    if (session.user.id !== userId) {
        return { success: false, error: "Não autorizado" }
    }

    try {
        // Update IBAN if provided
        if (iban) {
            await updateUserProfile({ iban })
        }

        // Revalidate dashboard
        revalidatePath(ROUTES.DASHBOARD.HOME)

        return { success: true, data: undefined }
    } catch (error) {
        console.error("Error completing resident onboarding:", error)
        return { success: false, error: "Failed to complete onboarding" }
    }
}
