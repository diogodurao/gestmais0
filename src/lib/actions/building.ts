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

// ==========================================
// MANAGER ACTIONS
// ==========================================

export async function getOrCreateManagerBuilding() {
    const session = await requireManagerSession()
    const result = await buildingService.getOrCreateManagerBuilding(session.user.id)
    if (!result.success) throw new Error(result.error)
    return result.data
}

export async function createNewBuilding(name: string, nif: string): Promise<ActionResult<{ id: string; name: string }>> {
    const session = await requireManagerSession()
    const validated = createBuildingSchema.safeParse({ name, nif })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const result = await buildingService.createNewBuilding(session.user.id, validated.data.name, validated.data.nif || "N/A")
    if (!result.success) return result
    return { success: true, data: { id: result.data.id, name: result.data.name } }
}

export async function getManagerBuildings() {
    const session = await requireManagerSession()
    const result = await buildingService.getManagerBuildings(session.user.id)
    if (!result.success) throw new Error(result.error)
    return result.data
}

export async function switchActiveBuilding(buildingId: string) {
    const { session } = await requireBuildingAccess(buildingId)
    const result = await buildingService.switchActiveBuilding(session.user.id, buildingId)
    if (!result.success) throw new Error(result.error)
    return true
}

// ==========================================
// RESIDENT ACTIONS
// ==========================================

export async function joinBuilding(code: string): Promise<ActionResult<{ id: string; name: string }>> {
    const session = await requireResidentSession()
    const result = await buildingService.joinBuilding(session.user.id, code)
    if (!result.success) return result
    return { success: true, data: { id: result.data.id, name: result.data.name } }
}

export async function getResidentBuildingDetails(buildingId: string) {
    await requireResidentSession()
    const result = await buildingService.getResidentBuildingDetails(buildingId)
    if (!result.success) throw new Error(result.error)
    return result.data
}

export async function claimApartment(apartmentId: number): Promise<ActionResult<{ id: number; unit: string }>> {
    const session = await requireSession()
    const result = await buildingService.claimApartment(session.user.id, apartmentId)
    if (!result.success) return result
    revalidatePath(ROUTES.DASHBOARD.HOME)
    return { success: true, data: { id: result.data.id, unit: result.data.unit } }
}

export async function getResidentApartment() {
    const session = await requireResidentSession()
    const result = await buildingService.getResidentApartment(session.user.id)
    if (!result.success) throw new Error(result.error)
    return result.data
}

export async function getUnclaimedApartments(buildingId: string) {
    await requireSession()
    const result = await buildingService.getUnclaimedApartments(buildingId)
    if (!result.success) throw new Error(result.error)
    return result.data
}

// ==========================================
// BUILDING INFO ACTIONS
// ==========================================

export async function getBuildingResidents(buildingId: string) {
    await requireBuildingAccess(buildingId)
    const result = await buildingService.getBuildingResidents(buildingId)
    if (!result.success) throw new Error(result.error)
    return result.data
}

export async function getBuilding(buildingId: string) {
    await requireBuildingAccess(buildingId)
    const result = await buildingService.getBuilding(buildingId)
    if (!result.success) return null
    return result.data
}

export async function getBuildingApartments(buildingId: string) {
    await requireBuildingAccess(buildingId)
    const result = await buildingService.getBuildingApartments(buildingId)
    if (!result.success) throw new Error(result.error)
    return result.data
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
        paymentDueDay?: number | null
    }
): Promise<ActionResult<{ id: string }>> {
    await requireBuildingAccess(buildingId)
    const validated = updateBuildingSchema.safeParse(data)
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const result = await buildingService.updateBuilding(buildingId, validated.data)
    if (!result.success) return result
    revalidatePath(ROUTES.DASHBOARD.SETTINGS)
    return { success: true, data: { id: result.data.id } }
}

export async function completeBuildingSetup(buildingId: string): Promise<ActionResult<{ id: string }>> {
    await requireBuildingAccess(buildingId)
    const result = await buildingService.completeBuildingSetup(buildingId)
    if (!result.success) return result
    revalidatePath(ROUTES.DASHBOARD.HOME)
    return { success: true, data: { id: result.data.id } }
}

// ==========================================
// APARTMENT CRUD ACTIONS
// ==========================================

export async function createApartment(
    buildingId: string,
    data: { unit: string; permillage?: number | null }
): Promise<ActionResult<{ id: number; unit: string }>> {
    await requireBuildingAccess(buildingId)
    const validated = createApartmentSchema.safeParse(data)
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const result = await buildingService.createApartment(buildingId, validated.data)
    if (!result.success) return result
    revalidatePath(ROUTES.DASHBOARD.SETTINGS)
    return { success: true, data: { id: result.data.id, unit: result.data.unit } }
}

export async function updateApartment(
    apartmentId: number,
    data: { unit?: string; permillage?: number | null }
): Promise<ActionResult<{ id: number; unit: string }>> {
    const { requireApartmentAccess } = await import("@/lib/auth-helpers")
    await requireApartmentAccess(apartmentId)

    const validated = updateApartmentSchema.safeParse(data)
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const result = await buildingService.updateApartment(apartmentId, validated.data)
    if (!result.success) return result
    revalidatePath(ROUTES.DASHBOARD.SETTINGS)
    return { success: true, data: { id: result.data.id, unit: result.data.unit } }
}

export async function deleteApartment(apartmentId: number): Promise<ActionResult<void>> {
    const { requireApartmentAccess } = await import("@/lib/auth-helpers")
    await requireApartmentAccess(apartmentId)

    const result = await buildingService.deleteApartment(apartmentId)
    if (!result.success) return { success: false, error: result.error }
    revalidatePath(ROUTES.DASHBOARD.SETTINGS)
    revalidatePath(ROUTES.DASHBOARD.PAYMENTS)
    return { success: true, data: undefined }
}

export async function bulkDeleteApartments(apartmentIds: number[]): Promise<ActionResult<boolean>> {
    await requireSession()
    const result = await buildingService.bulkDeleteApartments(apartmentIds)
    if (!result.success) return result
    revalidatePath(ROUTES.DASHBOARD.SETTINGS)
    return { success: true, data: true }
}