"use client"

import { memo } from "react"
import { cn } from "@/lib/utils"
import { formatCurrency, getMonthName } from "@/lib/format"
import { Badge } from "@/components/ui/Badge"
import { type ApartmentPaymentData } from "@/app/actions/extraordinary"
import { type ExtraordinaryToolMode, type PaymentStatus } from "@/lib/types"
import { GENERAL_STATUS_CONFIG } from "@/lib/constants"

interface ApartmentRowProps {
    apartment: ApartmentPaymentData
    toolMode: ExtraordinaryToolMode
    onCellClick: (paymentId: number, status: PaymentStatus, amount: number) => void
    readOnly: boolean
    startMonth: number
    startYear: number
}

export const ApartmentRow = memo(function ApartmentRow({
    apartment,
    toolMode,
    onCellClick,
    readOnly,
    startMonth,
    startYear
}: ApartmentRowProps) {
    return (
        <tr className="group hover:bg-slate-50/50">
            <td className="data-cell text-center font-bold bg-slate-50 sticky left-0 z-10 group-hover:bg-slate-100">
                {apartment.unit}
            </td>
            <td className="data-cell">
                {apartment.residentName || <span className="text-slate-400 italic">—</span>}
            </td>
            <td className="data-cell text-right font-mono text-slate-500">{apartment.permillage.toFixed(2)}</td>
            <td className="data-cell text-right font-mono font-bold">{formatCurrency(apartment.totalShare)}</td>

            {apartment.installments.map((inst, idx) => {
                const isInteractive = toolMode && !readOnly;
                const month = ((startMonth + idx - 1) % 12) + 1;
                const year = startYear + Math.floor((startMonth + idx - 1) / 12);
                const monthName = getMonthName(month, true);

                return (
                    <td
                        key={inst.id}
                        role={isInteractive ? "button" : undefined}
                        tabIndex={isInteractive ? 0 : undefined}
                        aria-label={`${isInteractive ? 'Marcar Pago' : ''} ${monthName}/${year} Estado: ${inst.status}`}
                        onClick={isInteractive ? () => onCellClick(inst.id, inst.status, inst.expectedAmount) : undefined}
                        onKeyDown={isInteractive ? (e) => (e.key === 'Enter' || e.key === ' ') && onCellClick(inst.id, inst.status, inst.expectedAmount) : undefined}
                        className={cn(
                            "data-cell text-center transition-colors",
                            toolMode && !readOnly && "cursor-pointer",
                            inst.status === "paid" && "status-active",
                            inst.status === "late" && "status-alert font-bold",
                            inst.status === "partial" && "status-pending",
                            inst.status === "pending" && "text-slate-400",
                            toolMode && !readOnly && inst.status === "pending" && "hover:bg-emerald-100",
                            toolMode && !readOnly && inst.status === "paid" && "hover:bg-rose-100",
                            toolMode && !readOnly && inst.status === "late" && "hover:bg-emerald-100"
                        )}
                    >
                        {inst.status === "paid" && <span className="font-mono text-body">{formatCurrency(inst.paidAmount).replace("€", "").trim()}</span>}
                        {inst.status === "partial" && <span className="font-mono text-label">{formatCurrency(inst.paidAmount).replace("€", "").trim()}</span>}
                        {inst.status === "late" && <span className="text-micro font-bold uppercase">EM ATRASO</span>}
                        {inst.status === "pending" && "—"}
                    </td>
                )
            })}

            <td className="data-cell text-right font-mono text-emerald-700">{formatCurrency(apartment.totalPaid)}</td>
            <td className={cn(
                "data-cell text-right font-mono font-bold",
                apartment.balance > 0 ? "status-alert" : "text-slate-400"
            )}>
                {formatCurrency(apartment.balance)}
            </td>
            <td className="data-cell text-center">
                <Badge status={apartment.status} config={GENERAL_STATUS_CONFIG} className="text-micro px-1.5 sm:px-2" />
            </td>
        </tr>
    )
})
