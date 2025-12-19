import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/db"
import { managerBuildings } from "@/db/schema"
import { eq, and } from "drizzle-orm"

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
export async function requireManager() {
    const session = await requireSession()
    
    if (session.user.role !== 'manager') {
        throw new Error("Unauthorized: Manager role required")
    }

    return session
}

/**
 * Require resident role or throw
 */
export async function requireResident() {
    const session = await requireSession()
    
    if (session.user.role !== 'resident') {
        throw new Error("Unauthorized: Resident role required")
    }

    return session
}

/**
 * Verify manager has access to a specific building
 */
export async function requireBuildingAccess(buildingId: string) {
    const session = await requireManager()

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
 * Get session with typed user for client-side hydration
 */
export type SessionUser = {
    id: string
    name: string
    email: string
    role: string
    nif?: string | null
    iban?: string | null
    buildingId?: string | null
    activeBuildingId?: string | null
    stripeCustomerId?: string | null
}