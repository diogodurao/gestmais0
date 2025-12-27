"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
    CheckCircle,
    AlertTriangle,
    AlertCircle,
    TrendingUp,
    Hammer,
    ChevronRight,
    RefreshCw,
    Clock,
    Euro,
} from "lucide-react"
import { formatCurrency } from "@/lib/extraordinary-calculations"
import {
    getResidentPaymentStatus,
    getApartmentPaymentStatus,
    type PaymentStatusSummary
} from "@/app/actions/payment-status"
import { SkeletonCard, SkeletonCompactCard } from "@/components/ui/Skeletons"
import { QuotaSection } from "./components/QuotaSection"

// ===========================================
// TYPES
// ===========================================

interface PaymentStatusCardProps {
    userId?: string              // For resident view
    apartmentId?: number         // For manager view (specific apartment)
    variant?: "full" | "compact" // Full shows breakdown, compact just summary
    className?: string
}

// ===========================================
// MAIN COMPONENT
// ===========================================

export function PaymentStatusCard({
    userId,
    apartmentId,
    variant = "full",
    className
}: PaymentStatusCardProps) {
    const [data, setData] = useState<PaymentStatusSummary | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadStatus = async (signal?: AbortSignal): Promise<void> => {
        setIsLoading(true)
        setError(null)

        let result
        try {
            if (userId) {
                result = await getResidentPaymentStatus(userId)
            } else if (apartmentId) {
                result = await getApartmentPaymentStatus(apartmentId)
            } else {
                setError("Sem identificador de utilizador ou fração")
                setIsLoading(false)
                return
            }

            if (signal?.aborted) return

            if (result.success) {
                setData(result.data)
            } else {
                setError(result.error)
            }
        } catch (err) {
            if (signal?.aborted) return
            setError("Erro ao carregar dados")
        } finally {
            if (!signal?.aborted) {
                setIsLoading(false)
            }
        }
    }

    useEffect(() => {
        const controller = new AbortController()
        loadStatus(controller.signal)
        return () => controller.abort()
    }, [userId, apartmentId])

    if (isLoading) {
        if (variant === "compact") {
            return <SkeletonCompactCard className={className} />
        }
        return <SkeletonCard className={className} />
    }

    if (error || !data) {
        return (
            <div className={cn("tech-border bg-slate-50 p-4", className)}>
                <div className="flex items-center gap-3 text-slate-500">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-[11px]">{error || "Erro ao carregar dados"}</p>
                </div>
            </div>
        )
    }

    // Status styling
    const statusConfig = {
        ok: {
            bg: "bg-emerald-50",
            border: "border-emerald-200",
            icon: CheckCircle,
            iconColor: "text-emerald-600",
            textColor: "text-emerald-800",
            badgeBg: "bg-emerald-100",
            badgeText: "text-emerald-700",
            badgeLabel: "Em dia",
        },
        warning: {
            bg: "bg-amber-50",
            border: "border-amber-200",
            icon: AlertTriangle,
            iconColor: "text-amber-600",
            textColor: "text-amber-800",
            badgeBg: "bg-amber-100",
            badgeText: "text-amber-700",
            badgeLabel: "Pendente",
        },
        critical: {
            bg: "bg-rose-50",
            border: "border-rose-200",
            icon: AlertCircle,
            iconColor: "text-rose-600",
            textColor: "text-rose-800",
            badgeBg: "bg-rose-100",
            badgeText: "text-rose-700",
            badgeLabel: "Em atraso",
        },
    }

    const config = statusConfig[data.status]
    const StatusIcon = config.icon

    // Compact variant
    if (variant === "compact") {
        return (
            <div className={cn(
                "tech-border p-3 sm:p-4 transition-colors",
                config.bg,
                config.border,
                className
            )}>
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <StatusIcon className={cn("w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0", config.iconColor)} />
                        <div className="min-w-0">
                            <p className={cn("text-[11px] sm:text-[12px] font-medium", config.textColor)}>
                                {data.statusMessage}
                            </p>
                            {data.totalBalance > 0 && (
                                <p className="text-[10px] sm:text-[11px] text-slate-600 mt-0.5">
                                    Saldo: <span className="font-mono font-bold">{formatCurrency(data.totalBalance)}</span>
                                </p>
                            )}
                        </div>
                    </div>
                    <span className={cn(
                        "px-2 py-0.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider flex-shrink-0",
                        config.badgeBg,
                        config.badgeText
                    )}>
                        {config.badgeLabel}
                    </span>
                </div>
            </div>
        )
    }

    // Full variant
    return (
        <div className={cn("tech-border bg-white overflow-hidden", className)}>
            {/* Header with status message */}
            <div className={cn("p-3 sm:p-4", config.bg, config.border, "border-b")}>
                <div className="flex items-start gap-3">
                    <StatusIcon className={cn("w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 mt-0.5", config.iconColor)} />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={cn(
                                "px-2 py-0.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider",
                                config.badgeBg,
                                config.badgeText
                            )}>
                                {config.badgeLabel}
                            </span>
                            <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono">
                                {data.isBuildingSummary ? "CONDOMÍNIO" : `Fr. ${data.apartmentUnit}`}
                            </span>
                        </div>
                        <p className={cn(
                            "text-[12px] sm:text-[13px] font-medium mt-1.5 sm:mt-2 leading-relaxed",
                            config.textColor
                        )}>
                            {data.statusMessage}
                        </p>
                    </div>
                    <button
                        onClick={() => loadStatus()}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white/50 transition-colors flex-shrink-0"
                        title="Atualizar"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Payment breakdown */}
            <div className="p-3 sm:p-4 space-y-3">
                {/* Total Balance */}
                {data.totalBalance > 0 && (
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-slate-50 tech-border">
                        <div className="flex items-center gap-2">
                            <Euro className="w-4 h-4 text-slate-500" />
                            <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-tight">
                                Total em Dívida
                            </span>
                        </div>
                        <span className={cn(
                            "text-base sm:text-lg font-bold font-mono",
                            data.status === "critical" ? "text-rose-600" :
                                data.status === "warning" ? "text-amber-600" : "text-slate-700"
                        )}>
                            {formatCurrency(data.totalBalance)}
                        </span>
                    </div>
                )}

                {/* Regular Quotas */}
                {(data.regularQuotas.totalDueToDate > 0 || data.regularQuotas.balance > 0) && (
                    <QuotaSection
                        icon={TrendingUp}
                        title={data.isBuildingSummary ? "Total Quotas Mensais" : "Quotas Mensais"}
                        paid={data.regularQuotas.totalPaid}
                        due={data.regularQuotas.totalDueToDate}
                        balance={data.regularQuotas.balance}
                        overdueCount={data.regularQuotas.overdueMonths}
                        overdueLabel="meses"
                        linkHref="/dashboard/payments"
                    />
                )}

                {/* Extraordinary Quotas */}
                {(data.extraordinaryQuotas.activeProjects > 0 || data.extraordinaryQuotas.balance > 0) && (
                    <QuotaSection
                        icon={Hammer}
                        title={data.isBuildingSummary ? "Total Quotas Extraordinárias" : "Quotas Extraordinárias"}
                        subtitle={data.extraordinaryQuotas.activeProjects > 0
                            ? `${data.extraordinaryQuotas.activeProjects} projeto${data.extraordinaryQuotas.activeProjects > 1 ? "s" : ""} ativo${data.extraordinaryQuotas.activeProjects > 1 ? "s" : ""}`
                            : undefined
                        }
                        paid={data.extraordinaryQuotas.totalPaid}
                        due={data.extraordinaryQuotas.totalDueToDate}
                        balance={data.extraordinaryQuotas.balance}
                        overdueCount={data.extraordinaryQuotas.overdueInstallments}
                        overdueLabel="prestações"
                        linkHref="/dashboard/extraordinary"
                    />
                )}

                {/* All good message */}
                {data.totalBalance === 0 && data.status === "ok" && (
                    <div className="flex items-center justify-center gap-2 p-3 text-emerald-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-[11px] font-medium">
                            Todos os pagamentos regularizados
                        </span>
                    </div>
                )}
            </div>

            {/* Footer with last update */}
            <div className="px-3 sm:px-4 py-2 border-t border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Atualizado: {new Date(data.lastUpdated).toLocaleDateString("pt-PT", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit"
                        })}
                    </span>
                    {data.totalBalance > 0 && (
                        <Link
                            href="/dashboard/payments"
                            className="text-blue-600 hover:underline font-medium"
                        >
                            Ver detalhes →
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}


export default PaymentStatusCard