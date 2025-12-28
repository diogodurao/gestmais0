"use client"

import { cn } from "@/lib/utils"
import { formatCurrency, getMonthName } from "@/lib/extraordinary-calculations"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { type ApartmentPaymentData } from "@/app/actions/extraordinary"
import { type ToolMode, type CellStatus } from "../types"

interface ApartmentRowProps {
    apartment: ApartmentPaymentData
    toolMode: ToolMode
    onCellClick: (paymentId: number, status: CellStatus, amount: number) => void
    readOnly: boolean
    startMonth: number
    startYear: number
}

export function ApartmentRow({
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
                            inst.status === "paid" && "bg-emerald-50 text-emerald-700",
                            inst.status === "overdue" && "bg-rose-50 text-rose-700 font-bold",
                            inst.status === "partial" && "bg-amber-50 text-amber-700",
                            inst.status === "pending" && "text-slate-400",
                            toolMode && !readOnly && inst.status === "pending" && "hover:bg-emerald-100",
                            toolMode && !readOnly && inst.status === "paid" && "hover:bg-rose-100",
                            toolMode && !readOnly && inst.status === "overdue" && "hover:bg-emerald-100"
                        )}
                    >
                        {inst.status === "paid" && <span className="font-mono text-[11px]">{formatCurrency(inst.paidAmount).replace("€", "").trim()}</span>}
                        {inst.status === "partial" && <span className="font-mono text-[10px]">{formatCurrency(inst.paidAmount).replace("€", "").trim()}</span>}
                        {inst.status === "overdue" && <span className="text-[9px] font-bold uppercase">EM ATRASO</span>}
                        {inst.status === "pending" && "—"}
                    </td>
                )
            })}

            <td className="data-cell text-right font-mono text-emerald-700">{formatCurrency(apartment.totalPaid)}</td>
            <td className={cn(
                "data-cell text-right font-mono font-bold",
                apartment.balance > 0 ? "text-rose-600 bg-rose-50" : "text-slate-400"
            )}>
                {formatCurrency(apartment.balance)}
            </td>
            <td className="data-cell text-center">
                <StatusBadge status={apartment.status} className="text-[8px] sm:text-[9px] px-1.5 sm:px-2" />
            </td>
        </tr>
    )
}
