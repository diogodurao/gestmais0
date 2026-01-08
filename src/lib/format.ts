/**
 * Shared Formatting Utilities
 * 
 * Currency, date, and number formatting functions used across the app.
 */

// ===========================================
// CURRENCY
// ===========================================

// Reusable formatters to avoid recreation on every render
const currencyFormatter = new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})

const compactCurrencyFormatter = new Intl.NumberFormat("pt-PT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})

/**
 * Format cents to Euro currency string
 * @param cents Amount in cents (integer)
 * @returns Formatted string like "1.234,56 €"
 */
export function formatCurrency(cents: number): string {
    const euros = cents / 100
    return currencyFormatter.format(euros)
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
    return compactCurrencyFormatter.format(euros)
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

/**
 * Format relative time distance (e.g. "há 2 min")
 */
export function formatDistanceToNow(date: Date | string): string {
    const now = new Date()
    const then = new Date(date)
    const diffMs = now.getTime() - then.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "agora mesmo"
    if (diffMins < 60) return `há ${diffMins} min`
    if (diffHours < 24) return `há ${diffHours}h`
    if (diffDays < 7) return `há ${diffDays}d`

    return then.toLocaleDateString("pt-PT", { day: "numeric", month: "short" })
}

// ===========================================
// NUMBERS
// ===========================================

/**
 * Format permillage value (e.g. 52.3 -> "52,30%")
 */
export function formatPercent(value: number | null | undefined, decimals = 2): string {
    if (value === null || value === undefined) return "-"
    return `${value.toFixed(decimals).replace('.', ',')}%`
}

export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function getFileIcon(mimeType: string): string {
    if (mimeType === 'application/pdf') return '.pdf'
    if (mimeType.includes('word')) return '.word'
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet') || mimeType === 'text/csv') return '.excel'
    if (mimeType.startsWith('image/')) return 'img'
    return '📎'
}