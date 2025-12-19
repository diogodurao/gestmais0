/**
 * Validates Portuguese NIF (9 digits)
 */
export function isValidNif(nif?: string | null): boolean {
    if (!nif) return false
    return /^\d{9}$/.test(nif)
}

/**
 * Validates Portuguese IBAN (25 alphanumeric characters)
 */
export function isValidIban(iban?: string | null): boolean {
    if (!iban) return false
    const normalized = iban.replace(/\s+/g, "")
    return /^[A-Za-z0-9]{25}$/.test(normalized)
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Checks if a building code is valid format
 */
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
}): boolean {
    return Boolean(
        building.name &&
        building.nif &&
        building.city &&
        building.street &&
        building.number &&
        building.totalApartments &&
        building.totalApartments > 0 &&
        (building.monthlyQuota ?? 0) > 0 &&
        isValidIban(building.iban) &&
        building.name !== "My Condominium" &&
        building.nif !== "N/A"
    )
}