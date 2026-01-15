"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { getMonthName } from "@/lib/format"
import { Badge } from "@/components/ui/Badge"
import { Progress } from "@/components/ui/Progress"
import { type ApartmentPaymentData } from "@/lib/actions/extraordinary-projects"
import { type ExtraordinaryToolMode, type PaymentStatus } from "@/lib/types"

// Map apartment status to Badge variant
const statusVariantMap: Record<string, "success" | "warning" | "error"> = {
    complete: "success",
    partial: "warning",
    pending: "error",
}

const statusLabelMap: Record<string, string> = {
    complete: "Pago",
    partial: "Parcial",
    pending: "Pendente",
}

interface MobileApartmentCardProps {
    apartment: ApartmentPaymentData
    project: {
        startMonth: number
        startYear: number
    }
    toolMode: ExtraordinaryToolMode
    onCellClick: (paymentId: number, status: PaymentStatus, amount: number) => void
    readOnly: boolean
}

function formatCurrencyShort(cents: number): string {
    return `€${(cents / 100).toFixed(0)}`
}

export function MobileApartmentCard({ apartment, project, toolMode, onCellClick, readOnly }: MobileApartmentCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const hasDebt = apartment.balance > 0
    const progressPercent = apartment.totalShare > 0
        ? Math.round((apartment.totalPaid / apartment.totalShare) * 100)
        : 0

    const isInteractive = toolMode && !readOnly

    return (
        <div className={cn(
            "rounded-lg border bg-white overflow-hidden",
            hasDebt ? "border-[#EFCDD1]" : "border-[#E9ECEF]"
        )}>
            <div
                className="p-1.5 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                aria-label={isExpanded ? "Fechar detalhes da fração" : "Expandir detalhes da fração"}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <div className={cn(
                            "shrink-0 w-8 h-8 flex items-center justify-center font-medium text-body rounded border",
                            apartment.status === "complete"
                                ? "bg-primary-light text-primary-dark border-[#D4E5D7]"
                                : apartment.status === "partial"
                                    ? "bg-warning-light text-warning border-[#F0E4C8]"
                                    : "bg-error-light text-error border-[#EFCDD1]"
                        )}>
                            {apartment.unit}
                        </div>
                        <div className="min-w-0 flex-1">
                            {apartment.residentName ? (
                                <span className="text-body font-medium text-gray-700 truncate block flex items-center gap-1">
                                    <User className="w-3 h-3 text-gray-500 shrink-0" />
                                    {apartment.residentName}
                                </span>
                            ) : (
                                <span className="text-label text-gray-500 italic">Sem residente</span>
                            )}
                            <div className="text-xs text-gray-500 mt-0.5">
                                {formatCurrencyShort(apartment.totalPaid)} de {formatCurrencyShort(apartment.totalShare)}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <Badge variant={statusVariantMap[apartment.status] || "error"} size="sm">
                            {statusLabelMap[apartment.status] || apartment.status}
                        </Badge>
                        {isExpanded ? (
                            <ChevronUp className="w-3 h-3 text-gray-500" />
                        ) : (
                            <ChevronDown className="w-3 h-3 text-gray-500" />
                        )}
                    </div>
                </div>

                <div className="mt-1.5">
                    <Progress value={progressPercent} size="sm" />
                </div>
            </div>

            {isExpanded && (
                <div className="border-t border-[#F1F3F5] bg-gray-50 p-1.5">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                        Prestações
                    </div>

                    <div className="grid grid-cols-3 gap-1">
                        {apartment.installments.map((inst, idx) => {
                            let month = project.startMonth + idx
                            let year = project.startYear
                            while (month > 12) { month -= 12; year++ }

                            return (
                                <button
                                    key={inst.id}
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        if (isInteractive) onCellClick(inst.id, inst.status, inst.expectedAmount)
                                    }}
                                    disabled={!isInteractive}
                                    className={cn(
                                        "p-1.5 text-center transition-all border rounded",
                                        inst.status === "paid" && "bg-primary-light border-[#D4E5D7]",
                                        inst.status === "late" && "bg-error-light border-[#EFCDD1]",
                                        inst.status === "pending" && "bg-white border-[#E9ECEF]",
                                        inst.status === "partial" && "bg-warning-light border-[#F0E4C8]",
                                        isInteractive && "cursor-pointer active:scale-95",
                                        !isInteractive && "cursor-default"
                                    )}
                                >
                                    <div className="text-micro font-medium text-gray-500">
                                        P{idx + 1}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        {getMonthName(month, true)}/{String(year).slice(-2)}
                                    </div>
                                    <div className={cn(
                                        "text-label font-bold mt-0.5",
                                        inst.status === "paid" && "text-primary-dark",
                                        inst.status === "late" && "text-error",
                                        inst.status === "pending" && "text-gray-500",
                                        inst.status === "partial" && "text-warning"
                                    )}>
                                        {inst.status === "paid" ? "✓" : inst.status === "late" ? "!" : "—"}
                                    </div>
                                </button>
                            )
                        })}
                    </div>

                    <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-[#E9ECEF]">
                        <span className="text-xs text-gray-500">
                            Quota: {apartment.permillage.toFixed(2)}‰
                        </span>
                        <span className={cn(
                            "text-xs font-medium",
                            apartment.balance > 0 ? "text-error" : "text-primary-dark"
                        )}>
                            {apartment.balance > 0 ? `Dívida: ${formatCurrencyShort(apartment.balance)}` : "Em dia"}
                        </span>
                    </div>

                    {isInteractive && (
                        <div className="mt-1.5 text-center text-xs text-primary animate-pulse">
                            Toque numa prestação para alterar
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
