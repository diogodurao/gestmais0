import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/db"
import { managerBuildings, apartments, extraordinaryProjects } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { isManager, isResident } from "@/lib/permissions"
import type { SessionUser } from "@/lib/types"

// ==========================================
// SERVER-SIDE AUTH HELPERS
// ==========================================

/**
 * Get current session or throw Unauthorized error
 */
export async function requireSession() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session || !session.user) {
        throw new Error("Unauthorized")
    }

    return session as typeof session & { user: SessionUser }
}

/**
 * Get current session (returns null if not authenticated)
 */
export async function getSession() {
    return await auth.api.getSession({
        headers: await headers()
    })
}

/**
 * Require manager role or throw
 */
export async function requireManagerSession() {
    const session = await requireSession()
    const sessionUser = session.user as unknown as SessionUser

    if (!isManager(sessionUser)) {
        throw new Error("Unauthorized: Manager role required")
    }

    return session
}

/**
 * Require resident role or throw
 */
export async function requireResidentSession() {
    const session = await requireSession()
    const sessionUser = session.user as unknown as SessionUser

    console.log("[DEBUG] requireResidentSession - user role:", sessionUser.role, "full user:", JSON.stringify(sessionUser))

    if (!isResident(sessionUser)) {
        throw new Error(`Unauthorized: Resident role required. Got role: ${sessionUser.role}`)
    }

    return session
}



/**
 * Verify manager has access to a specific building
 */
export async function requireBuildingAccess(buildingId: string) {
    const session = await requireManagerSession()

    const access = await db.select()
        .from(managerBuildings)
        .where(and(
            eq(managerBuildings.managerId, session.user.id),
            eq(managerBuildings.buildingId, buildingId)
        ))
        .limit(1)

    if (!access.length) {
        throw new Error("Unauthorized: You do not manage this building")
    }

    return { session, access: access[0] }
}

/**
 * Verify manager has access to a specific apartment (via building)
 */
export async function requireApartmentAccess(apartmentId: number) {
    await requireManagerSession()

    // 1. Get apartment to find buildingId
    const apartment = await db.query.apartments.findFirst({
        where: eq(apartments.id, apartmentId),
        columns: {
            buildingId: true
        }
    })

    if (!apartment) {
        throw new Error("Apartment not found")
    }

    // 2. Verify building access
    return await requireBuildingAccess(apartment.buildingId)
}

/**
 * Verify manager has access to a specific extraordinary project (via building)
 */
export async function requireProjectAccess(projectId: number) {
    await requireManagerSession()

    // 1. Get project to find buildingId
    const project = await db.query.extraordinaryProjects.findFirst({
        where: eq(extraordinaryProjects.id, projectId),
        columns: {
            buildingId: true
        }
    })

    if (!project) {
        throw new Error("Project not found")
    }

    // 2. Verify building access
    return await requireBuildingAccess(project.buildingId)
}

// Re-export SessionUser for backward compatibility
export type { SessionUser } from "@/lib/types"