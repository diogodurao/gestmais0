"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCurrency, getMonthName } from "@/lib/extraordinary-calculations"
import { StatusBadge } from "@/components/ui/StatusBadge"
// import { t } from "@/lib/translations"
import { type ApartmentPaymentData } from "@/app/actions/extraordinary"
import { type ToolMode, type CellStatus } from "../types"

interface MobileApartmentCardProps {
    apartment: ApartmentPaymentData
    project: {
        startMonth: number
        startYear: number
    }
    toolMode: ToolMode
    onCellClick: (paymentId: number, status: CellStatus, amount: number) => void
    readOnly: boolean
}

export function MobileApartmentCard({ apartment, project, toolMode, onCellClick, readOnly }: MobileApartmentCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const progressPercent = apartment.totalShare > 0
        ? Math.round((apartment.totalPaid / apartment.totalShare) * 100)
        : 0

    return (
        <div className="tech-border bg-white overflow-hidden">
            <div
                className="p-3 cursor-pointer active:bg-slate-50"
                onClick={() => setIsExpanded(!isExpanded)}
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                aria-label={isExpanded ? "Fechar detalhes da fração" : "Expandir detalhes da fração"}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsExpanded(!isExpanded)}
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="shrink-0 w-10 h-10 bg-slate-100 flex items-center justify-center">
                            <span className="text-[13px] font-bold text-slate-700">{apartment.unit}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                            {apartment.residentName ? (
                                <span className="text-[12px] font-medium text-slate-800 truncate block">
                                    {apartment.residentName}
                                </span>
                            ) : (
                                <span className="text-[11px] text-slate-400 italic">Sem residente</span>
                            )}
                            <div className="text-[10px] text-slate-400 mt-0.5">
                                {apartment.permillage.toFixed(2)}‰ • {formatCurrency(apartment.totalShare)}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <StatusBadge status={apartment.status} className="text-[8px] sm:text-[9px] px-1.5 sm:px-2" />
                        {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                    </div>
                </div>

                <div className="mt-2">
                    <div className="flex items-center justify-between text-[9px] mb-1">
                        <span className="text-emerald-600 font-medium">{formatCurrency(apartment.totalPaid)} Pago</span>
                        <span className={cn(
                            "font-medium",
                            apartment.balance > 0 ? "text-rose-600" : "text-slate-400"
                        )}>
                            {apartment.balance > 0 ? `${formatCurrency(apartment.balance)} em Dívida` : "Liquidado"}
                        </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 overflow-hidden">
                        <div
                            className={cn(
                                "h-full transition-all",
                                progressPercent >= 100 ? "bg-emerald-500" :
                                    progressPercent >= 50 ? "bg-amber-500" : "bg-rose-500"
                            )}
                            style={{ width: `${Math.min(progressPercent, 100)}%` }}
                        />
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-3">
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-tight mb-2">
                        PRESTAÇÕES
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                        {apartment.installments.map((inst, idx) => {
                            let month = project.startMonth + idx
                            let year = project.startYear
                            while (month > 12) { month -= 12; year++ }

                            return (
                                <button
                                    key={inst.id}
                                    aria-label={`Marcar Pago ${idx + 1}`}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        if (toolMode && !readOnly) onCellClick(inst.id, inst.status, inst.expectedAmount)
                                    }}
                                    disabled={!toolMode || readOnly}
                                    className={cn(
                                        "p-2 text-center transition-all border",
                                        inst.status === "paid" && "bg-emerald-50 border-emerald-200",
                                        inst.status === "overdue" && "bg-rose-50 border-rose-200",
                                        inst.status === "pending" && "bg-white border-slate-200",
                                        inst.status === "partial" && "bg-amber-50 border-amber-200",
                                        toolMode && !readOnly && "active:scale-95",
                                        (!toolMode || readOnly) && "cursor-default"
                                    )}
                                >
                                    <div className="text-[8px] font-bold text-slate-500">P{idx + 1}</div>
                                    <div className="text-[7px] text-slate-400">
                                        {getMonthName(month, true)}/{String(year).slice(-2)}
                                    </div>
                                    <div className={cn(
                                        "text-[10px] font-mono font-bold mt-0.5",
                                        inst.status === "paid" && "text-emerald-700",
                                        inst.status === "overdue" && "text-rose-700",
                                        inst.status === "pending" && "text-slate-500",
                                        inst.status === "partial" && "text-amber-700"
                                    )}>
                                        {inst.status === "paid" ? "✓" :
                                            inst.status === "overdue" ? "!" : "—"}
                                    </div>
                                </button>
                            )
                        })}
                    </div>

                    <div className="flex items-center justify-center gap-3 mt-2 pt-2 border-t border-slate-200">
                        <span className="flex items-center gap-1 text-[8px] text-slate-500">
                            <span className="w-2 h-2 bg-emerald-500" /> Pago
                        </span>
                        <span className="flex items-center gap-1 text-[8px] text-slate-500">
                            <span className="w-2 h-2 bg-slate-300" /> Pendente
                        </span>
                        <span className="flex items-center gap-1 text-[8px] text-slate-500">
                            <span className="w-2 h-2 bg-rose-500" /> Em Atraso
                        </span>
                    </div>
                </div>
            )}
        </div>
    )
}
