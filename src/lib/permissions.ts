import type { SessionUser, UserRole, SubscriptionStatus, ManagerBuildingRole, ProfessionalPermissions } from "./types"
import { SUBSCRIPTION_GRACE_PERIOD_DAYS } from "./constants/timing"

// ==========================================
// TYPES
// ==========================================

type BuildingContext = {
    subscriptionStatus?: SubscriptionStatus | string | null
    managerId?: string
    setupComplete?: boolean | null
    subscriptionPastDueAt?: Date | string | null
}

type ManagerBuildingContext = {
    role?: ManagerBuildingRole | null
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

export function isProfessional(user: SessionUser | null): boolean {
    return user?.role === "professional"
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

/**
 * Check if subscription is blocked (past grace period OR unpaid status)
 * Returns true if manager should be blocked from using the app
 */
export function isSubscriptionBlocked(building: BuildingContext | null | undefined): boolean {
    if (!building) return false

    // Immediately blocked if unpaid
    if (building.subscriptionStatus === "unpaid") return true

    // Check if past_due and grace period expired
    if (building.subscriptionStatus === "past_due" && building.subscriptionPastDueAt) {
        const pastDueDate = typeof building.subscriptionPastDueAt === 'string'
            ? new Date(building.subscriptionPastDueAt)
            : building.subscriptionPastDueAt

        const now = new Date()
        const daysSincePastDue = Math.floor(
            (now.getTime() - pastDueDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        return daysSincePastDue >= SUBSCRIPTION_GRACE_PERIOD_DAYS
    }

    return false
}

/**
 * Get days remaining in grace period for past_due subscriptions
 * Returns null if not in grace period, 0 or negative if expired
 */
export function getGracePeriodDaysRemaining(building: BuildingContext | null | undefined): number | null {
    if (!building) return null
    if (building.subscriptionStatus !== "past_due") return null
    if (!building.subscriptionPastDueAt) return null

    const pastDueDate = typeof building.subscriptionPastDueAt === 'string'
        ? new Date(building.subscriptionPastDueAt)
        : building.subscriptionPastDueAt

    const now = new Date()
    const daysSincePastDue = Math.floor(
        (now.getTime() - pastDueDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    return Math.max(0, SUBSCRIPTION_GRACE_PERIOD_DAYS - daysSincePastDue)
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

// ==========================================
// PROFESSIONAL PERMISSIONS
// ==========================================

export const PROFESSIONAL_DEFAULT_PERMISSIONS: ProfessionalPermissions = {
    canViewPayments: true,
    canViewDocuments: true,
    canViewReports: true,
    canViewOccurrences: false,
    canViewPolls: false,
}

// ==========================================
// COLLABORATOR PERMISSION CHECKS
// ==========================================

/**
 * Check if the user has the 'owner' role for the building
 */
export function isBuildingOwner(managerBuilding: ManagerBuildingContext | null | undefined): boolean {
    return managerBuilding?.role === 'owner'
}

/**
 * Check if the user has the 'collaborator' role for the building
 */
export function isBuildingCollaborator(managerBuilding: ManagerBuildingContext | null | undefined): boolean {
    return managerBuilding?.role === 'collaborator'
}

/**
 * Check if user is either owner or collaborator
 */
export function isOwnerOrCollaborator(managerBuilding: ManagerBuildingContext | null | undefined): boolean {
    return managerBuilding?.role === 'owner' || managerBuilding?.role === 'collaborator'
}

/**
 * Collaborator-aware permission checks
 * These check if an action is allowed based on the user's role in the building
 */
export const canCollaborator = {
    /**
     * Can manage collaborators (invite/remove)
     * Only building owners can manage collaborators
     */
    manageCollaborators(managerBuilding: ManagerBuildingContext | null | undefined): boolean {
        return isBuildingOwner(managerBuilding)
    },

    /**
     * Can delete residents from the building
     * Only building owners can delete residents
     */
    deleteResident(managerBuilding: ManagerBuildingContext | null | undefined): boolean {
        return isBuildingOwner(managerBuilding)
    },

    /**
     * Can delete the building
     * Only building owners can delete the building
     */
    deleteBuilding(managerBuilding: ManagerBuildingContext | null | undefined): boolean {
        return isBuildingOwner(managerBuilding)
    },

    /**
     * Can manage subscription/billing
     * Only building owners can manage subscriptions
     */
    manageSubscription(managerBuilding: ManagerBuildingContext | null | undefined): boolean {
        return isBuildingOwner(managerBuilding)
    },

    /**
     * Can view and manage payments
     * Both owners and collaborators can manage payments
     */
    managePayments(managerBuilding: ManagerBuildingContext | null | undefined): boolean {
        return isOwnerOrCollaborator(managerBuilding)
    },

    /**
     * Can view and manage residents (but not delete)
     * Both owners and collaborators can manage residents
     */
    manageResidents(managerBuilding: ManagerBuildingContext | null | undefined): boolean {
        return isOwnerOrCollaborator(managerBuilding)
    },

    /**
     * Can create/edit events, polls, discussions
     * Both owners and collaborators can manage these
     */
    manageContent(managerBuilding: ManagerBuildingContext | null | undefined): boolean {
        return isOwnerOrCollaborator(managerBuilding)
    },

    /**
     * Can edit building settings
     * Both owners and collaborators can edit settings (except billing-related)
     */
    editSettings(managerBuilding: ManagerBuildingContext | null | undefined): boolean {
        return isOwnerOrCollaborator(managerBuilding)
    },

    /**
     * Can invite external professionals
     * Both owners and collaborators can invite professionals
     */
    inviteProfessionals(managerBuilding: ManagerBuildingContext | null | undefined): boolean {
        return isOwnerOrCollaborator(managerBuilding)
    },
}

// ==========================================
// COLLABORATOR GUARD HELPERS
// ==========================================

/**
 * Throws if user is not a building owner
 */
export function requireBuildingOwner(managerBuilding: ManagerBuildingContext | null | undefined): void {
    if (!isBuildingOwner(managerBuilding)) {
        throw new Error("Building owner access required")
    }
}

/**
 * Throws if user is not owner or collaborator
 */
export function requireOwnerOrCollaborator(managerBuilding: ManagerBuildingContext | null | undefined): void {
    if (!isOwnerOrCollaborator(managerBuilding)) {
        throw new Error("Building access required")
    }
}

