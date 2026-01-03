export const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
] as const

export const MONTHS_PT = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez"
] as const

export const FLOOR_OPTIONS = [
    { value: "-2", label: "-2" },
    { value: "-1", label: "-1" },
    { value: "0", label: "R/C" },
    { value: "1", label: "1º" },
    { value: "2", label: "2º" },
    { value: "3", label: "3º" },
    { value: "4", label: "4º" },
    { value: "5", label: "5º" },
    { value: "6", label: "6º" },
    { value: "7", label: "7º" },
    { value: "8", label: "8º" },
    { value: "9", label: "9º" },
    { value: "10", label: "10º" },
] as const

export const UNIT_TYPES = [
    { value: "apartment", label: "Apartment", labelPt: "Apartamento" },
    { value: "shop", label: "Shop", labelPt: "Loja" },
    { value: "garage", label: "Garage", labelPt: "Garagem" },
    { value: "cave", label: "Cave", labelPt: "Cave" },
    { value: "storage", label: "Storage", labelPt: "Arrecadação" },
] as const


export const SUBSCRIPTION_STATUS = {
    ACTIVE: 'active',
    INCOMPLETE: 'incomplete',
    CANCELED: 'canceled',
    PAST_DUE: 'past_due',
} as const

export const DEFAULT_SUBSCRIPTION_PRICE_PER_UNIT = 300 // in cents

export const USER_ROLES = {
    MANAGER: 'manager',
    RESIDENT: 'resident',
} as const

// Type exports for type safety
export type SubscriptionStatus = typeof SUBSCRIPTION_STATUS[keyof typeof SUBSCRIPTION_STATUS]
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]
export type UnitType = typeof UNIT_TYPES[number]['value']

export const EVENT_TYPE_SUGGESTIONS = [
    "Assembleia",
    "Manutenção",
    "Limpeza",
    "Outro",
] as const

export const OCCURRENCE_STATUS_CONFIG = {
    open: { label: "Aberta", color: "bg-green-100 text-green-700" },
    in_progress: { label: "Em Progresso", color: "bg-yellow-100 text-yellow-700" },
    resolved: { label: "Resolvida", color: "bg-slate-100 text-slate-600" },
} as const

export const MAX_PHOTOS_PER_OCCURRENCE = 3
export const MAX_PHOTO_SIZE = 5 * 1024 * 1024 // 5 MB

/**
 * Map UI tool names to DB status values
 */
export const PAYMENT_TOOL_TO_STATUS = {
    paid: 'paid',
    late: 'late',
    clear: 'pending',
} as const

export const POLL_TYPE_CONFIG = {
    yes_no: { label: "Sim/Não/Abstenção" },
    single_choice: { label: "Escolha única" },
    multiple_choice: { label: "Escolha múltipla" },
} as const

export const POLL_STATUS_CONFIG = {
    open: { label: "Aberta", color: "bg-green-100 text-green-700" },
    closed: { label: "Encerrada", color: "bg-slate-100 text-slate-600" },
} as const

export const WEIGHT_MODE_CONFIG = {
    equal: { label: "Maioria simples", description: "1 voto por pessoa" },
    permilagem: { label: "Permilagem", description: "Voto ponderado por fração" },
} as const

export const YES_NO_OPTIONS = [
    { value: "yes", label: "Sim" },
    { value: "no", label: "Não" },
    { value: "abstain", label: "Abstenção" },
] as const

export const EVALUATION_CATEGORIES = [
    { key: 'securityRating', label: 'Segurança' },
    { key: 'cleaningRating', label: 'Limpeza' },
    { key: 'maintenanceRating', label: 'Manutenção' },
    { key: 'communicationRating', label: 'Comunicação' },
    { key: 'generalRating', label: 'Geral' },
] as const

export const EVALUATION_CATEGORY_KEYS = EVALUATION_CATEGORIES.map(c => c.key)

export const EVALUATION_MONTH_NAMES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
] as const
export const MONTHS_PT_FULL = EVALUATION_MONTH_NAMES

export const MONTH_OPTIONS = EVALUATION_MONTH_NAMES.map((label, i) => ({
    value: String(i + 1),
    label
}))

export const NOTIFICATION_ICONS: Record<string, string> = {
    occurrence_created: '🚨',
    occurrence_comment: '💬',
    occurrence_status: '🔄',
    poll_created: '🗳️',
    poll_closed: '✅',
    discussion_created: '💭',
    discussion_comment: '💬',
    evaluation_open: '📊',
    calendar_event: '📅',
    payment_overdue: '⚠️',
}

export const DOCUMENT_CATEGORY_CONFIG = {
    atas: { label: 'Atas de Assembleia', icon: '📋' },
    regulamentos: { label: 'Regulamentos', icon: '📜' },
    contas: { label: 'Contas e Orçamentos', icon: '💰' },
    seguros: { label: 'Seguros', icon: '🛡️' },
    contratos: { label: 'Contratos', icon: '📝' },
    projetos: { label: 'Projetos', icon: '🏗️' },
    outros: { label: 'Outros', icon: '📁' },
} as const

export const DOCUMENT_CATEGORY_OPTIONS = Object.entries(DOCUMENT_CATEGORY_CONFIG).map(([value, { label }]) => ({
    value,
    label,
}))

export const GENERAL_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    // Project statuses
    active: { label: "Ativo", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    completed: { label: "Concluído", color: "bg-blue-50 text-blue-700 border-blue-200" },
    cancelled: { label: "Cancelado", color: "bg-slate-100 text-slate-500 border-slate-200" },
    archived: { label: "Arquivado", color: "bg-slate-100 text-slate-500 border-slate-200" },

    // Payment statuses
    paid: { label: "Pago", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    pending: { label: "Pendente", color: "bg-slate-100 text-slate-500 border-slate-200" },
    late: { label: "Atraso", color: "bg-rose-50 text-rose-700 border-rose-200" },
    partial: { label: "Parcial", color: "bg-amber-50 text-amber-700 border-amber-200" },

    // Apartment payment statuses
    complete: { label: "Liquidado", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },

    // Overall statuses
    ok: { label: "Em dia", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    warning: { label: "Pendente", color: "bg-amber-100 text-amber-700 border-amber-200" },
    critical: { label: "Em atraso", color: "bg-rose-100 text-rose-700 border-rose-200" },
}

export const PAYMENT_TABLE_LAYOUT = {
    CELL_WIDTH: 72,
    UNIT_WIDTH: 64,
    RESIDENT_WIDTH: 160,
    TOTAL_WIDTH: 88,
    ROW_HEIGHT: 36,
} as const