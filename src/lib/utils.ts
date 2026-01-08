import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"
import { FLOOR_OPTIONS } from "@/lib/constants/project"
import { Check, AlertCircle, LucideIcon } from "lucide-react"

// ==========================================
// CLASSNAME UTILITY
// ==========================================

const customTwMerge = extendTailwindMerge({
    extend: {
        classGroups: {
            'font-size': ['text-micro', 'text-label', 'text-body', 'text-content', 'text-heading'],
        },
    },
})

export function cn(...inputs: ClassValue[]) {
    return customTwMerge(clsx(inputs))
}

// ==========================================
// HELPERS
// ==========================================

export function getFloorLabel(floor: string): string {
    const opt = FLOOR_OPTIONS.find(f => f.value === floor)
    if (opt) return opt.label

    // Fallbacks
    if (floor === "0") return "R/C"
    if (floor === "-1") return "Cave"
    if (floor === "-2") return "-2"
    return `${floor}º`
}

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
        case "paid":
            return "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
        case "late":
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
        case "paid": return Check
        case "late": return AlertCircle
        default: return null
    }
}

// ==========================================
// FORMATTING UTILITIES
// ==========================================



/**
 * Format permillage display
 */
export function formatPermillage(value: number | null): string {
    if (value === null) return ""
    return `${value.toString().replace('.', ',')}‰`
}

// ==========================================
// ENVIRONMENT UTILITIES
// ==========================================

export function getAppUrl() {
    if (process.env.NODE_ENV === "development") {
        return "http://localhost:3000"
    }
    return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
}

// ==========================================
// DOCUMENT UTILITIES
// ==========================================

export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function getFileIcon(mimeType: string): string {
    if (mimeType === 'application/pdf') return '📄'
    if (mimeType.includes('word')) return '📝'
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet') || mimeType === 'text/csv') return '📊'
    if (mimeType.startsWith('image/')) return '🖼️'
    return '📎'
}

export function canPreview(mimeType: string): boolean {
    return mimeType === 'application/pdf' || mimeType.startsWith('image/')
}