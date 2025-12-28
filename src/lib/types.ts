export type PaymentStatus = "paid" | "pending" | "late" | "partial"

export type ProjectStatus = "active" | "completed" | "cancelled" | "archived"

export type UserRole = "manager" | "resident"



/**
 * Payment data for a single apartment in the payment grid
 * Matches the return type from getPaymentMap action
 */
export type PaymentData = {
    visibleId: number
    visibleUnit: string
    visibleResident: string | null
    payments: {
        month: number
        status: PaymentStatus
        paidAt: Date | null
    }[]
}



// ==========================================
// BUILDING TYPES
// ==========================================

export type QuotaMode = "global" | "permillage"

export type BuildingStatus = "active" | "inactive" | "pending"

// ==========================================
// USER & SESSION TYPES
// ==========================================



/**
 * Session user type - use this for type-safe session access
 */
export type SessionUser = {
    id: string
    name: string
    email: string
    role: UserRole
    buildingId: string | null      // For residents: their building
    activeBuildingId: string | null // For managers: currently selected building
    nif: string | null
    iban: string | null
    preferredLanguage: 'pt' | 'en' | null
}

// ==========================================
// SUBSCRIPTION TYPES
// ==========================================

export type SubscriptionStatus =
    | "active"
    | "canceled"
    | "incomplete"
    | "incomplete_expired"
    | "past_due"
    | "paused"
    | "trialing"
    | "unpaid"

// ==========================================
// API RESPONSE TYPES
// ==========================================

export type ActionResult<T> =
    | { success: true; data: T }
    | { success: false; error: string }