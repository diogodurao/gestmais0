import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { FLOOR_OPTIONS, PAYMENT_STATUS } from "./constants"
import { Check, AlertCircle, LucideIcon } from "lucide-react"

// ==========================================
// CLASSNAME UTILITY
// ==========================================

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

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
 * Get apartment display name
 */
export function getApartmentDisplayName(apt: { unit: string }): string {
    return apt.unit
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