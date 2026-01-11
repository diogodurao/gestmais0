"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, User, TrendingDown } from "lucide-react"
import { PaymentData, type PaymentToolType } from "@/lib/types"
import { MONTHS_PT } from "@/lib/constants/timing"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

interface PaymentMobileCardsProps {
    data: PaymentData[]
    monthlyQuota: number
    isEditing: boolean
    activeTool: PaymentToolType
    onCellClick: (aptId: number, monthIdx: number) => void
}

interface MobileCardProps {
    item: PaymentData
    monthlyQuota: number
    isEditing: boolean
    activeTool: PaymentToolType
    onCellClick: (aptId: number, monthIdx: number) => void
}

/**
 * Individual expandable card for mobile view
 */
function MobileCard({ item, monthlyQuota, isEditing, activeTool, onCellClick }: MobileCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    const hasDebt = item.balance > 0
    const expectedTotal = 12 * monthlyQuota
    const progressPercent = expectedTotal > 0
        ? Math.round((item.totalPaid / expectedTotal) * 100)
        : 0

    return (
        <div className={cn(
            "tech-border bg-white overflow-hidden transition-colors",
            hasDebt && "border-gray-200"
        )}>
            {/* Card Header - Clickable to expand */}
            <div
                className="p-3 cursor-pointer active:bg-gray-50"
                onClick={() => setIsExpanded(!isExpanded)}
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                aria-label={isExpanded ? "Fechar detalhes" : "Expandir detalhes"}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsExpanded(!isExpanded)}
            >
                <div className="flex items-start justify-between gap-3">
                    {/* Unit & Resident */}
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className={cn(
                            "shrink-0 w-10 h-10 flex items-center justify-center font-bold text-body rounded-sm border",
                            hasDebt
                                ? "bg-error-light text-error border-gray-200"
                                : "bg-emerald-100 text-emerald-700 border-emerald-200"
                        )}>
                            {item.unit}
                        </div>
                        <div className="min-w-0 flex-1">
                            {item.residentName ? (
                                <span className="text-body font-medium text-gray-800 truncate block flex items-center gap-1">
                                    <User className="w-3 h-3 text-gray-400 shrink-0" />
                                    {item.residentName}
                                </span>
                            ) : (
                                <span className="text-body text-gray-400 italic">Sem residente</span>
                            )}
                            <div className="text-label text-gray-400 mt-0.5">
                                {formatCurrency(item.totalPaid)} de {formatCurrency(expectedTotal)}
                            </div>
                        </div>
                    </div>

                    {/* Status & Expand */}
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "px-2 py-1 rounded-sm text-label font-bold",
                            hasDebt
                                ? "bg-error-light text-error border border-gray-200"
                                : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        )}>
                            {hasDebt ? (
                                <span className="flex items-center gap-1">
                                    <TrendingDown className="w-3 h-3" />
                                    {formatCurrency(item.balance)}
                                </span>
                            ) : (
                                "Em dia"
                            )}
                        </div>
                        {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-2">
                    <div className="h-1.5 bg-gray-100 overflow-hidden rounded-full">
                        <div
                            className={cn(
                                "h-full transition-all rounded-full",
                                progressPercent >= 100 ? "bg-emerald-500" :
                                    progressPercent >= 50 ? "bg-warning-light0" : "bg-error-light0"
                            )}
                            style={{ width: `${Math.min(progressPercent, 100)}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Expanded Content - Month Grid */}
            {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50/50 p-3">
                    <div className="text-micro font-bold text-gray-500 uppercase tracking-tight mb-2">
                        QUOTAS MENSAIS
                    </div>

                    {/* Month Grid - 6 columns */}
                    <div className="grid grid-cols-6 gap-1.5">
                        {MONTHS_PT.map((monthName, idx) => {
                            const monthNum = idx + 1
                            const payment = item.payments[monthNum]
                            const status = payment?.status || 'pending'
                            const isInteractive = isEditing && activeTool

                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        if (isInteractive) onCellClick(item.apartmentId, idx)
                                    }}
                                    disabled={!isInteractive}
                                    aria-label={`${monthName} - ${status === 'paid' ? 'Pago' : status === 'late' ? 'Em atraso' : 'Pendente'}`}
                                    className={cn(
                                        "p-2 text-center transition-all border rounded-sm",
                                        status === 'paid' && "bg-emerald-50 border-emerald-200",
                                        status === 'late' && "bg-error-light border-gray-200",
                                        status === 'pending' && "bg-white border-gray-200",
                                        isInteractive && "active:scale-95 cursor-pointer",
                                        !isInteractive && "cursor-default"
                                    )}
                                >
                                    <div className="text-micro font-bold text-gray-500">{monthName}</div>
                                    <div className={cn(
                                        "text-label font-mono font-bold mt-0.5",
                                        status === 'paid' && "text-emerald-700",
                                        status === 'late' && "text-error",
                                        status === 'pending' && "text-gray-400"
                                    )}>
                                        {status === 'paid' ? "✓" : status === 'late' ? "!" : "—"}
                                    </div>
                                </button>
                            )
                        })}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-center gap-3 mt-3 pt-2 border-t border-gray-200">
                        <span className="flex items-center gap-1 text-micro text-gray-500">
                            <span className="w-2 h-2 bg-emerald-500 rounded-sm" /> Pago
                        </span>
                        <span className="flex items-center gap-1 text-micro text-gray-500">
                            <span className="w-2 h-2 bg-gray-300 rounded-sm" /> Pendente
                        </span>
                        <span className="flex items-center gap-1 text-micro text-gray-500">
                            <span className="w-2 h-2 bg-error-light0 rounded-sm" /> Dívida
                        </span>
                    </div>

                    {/* Edit mode indicator */}
                    {isEditing && (
                        <div className="mt-2 text-center text-micro text-info animate-pulse">
                            Toque num mês para alterar
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export function PaymentMobileCards({
    data,
    monthlyQuota,
    isEditing,
    activeTool,
    onCellClick
}: PaymentMobileCardsProps) {
    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 p-4">
                <p className="text-label font-bold text-gray-400 uppercase tracking-widest text-center">
                    [ Sem frações ]
                </p>
            </div>
        )
    }

    // Calculate totals for summary
    const totalPaid = data.reduce((sum, item) => sum + item.totalPaid, 0)
    const totalDebt = data.reduce((sum, item) => sum + item.balance, 0)

    return (
        <div className="p-3 space-y-2">
            {data.map((item) => (
                <MobileCard
                    key={item.apartmentId}
                    item={item}
                    monthlyQuota={monthlyQuota}
                    isEditing={isEditing}
                    activeTool={activeTool}
                    onCellClick={onCellClick}
                />
            ))}

            {/* Summary Card */}
            <div className="tech-border bg-gray-100 p-3 mt-4">
                <div className="flex items-center justify-between text-label font-bold uppercase tracking-tight">
                    <span className="text-gray-500">{data.length} Frações</span>
                    <div className="flex items-center gap-3">
                        <span className="text-emerald-700">{formatCurrency(totalPaid)} Cobrado</span>
                        {totalDebt > 0 && (
                            <span className="text-error">{formatCurrency(totalDebt)} Dívida</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}