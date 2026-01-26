"use client"

import { memo } from "react"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/format"
import { Badge } from "@/components/ui/Badge"
import { type ApartmentPaymentData } from "@/lib/actions/extraordinary-projects"
import { type ExtraordinaryToolMode, type PaymentStatus } from "@/lib/types"

interface ApartmentRowProps {
    apartment: ApartmentPaymentData
    toolMode: ExtraordinaryToolMode
    onCellClick: (paymentId: number, status: PaymentStatus, amount: number) => void
    readOnly: boolean
    startMonth: number
    startYear: number
    rowIndex: number
}

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

export const ApartmentRow = memo(function ApartmentRow({
    apartment,
    toolMode,
    onCellClick,
    readOnly,
    rowIndex
}: ApartmentRowProps) {
    const isInteractive = toolMode && !readOnly

    return (
        <tr className={cn(
            "border-b border-gray-100 transition-colors hover:bg-gray-50",
            rowIndex % 2 === 1 && "bg-gray-50"
        )}>
            <td className="sticky left-0 z-10 bg-inherit px-1.5 py-1 text-center font-medium text-gray-800">
                {apartment.unit}
            </td>
            <td className="px-1.5 py-1 text-gray-700 truncate max-w-28">
                {apartment.residentName || <span className="text-gray-400 italic">Sem residente</span>}
            </td>
            <td className="px-1.5 py-1 text-right font-mono text-gray-500">
                {apartment.permillage.toFixed(2)}
            </td>
            <td className="px-1.5 py-1 text-right font-mono text-gray-700">
                {formatCurrency(apartment.totalShare)}
            </td>

            {apartment.installments.map((inst) => (
                <td key={inst.id} className="p-0.5">
                    <button
                        type="button"
                        disabled={!isInteractive}
                        onClick={() => isInteractive && onCellClick(inst.id, inst.status, inst.expectedAmount)}
                        onKeyDown={(e) => isInteractive && (e.key === 'Enter' || e.key === ' ') && onCellClick(inst.id, inst.status, inst.expectedAmount)}
                        className={cn(
                            "w-full h-6 flex items-center justify-center rounded text-xs font-medium transition-all",
                            inst.status === "paid" && "bg-primary-light text-primary-dark",
                            inst.status === "late" && "bg-error-light text-error",
                            inst.status === "pending" && "text-gray-400",
                            inst.status === "partial" && "bg-warning-light text-warning",
                            isInteractive && "cursor-crosshair hover:ring-1 hover:ring-primary",
                            !isInteractive && "cursor-default"
                        )}
                    >
                        {inst.status === "paid" ? "✓" : inst.status === "late" ? "!" : "—"}
                    </button>
                </td>
            ))}

            <td className="px-1.5 py-1 text-right font-mono font-medium text-primary-dark">
                {formatCurrency(apartment.totalPaid)}
            </td>
            <td className={cn(
                "px-1.5 py-1 text-right font-mono font-medium",
                apartment.balance > 0 ? "text-error" : "text-gray-400"
            )}>
                {formatCurrency(apartment.balance)}
            </td>
            <td className="px-1.5 py-1 text-center">
                <Badge variant={statusVariantMap[apartment.status] || "error"} size="sm">
                    {statusLabelMap[apartment.status] || apartment.status}
                </Badge>
            </td>
        </tr>
    )
})
