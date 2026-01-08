export const TIMING = {
    SYNC_INITIAL_DELAY: 2500,
    REDIRECT_DELAY: 1500,
    HIGHLIGHT_DURATION: 3000,
} as const

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