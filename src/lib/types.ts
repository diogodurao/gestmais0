import { PaymentStatus, SubscriptionStatus, UserRole, UnitType } from "./constants"

// ==========================================
// SHARED TYPE DEFINITIONS
// ==========================================

// --- User Types ---
export type User = {
    id: string
    name: string
    email: string
    role: UserRole
    nif?: string | null
    iban?: string | null
    buildingId?: string | null
    activeBuildingId?: string | null
    stripeCustomerId?: string | null
}

// --- Building Types ---
export type Building = {
    id: string
    name: string
    nif: string
    code: string
    managerId: string
    city?: string | null
    street?: string | null
    number?: string | null
    iban?: string | null
    totalApartments?: number | null
    quotaMode?: string | null
    monthlyQuota?: number | null
    subscriptionStatus?: SubscriptionStatus | null
    stripeSubscriptionId?: string | null
    stripePriceId?: string | null
}

// --- Apartment Types ---
export type Apartment = {
    id: number
    buildingId: string
    unit: string
    permillage?: number | null
    residentId?: string | null
}

export type ApartmentWithResident = {
    apartment: Apartment
    resident: {
        id: string
        name: string
        email: string
    } | null
}

// --- Payment Types ---
// IMPORTANT: These types refer strictly to RESIDENT QUOTA PAYMENTS (Condominium Fees).
// They are NOT related to the manager's SaaS subscription (Stripe).
export type Payment = {
    id: number
    apartmentId: number
    month: number
    year: number
    status: PaymentStatus
    amount: number
}

// Data structure for the "Mapa de Quotas" grid
// Tracks which residents have paid their building fees for each month.
export type PaymentGridData = {
    apartmentId: number
    unit: string
    payments: Record<number, PaymentStatus>
}

// --- Resident Types ---
export type Resident = {
    user: {
        id: string
        name: string
        email: string
    }
    apartment: {
        id: number
        unit: string
    } | null
}

// --- Manager Building Types ---
export type ManagedBuilding = {
    building: Building
    isOwner: boolean | null
}

// --- Form State Types ---
export type FormState = {
    isLoading: boolean
    error: string
    success: boolean
}

// --- API Response Types ---
export type ActionResult<T = void> = {
    success: boolean
    data?: T
    error?: string
}

// --- Subscription Types ---
export type SubscriptionSyncResult = {
    status: SubscriptionStatus
    synced: boolean
    message?: string
}