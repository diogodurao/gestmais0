export const PROJECT_DEFAULTS = {
    INSTALLMENTS: 12,
} as const

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


export const SUBSCRIPTION_STATUS = {
    ACTIVE: 'active',
    INCOMPLETE: 'incomplete',
    CANCELED: 'canceled',
    PAST_DUE: 'past_due',
} as const

export const DEFAULT_SUBSCRIPTION_PRICE_PER_UNIT = 300 // in cents

export const USER_ROLES = {
    MANAGER: 'manager',
    RESIDENT: 'resident',
} as const

// Type exports for type safety
export type SubscriptionStatus = typeof SUBSCRIPTION_STATUS[keyof typeof SUBSCRIPTION_STATUS]
export type UnitType = typeof UNIT_TYPES[number]['value']
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

export const MAX_PHOTOS_PER_OCCURRENCE = 3
export const MAX_PHOTO_SIZE = 5 * 1024 * 1024 // 5 MB

export const PAYMENT_TABLE_LAYOUT = {
    CELL_WIDTH: 72,
    UNIT_WIDTH: 64,
    RESIDENT_WIDTH: 160,
    TOTAL_WIDTH: 88,
    ROW_HEIGHT: 36,
} as const