import { FLOOR_OPTIONS, UNIT_TYPES, PAYMENT_STATUS } from "./constants"
import { Home, Store, Car, Package, Check, AlertCircle, Clock, LucideIcon } from "lucide-react"

// ==========================================
// FLOOR & APARTMENT DISPLAY UTILITIES
// ==========================================

/**
 * Get human-readable floor label
 */
export function getFloorLabel(floor: string): string {
    const opt = FLOOR_OPTIONS.find(f => f.value === floor)
    if (opt) return opt.label
    
    // Fallback for floors not in options
    if (floor === "0") return "R/C"
    if (floor === "-1") return "Cave"
    if (floor === "-2") return "-2"
    return `${floor}º`
}

/**
 * Get apartment display name - now just returns the unit directly
 */
export function getApartmentDisplayName(apt: { unit: string }): string {
    return apt.unit
}

/**
 * Get unit type icon component
 */
export function getUnitTypeIcon(unitType: string): LucideIcon {
    switch (unitType) {
        case 'shop': return Store
        case 'garage': return Car
        case 'cave':
        case 'storage': return Package
        default: return Home
    }
}

// ==========================================
// PAYMENT STATUS UTILITIES
// ==========================================

/**
 * Get Tailwind classes for payment status
 */
export function getPaymentStatusColor(status: string): string {
    switch (status) {
        case PAYMENT_STATUS.PAID:
            return "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
        case PAYMENT_STATUS.LATE:
            return "bg-red-100 text-red-700 border-red-200 hover:bg-red-200"
        default:
            return "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"
    }
}

/**
 * Get icon component for payment status
 */
export function getPaymentStatusIcon(status: string): LucideIcon | null {
    switch (status) {
        case PAYMENT_STATUS.PAID: return Check
        case PAYMENT_STATUS.LATE: return AlertCircle
        default: return null
    }
}

// ==========================================
// SORTING UTILITIES
// ==========================================

/**
 * Sort floors in logical order (negatives first, then R/C, then ascending)
 */
export function sortFloors(floors: string[]): string[] {
    return [...floors].sort((a, b) => {
        if (a === "unassigned") return -1
        if (b === "unassigned") return 1
        
        const aNum = a === "R/C" ? 0 : parseInt(a)
        const bNum = b === "R/C" ? 0 : parseInt(b)
        const aVal = isNaN(aNum) ? 0 : aNum
        const bVal = isNaN(bNum) ? 0 : bNum
        
        return aVal - bVal
    })
}

/**
 * Unit type priority for sorting (caves/shops before apartments)
 */
export const UNIT_TYPE_PRIORITY: Record<string, number> = {
    cave: 1,
    shop: 2,
    garage: 3,
    storage: 4,
    apartment: 5
}

/**
 * Sort apartments by floor, then type, then identifier
 */
export function sortApartments<T extends { floor: string; unitType: string; identifier: string }>(
    apartments: T[]
): T[] {
    return [...apartments].sort((a, b) => {
        const floorA = parseInt(a.floor)
        const floorB = parseInt(b.floor)
        
        // 1. Sort by floor
        if (!isNaN(floorA) && !isNaN(floorB)) {
            if (floorA !== floorB) return floorA - floorB
        } else if (a.floor !== b.floor) {
            return a.floor.localeCompare(b.floor)
        }
        
        // 2. Sort by unit type (Caves/Shops first)
        const priorityA = UNIT_TYPE_PRIORITY[a.unitType] || 99
        const priorityB = UNIT_TYPE_PRIORITY[b.unitType] || 99
        if (priorityA !== priorityB) return priorityA - priorityB

        // 3. Sort by identifier
        return a.identifier.localeCompare(b.identifier, undefined, { numeric: true })
    })
}

// ==========================================
// FORMATTING UTILITIES
// ==========================================

/**
 * Format currency in EUR
 */
export function formatCurrency(cents: number): string {
    return `€${(cents / 100).toFixed(2)}`
}

/**
 * Format permillage display
 */
export function formatPermillage(value: number | null): string {
    if (value === null) return ""
    return `${value.toString().replace('.', ',')}‰`
}