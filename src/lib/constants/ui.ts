export const UI_DIMENSIONS = {
    MENU_WIDTH: "w-48",
} as const

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

export const PAYMENT_TOOL_TO_STATUS = {
    markPaid: 'paid',
    markLate: 'late',
    markPending: 'pending',
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