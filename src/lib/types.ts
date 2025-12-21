export type PaymentStatus = "paid" | "late" | "pending"

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

/**
 * @deprecated Use PaymentData instead - this type had a mismatch
 * with the actual data structure from server actions
 */
export type PaymentGridData = PaymentData

// ==========================================
// BUILDING TYPES
// ==========================================

export type QuotaMode = "global" | "permillage"

export type BuildingStatus = "active" | "inactive" | "pending"

// ==========================================
// USER & SESSION TYPES
// ==========================================

export type UserRole = "manager" | "resident"

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