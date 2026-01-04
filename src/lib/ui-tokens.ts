export type Size = "xs" | "sm" | "md" | "lg"
export type SemanticVariant = "success" | "warning" | "danger" | "info" | "neutral"
export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger"

export const SEMANTIC_COLORS: Record<SemanticVariant, { bg: string; text: string; border: string }> = {
    success: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    warning: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
    danger: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
    info: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    neutral: { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" },
}
