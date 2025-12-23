/**
 * Shared Formatting Utilities
 * 
 * Currency, date, and number formatting functions used across the app.
 */

// ===========================================
// CURRENCY
// ===========================================

/**
 * Format cents to Euro currency string
 * @param cents Amount in cents (integer)
 * @returns Formatted string like "1.234,56 €"
 */
export function formatCurrency(cents: number): string {
    const euros = cents / 100
    return new Intl.NumberFormat("pt-PT", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(euros)
}

/**
 * Parse currency string to cents
 * @param value String like "1234.56" or "1.234,56"
 * @returns Integer cents value
 */
export function parseCurrency(value: string): number {
    // Remove currency symbols and whitespace
    let cleaned = value.replace(/[€\s]/g, "").trim()
    
    // Handle European format (1.234,56)
    if (cleaned.includes(",")) {
        // If both . and , exist, assume European format
        if (cleaned.includes(".") && cleaned.indexOf(",") > cleaned.lastIndexOf(".")) {
            cleaned = cleaned.replace(/\./g, "").replace(",", ".")
        } else {
            cleaned = cleaned.replace(",", ".")
        }
    }
    
    const parsed = parseFloat(cleaned)
    if (isNaN(parsed)) return 0
    
    return Math.round(parsed * 100)
}

/**
 * Format currency for display in compact form (no currency symbol)
 * @param cents Amount in cents
 * @returns Formatted string like "1.234,56"
 */
export function formatCurrencyCompact(cents: number): string {
    const euros = cents / 100
    return new Intl.NumberFormat("pt-PT", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(euros)
}

// ===========================================
// DATES
// ===========================================

const MONTH_NAMES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
]

const MONTH_NAMES_SHORT = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez"
]

/**
 * Get month name from month number (1-12)
 */
export function getMonthName(month: number, short = false): string {
    const index = Math.max(0, Math.min(11, month - 1))
    return short ? MONTH_NAMES_SHORT[index] : MONTH_NAMES[index]
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string, format: "short" | "medium" | "long" = "medium"): string {
    const d = typeof date === "string" ? new Date(date) : date
    
    const formats: Record<"short" | "medium" | "long", Intl.DateTimeFormatOptions> = {
        short: { day: "2-digit", month: "2-digit", year: "2-digit" },
        medium: { day: "2-digit", month: "short", year: "numeric" },
        long: { day: "numeric", month: "long", year: "numeric" },
    }
    
    return new Intl.DateTimeFormat("pt-PT", formats[format]).format(d)
}

/**
 * Format date with time
 */
export function formatDateTime(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date
    return new Intl.DateTimeFormat("pt-PT", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    }).format(d)
}

// ===========================================
// NUMBERS
// ===========================================

/**
 * Format permillage value
 */
export function formatPermillage(value: number): string {
    return `${value.toFixed(2)}‰`
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals = 0): string {
    return `${value.toFixed(decimals)}%`
}