"use server"
import { ROUTES } from "@/lib/routes"
import { buildingService } from "@/services/building.service"
import { requireSession, requireBuildingAccess, requireManagerSession, requireResidentSession } from "@/lib/auth-helpers"
import { revalidatePath } from "next/cache"
import {
    createBuildingSchema,
    updateBuildingSchema,
    createApartmentSchema,
    updateApartmentSchema
} from "@/lib/zod-schemas"
import { ActionResult } from "@/lib/types"

// Auth check should ideally be here if not passed in, but userId implies trusted context or already extracted
export async function getOrCreateManagerBuilding() {
    const session = await requireManagerSession()
    return await buildingService.getOrCreateManagerBuilding(session.user.id)
}

export async function createNewBuilding(name: string, nif: string): Promise<ActionResult<{ id: string; name: string }>> {
    const session = await requireManagerSession()
    try {
        const validated = createBuildingSchema.safeParse({ name, nif })
        if (!validated.success) return { success: false, error: validated.error.issues[0].message }

        const result = await buildingService.createNewBuilding(session.user.id, validated.data.name, validated.data.nif || "N/A")
        return { success: true, data: result }
    } catch (error) {
        return { success: false, error: "Failed to create building" }
    }
}

export async function getManagerBuildings() {
    const session = await requireManagerSession()
    return await buildingService.getManagerBuildings(session.user.id)
}

export async function switchActiveBuilding(buildingId: string) {
    const { session } = await requireBuildingAccess(buildingId)
    await buildingService.switchActiveBuilding(session.user.id, buildingId)
    return true
}

// ==========================================
// RESIDENT ACTIONS
// ==========================================

export async function joinBuilding(code: string): Promise<ActionResult<{ id: string; name: string }>> {
    const session = await requireResidentSession()
    try {
        const result = await buildingService.joinBuilding(session.user.id, code)
        return { success: true, data: result }
    } catch (error) {
        // console.error("Error joining building:", error)
        const msg = error instanceof Error ? error.message : "Failed to join building"
        return { success: false, error: msg }
    }
}

export async function getResidentBuildingDetails(buildingId: string) {
    await requireResidentSession() // Ensure authenticated as resident
    return await buildingService.getResidentBuildingDetails(buildingId)
}

export async function claimApartment(apartmentId: number): Promise<ActionResult<{ id: number; unit: string }>> {
    const session = await requireSession()
    try {
        const result = await buildingService.claimApartment(session.user.id, apartmentId)
        revalidatePath(ROUTES.DASHBOARD.HOME)
        return { success: true, data: result }
    } catch (error) {
        // console.error("Error claiming apartment:", error)
        const msg = error instanceof Error ? error.message : "Failed to claim apartment"
        return { success: false, error: msg }
    }
}

export async function getResidentApartment() {
    const session = await requireResidentSession()
    return await buildingService.getResidentApartment(session.user.id)
}

export async function getUnclaimedApartments(buildingId: string) {
    await requireSession() // Any authenticated user can see unclaimed apartments (needed for claiming)
    return await buildingService.getUnclaimedApartments(buildingId)
}

// ==========================================
// BUILDING INFO ACTIONS
// ==========================================

export async function getBuildingResidents(buildingId: string) {
    await requireBuildingAccess(buildingId)
    return await buildingService.getBuildingResidents(buildingId)
}

export async function getBuilding(buildingId: string) {
    await requireBuildingAccess(buildingId)
    return await buildingService.getBuilding(buildingId)
}

export async function getBuildingApartments(buildingId: string) {
    await requireBuildingAccess(buildingId)
    return await buildingService.getBuildingApartments(buildingId)
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
): Promise<ActionResult<{ id: string }>> {
    await requireBuildingAccess(buildingId)
    try {
        const validated = updateBuildingSchema.safeParse(data)
        if (!validated.success) return { success: false, error: validated.error.issues[0].message }

        const updated = await buildingService.updateBuilding(buildingId, validated.data)
        revalidatePath(ROUTES.DASHBOARD.SETTINGS)
        return { success: true, data: updated }
    } catch (error) {
        return { success: false, error: "Failed to update building" }
    }
}

export async function completeBuildingSetup(buildingId: string): Promise<ActionResult<any>> {
    await requireBuildingAccess(buildingId)
    try {
        const updated = await buildingService.completeBuildingSetup(buildingId)
        revalidatePath(ROUTES.DASHBOARD.HOME)
        return { success: true, data: updated }
    } catch (error) {
        return { success: false, error: "Failed to complete setup" }
    }
}

// ==========================================
// APARTMENT CRUD ACTIONS
// ==========================================

export async function createApartment(
    buildingId: string,
    data: { unit: string; permillage?: number | null }
): Promise<ActionResult<{ id: number; unit: string }>> {
    await requireBuildingAccess(buildingId)
    try {
        const validated = createApartmentSchema.safeParse(data)
        if (!validated.success) return { success: false, error: validated.error.issues[0].message }

        const result = await buildingService.createApartment(buildingId, validated.data)
        revalidatePath(ROUTES.DASHBOARD.SETTINGS)
        return { success: true, data: result }
    } catch (error) {
        return { success: false, error: "Failed to create apartment" }
    }
}

export async function updateApartment(
    apartmentId: number,
    data: { unit?: string; permillage?: number | null }
): Promise<ActionResult<{ id: number; unit: string }>> {
    // Indirect check via requireApartmentAccess would be better, but for now:
    // We don't have buildingId here easily without fetching.
    // TODO: Ideally refactor service to check auth, or fetch apartment -> building here.
    // Optimization: Assume buildingService handles it? No, service is unprotected.
    // Let's use our new helper.
    const { requireApartmentAccess } = await import("@/lib/auth-helpers")
    await requireApartmentAccess(apartmentId)

    try {
        const validated = updateApartmentSchema.safeParse(data)
        if (!validated.success) return { success: false, error: validated.error.issues[0].message }

        const result = await buildingService.updateApartment(apartmentId, validated.data)
        revalidatePath(ROUTES.DASHBOARD.SETTINGS)
        return { success: true, data: result }
    } catch (error) {
        return { success: false, error: "Failed to update apartment" }
    }
}

export async function deleteApartment(apartmentId: number): Promise<ActionResult<void>> {
    const { requireApartmentAccess } = await import("@/lib/auth-helpers")
    await requireApartmentAccess(apartmentId)
    try {
        await buildingService.deleteApartment(apartmentId)
        revalidatePath(ROUTES.DASHBOARD.SETTINGS)
        revalidatePath(ROUTES.DASHBOARD.PAYMENTS)
        return { success: true, data: undefined }
    } catch (error) {
        const msg = error instanceof Error ? error.message : "Failed to delete apartment"
        return { success: false, error: msg }
    }
}

export async function bulkDeleteApartments(apartmentIds: number[]): Promise<ActionResult<boolean>> {
    await requireSession() // Simple auth check
    try {
        await buildingService.bulkDeleteApartments(apartmentIds)
        revalidatePath(ROUTES.DASHBOARD.SETTINGS)
        return { success: true, data: true }
    } catch (error) {
        return { success: false, error: "Failed to delete apartments" }
    }
}
