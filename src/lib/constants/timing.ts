export const TIMING = {
    SYNC_INITIAL_DELAY: 2500,
    REDIRECT_DELAY: 1500,
    HIGHLIGHT_DURATION: 3000,
} as const

// ==========================================
// SUBSCRIPTION GRACE PERIOD
// ==========================================

/** Days allowed for payment update after subscription becomes past_due before blocking */
export const SUBSCRIPTION_GRACE_PERIOD_DAYS = 3

// ==========================================
// NOTIFICATION RETENTION
// ==========================================

/** Days to keep read notifications before cleanup */
export const NOTIFICATION_READ_RETENTION_DAYS = 7

/** Days to keep unread notifications before cleanup */
export const NOTIFICATION_UNREAD_RETENTION_DAYS = 30

// ==========================================
// CALENDAR / RECURRENCE
// ==========================================

/** Default number of recurring event occurrences to generate */
export const DEFAULT_RECURRENCE_COUNT = 4

export const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
] as const

export const MONTHS_PT = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez"
] as const

export const EVALUATION_MONTH_NAMES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
] as const
export const MONTHS_PT_FULL = EVALUATION_MONTH_NAMES

export const MONTH_OPTIONS = EVALUATION_MONTH_NAMES.map((label, i) => ({
    value: String(i + 1),
    label
}))