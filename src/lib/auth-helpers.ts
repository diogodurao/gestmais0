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

    return session
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
    const sessionUser = session.user as SessionUser

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
    const sessionUser = session.user as SessionUser

    if (!isResident(sessionUser)) {
        throw new Error("Unauthorized: Resident role required")
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

// Re-export SessionUser for backward compatibility
export type { SessionUser } from "@/lib/types"

/**
 * Verify manager has access to the building an apartment belongs to
 */
export async function requireApartmentAccess(apartmentId: number) {
    const session = await requireManagerSession()

    // Join apartments -> building -> manager_buildings to check access
    const result = await db.select({
        apartment: apartments,
        buildingId: apartments.buildingId
    })
        .from(apartments)
        .where(eq(apartments.id, apartmentId))
        .limit(1)

    if (!result.length) {
        throw new Error("Apartment not found")
    }

    const { buildingId } = result[0]

    // Check if manager manages this building
    const access = await db.select()
        .from(managerBuildings)
        .where(and(
            eq(managerBuildings.managerId, session.user.id),
            eq(managerBuildings.buildingId, buildingId)
        ))
        .limit(1)

    if (!access.length) {
        throw new Error("Unauthorized: You do not manage the building for this apartment")
    }

    return { session, apartment: result[0].apartment }
}

/**
 * Verify manager has access to the building a project belongs to
 */
export async function requireProjectAccess(projectId: number) {
    const session = await requireManagerSession()

    // Join projects -> building -> manager_buildings
    const result = await db.select({
        project: extraordinaryProjects,
        buildingId: extraordinaryProjects.buildingId
    })
        .from(extraordinaryProjects)
        .where(eq(extraordinaryProjects.id, projectId))
        .limit(1)

    if (!result.length) {
        throw new Error("Project not found")
    }

    const { buildingId } = result[0]

    // Check if manager manages this building
    const access = await db.select()
        .from(managerBuildings)
        .where(and(
            eq(managerBuildings.managerId, session.user.id),
            eq(managerBuildings.buildingId, buildingId)
        ))
        .limit(1)

    if (!access.length) {
        throw new Error("Unauthorized: You do not manage the building for this project")
    }

    return { session, project: result[0].project }
}