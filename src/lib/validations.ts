import { z } from "zod"

// ============================================
// SCHEMAS - Single source of truth
// ============================================

export const nifSchema = z.string()
    .regex(/^\d{9}$/, "Invalid NIF format")
    .transform(val => val.replace(/\s/g, ''))

export const ibanSchema = z.string()
    .regex(/^[A-Za-z0-9]{25}$/, "Invalid IBAN format")  
    .transform(val => val.replace(/\s+/g, ''))

export const emailSchema = z.string().email("Invalid email format")

export const buildingCodeSchema = z.string()
    .min(3, "Building code must be at least 3 characters")
    .regex(/^[a-z0-9]+$/i, "Building code must be alphanumeric")
    .transform(val => val.toLowerCase())

// ============================================
// VALIDATION FUNCTIONS
// ============================================

export function isValidNif(nif?: string | null): boolean {
    return nif ? nifSchema.safeParse(nif.replace(/\s/g, '')).success : false
}

export function isValidIban(iban?: string | null): boolean {
    return iban ? ibanSchema.safeParse(iban.replace(/\s+/g, "")).success : false
}

export function isValidEmail(email: string): boolean {
    return emailSchema.safeParse(email).success
}

export function isValidBuildingCode(code: string): boolean {
    return code.length >= 3 && /^[a-z0-9]+$/.test(code.toLowerCase())
}

/**
 * Profile completion check for managers
 */
export function isProfileComplete(user: {
    name?: string | null
    nif?: string | null
    iban?: string | null
}): boolean {
    return Boolean(
        user.name?.trim() &&
        isValidNif(user.nif) &&
        isValidIban(user.iban)
    )
}

/**
 * Building completion check
 */
export function isBuildingComplete(building: {
    name?: string | null
    nif?: string | null
    iban?: string | null
    city?: string | null
    street?: string | null
    number?: string | null
    totalApartments?: number | null
    monthlyQuota?: number | null
    setupComplete?: boolean | null
}): boolean {
    return Boolean(
        building.nif &&
        building.city &&
        building.street &&
        building.number &&
        building.totalApartments &&
        building.totalApartments > 0 &&
        (building.monthlyQuota ?? 0) > 0 &&
        isValidIban(building.iban) &&
        building.nif !== "N/A"
    )
}

/**
 * Checks if all units have been added and their permillages sum to 1000
 */
export function isUnitsComplete(
    totalApartments?: number | null,
    apartments?: Array<{ apartment: { permillage: number | null } }> | null
): boolean {
    if (!totalApartments || totalApartments <= 0) return false
    const currentCount = apartments?.length ?? 0
    if (currentCount !== totalApartments) return false

    // Sum must be exactly 1000 for any building setup to be considered valid
    const sum = apartments?.reduce((acc, a) => acc + (Number(a.apartment.permillage) || 0), 0) ?? 0
    const roundedSum = Math.round(sum * 100) / 100
    return Math.abs(roundedSum - 1000) < 0.01
}