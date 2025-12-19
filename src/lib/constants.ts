export const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
] as const

export const MONTHS_PT = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez"
] as const

export const FLOOR_OPTIONS = [
    { value: "-2", label: "-2" },
    { value: "-1", label: "-1" },
    { value: "0", label: "R/C" },
    { value: "1", label: "1º" },
    { value: "2", label: "2º" },
    { value: "3", label: "3º" },
    { value: "4", label: "4º" },
    { value: "5", label: "5º" },
    { value: "6", label: "6º" },
    { value: "7", label: "7º" },
    { value: "8", label: "8º" },
    { value: "9", label: "9º" },
    { value: "10", label: "10º" },
] as const

export const UNIT_TYPES = [
    { value: "apartment", label: "Apartment", labelPt: "Apartamento" },
    { value: "shop", label: "Shop", labelPt: "Loja" },
    { value: "garage", label: "Garage", labelPt: "Garagem" },
    { value: "cave", label: "Cave", labelPt: "Cave" },
    { value: "storage", label: "Storage", labelPt: "Arrecadação" },
] as const

export const PAYMENT_STATUS = {
    PAID: 'paid',
    PENDING: 'pending',
    LATE: 'late',
} as const

export const SUBSCRIPTION_STATUS = {
    ACTIVE: 'active',
    INCOMPLETE: 'incomplete',
    CANCELED: 'canceled',
    PAST_DUE: 'past_due',
} as const

export const USER_ROLES = {
    MANAGER: 'manager',
    RESIDENT: 'resident',
} as const

// Type exports for type safety
export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS]
export type SubscriptionStatus = typeof SUBSCRIPTION_STATUS[keyof typeof SUBSCRIPTION_STATUS]
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]
export type UnitType = typeof UNIT_TYPES[number]['value']