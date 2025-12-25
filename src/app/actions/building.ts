"use server"

import { buildingService } from "@/services/building.service"
import { requireSession, requireBuildingAccess } from "@/lib/auth-helpers"
import { revalidatePath } from "next/cache"

export async function getOrCreateManagerBuilding(userId: string) {
    // Auth check should ideally be here if not passed in, but userId implies trusted context or already extracted
    return await buildingService.getOrCreateManagerBuilding(userId)
}

export async function createNewBuilding(userId: string, name: string, nif: string) {
    return await buildingService.createNewBuilding(userId, name, nif)
}

export async function getManagerBuildings(userId: string) {
    return await buildingService.getManagerBuildings(userId)
}

export async function switchActiveBuilding(buildingId: string) {
    const { session } = await requireBuildingAccess(buildingId)
    await buildingService.switchActiveBuilding(session.user.id, buildingId)
    return true
}

// ==========================================
// RESIDENT ACTIONS
// ==========================================

export async function joinBuilding(userId: string, code: string) {
    return await buildingService.joinBuilding(userId, code)
}

export async function getResidentBuildingDetails(buildingId: string) {
    return await buildingService.getResidentBuildingDetails(buildingId)
}

export async function claimApartment(apartmentId: number) {
    const session = await requireSession()
    const result = await buildingService.claimApartment(session.user.id, apartmentId)
    revalidatePath("/dashboard")
    return result
}

export async function getResidentApartment(userId: string) {
    return await buildingService.getResidentApartment(userId)
}

export async function getUnclaimedApartments(buildingId: string) {
    return await buildingService.getUnclaimedApartments(buildingId)
}

// ==========================================
// BUILDING INFO ACTIONS
// ==========================================

export async function getBuildingResidents(buildingId: string) {
    return await buildingService.getBuildingResidents(buildingId)
}

export async function getBuilding(buildingId: string) {
    return await buildingService.getBuilding(buildingId)
}

export async function getBuildingApartments(buildingId: string) {
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
) {
    await requireBuildingAccess(buildingId)
    const updated = await buildingService.updateBuilding(buildingId, data)
    revalidatePath("/dashboard/settings")
    return updated
}

export async function completeBuildingSetup(buildingId: string) {
    await requireBuildingAccess(buildingId)
    const updated = await buildingService.completeBuildingSetup(buildingId)
    revalidatePath("/dashboard")
    return updated
}

// ==========================================
// APARTMENT CRUD ACTIONS
// ==========================================

export async function createApartment(
    buildingId: string,
    data: { unit: string; permillage?: number | null }
) {
    const result = await buildingService.createApartment(buildingId, data)
    revalidatePath("/dashboard/settings")
    return result
}

export async function updateApartment(
    apartmentId: number,
    data: { unit?: string; permillage?: number | null }
) {
    const result = await buildingService.updateApartment(apartmentId, data)
    revalidatePath("/dashboard/settings")
    return result
}

export async function deleteApartment(apartmentId: number) {
    await buildingService.deleteApartment(apartmentId)
    revalidatePath("/dashboard/settings")
    return true
}

export async function bulkDeleteApartments(apartmentIds: number[]) {
    await requireSession() // Simple auth check
    await buildingService.bulkDeleteApartments(apartmentIds)
    revalidatePath("/dashboard/settings")
    return true
}
