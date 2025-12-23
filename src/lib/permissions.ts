import type { SessionUser, UserRole, SubscriptionStatus } from "./types"

// ==========================================
// TYPES
// ==========================================

type BuildingContext = {
    subscriptionStatus?: string | null
    managerId?: string
    setupComplete?: boolean | null
}

type PermissionContext = {
    user: SessionUser | null
    building?: BuildingContext | null
}

// ==========================================
// ROLE CHECKS
// ==========================================

export function isManager(user: SessionUser | null): boolean {
    return user?.role === "manager"
}

export function isResident(user: SessionUser | null): boolean {
    return user?.role === "resident"
}

export function hasRole(user: SessionUser | null, role: UserRole): boolean {
    return user?.role === role
}

// ==========================================
// SUBSCRIPTION CHECKS
// ==========================================

export function hasActiveSubscription(building: BuildingContext | null | undefined): boolean {
    return building?.subscriptionStatus === "active"
}

export function isSubscriptionIncomplete(building: BuildingContext | null | undefined): boolean {
    return !building?.subscriptionStatus || building.subscriptionStatus === "incomplete"
}

// ==========================================
// PERMISSION FUNCTIONS
// ==========================================

export const can = {
    /**
     * Can manage residents (view list, assign units, remove)
     * Requires: manager role + active subscription
     */
    manageResidents(user: SessionUser | null, building?: BuildingContext | null): boolean {
        return isManager(user) && hasActiveSubscription(building)
    },

    /**
     * Can view the building invite code
     * Requires: manager role + active subscription
     */
    viewInviteCode(user: SessionUser | null, building?: BuildingContext | null): boolean {
        return isManager(user) && hasActiveSubscription(building)
    },

    /**
     * Can access payment management features
     * Requires: manager role + active subscription
     */
    managePayments(user: SessionUser | null, building?: BuildingContext | null): boolean {
        return isManager(user) && hasActiveSubscription(building)
    },

    /**
     * Can view their own payments (resident dashboard)
     * Requires: resident role
     */
    viewOwnPayments(user: SessionUser | null): boolean {
        return isResident(user)
    },

    /**
     * Can create extraordinary projects
     * Requires: manager role + active subscription
     */
    createExtraordinaryProject(user: SessionUser | null, building?: BuildingContext | null): boolean {
        return isManager(user) && hasActiveSubscription(building)
    },

    /**
     * Can edit building settings
     * Requires: manager role (subscription not required for basic settings)
     */
    editBuildingSettings(user: SessionUser | null): boolean {
        return isManager(user)
    },

    /**
     * Can subscribe/manage subscription
     * Requires: manager role
     */
    manageSubscription(user: SessionUser | null): boolean {
        return isManager(user)
    },

    /**
     * Can export financial documents
     * Requires: manager role + active subscription
     */
    exportDocuments(user: SessionUser | null, building?: BuildingContext | null): boolean {
        return isManager(user) && hasActiveSubscription(building)
    },

    /**
     * Can switch between managed buildings
     * Requires: manager role
     */
    switchBuildings(user: SessionUser | null): boolean {
        return isManager(user)
    },

    /**
     * Can access the dashboard
     * Requires: authenticated user
     */
    accessDashboard(user: SessionUser | null): boolean {
        return user !== null
    },
}

// ==========================================
// FEATURE FLAGS (Locked Features)
// ==========================================

export const features = {
    /**
     * Check if resident management is locked
     */
    isResidentManagementLocked(user: SessionUser | null, building?: BuildingContext | null): boolean {
        return isManager(user) && !hasActiveSubscription(building)
    },

    /**
     * Check if payment features are locked
     */
    isPaymentFeaturesLocked(user: SessionUser | null, building?: BuildingContext | null): boolean {
        return isManager(user) && !hasActiveSubscription(building)
    },

    /**
     * Check if extraordinary projects are locked
     */
    isExtraordinaryLocked(user: SessionUser | null, building?: BuildingContext | null): boolean {
        return isManager(user) && !hasActiveSubscription(building)
    },
}

// ==========================================
// GUARD HELPERS (for server actions)
// ==========================================

/**
 * Throws if user is not a manager
 */
export function requireManager(user: SessionUser | null): asserts user is SessionUser {
    if (!user) throw new Error("Authentication required")
    if (user.role !== "manager") throw new Error("Manager access required")
}

/**
 * Throws if user is not a resident
 */
export function requireResident(user: SessionUser | null): asserts user is SessionUser {
    if (!user) throw new Error("Authentication required")
    if (user.role !== "resident") throw new Error("Resident access required")
}

/**
 * Throws if building doesn't have active subscription
 */
export function requireActiveSubscription(building: BuildingContext | null | undefined): void {
    if (!hasActiveSubscription(building)) {
        throw new Error("Active subscription required")
    }
}

/**
 * Combined check: manager + active subscription
 */
export function requireManagerWithSubscription(
    user: SessionUser | null, 
    building: BuildingContext | null | undefined
): asserts user is SessionUser {
    requireManager(user)
    requireActiveSubscription(building)
}

