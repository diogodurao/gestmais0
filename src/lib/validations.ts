/**
 * Validates Portuguese NIF (9 digits)
 */
export function isValidNif(nif?: string | null): boolean {
    if (!nif) return false
    if (!/^\d{9}$/.test(nif)) return false

    const weights = [9, 8, 7, 6, 5, 4, 3, 2, 1]
    const sum = nif.split('').reduce((acc, digit, i) =>
        acc + parseInt(digit) * weights[i], 0)

    // Check if the modulo 11 of the sum is 0
    return sum % 11 === 0
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
    setupComplete?: boolean | null
}): boolean {
    return Boolean(
        building.setupComplete &&
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