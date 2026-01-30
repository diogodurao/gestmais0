"use client"

import { cn } from "@/lib/utils"
import { MONTHS_PT } from "@/lib/constants/timing"
import { formatCurrency } from "@/lib/format"
import { type PaymentToolType, type PaymentData } from "@/lib/types"

interface PaymentDesktopTableProps {
    data: PaymentData[]
    quotaMode: string
    readOnly: boolean
    activeTool: PaymentToolType
    highlightedId: number | null
    onCellClick: (aptId: number, monthIdx: number) => void
    onDelete: (aptId: number) => void
}

export function PaymentDesktopTable({
    data,
    quotaMode,
    readOnly,
    activeTool,
    highlightedId,
    onCellClick,
}: PaymentDesktopTableProps) {
    const isInteractive = !readOnly && !!activeTool

    return (
        <div className="hidden sm:block overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full border-collapse text-label">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                        {/* Sticky columns - Unit & Resident */}
                        <th className="sticky left-0 z-10 bg-gray-50 px-1.5 py-1 text-left text-xs font-medium uppercase tracking-wide text-gray-500 border-r border-gray-200 w-12">
                            Fração
                        </th>
                        <th className="sticky left-12 z-10 bg-gray-50 px-1.5 py-1 text-left text-xs font-medium uppercase tracking-wide text-gray-500 border-r border-gray-200 w-28">
                            Residente
                        </th>

                        {/* Month columns */}
                        {MONTHS_PT.map((month) => (
                            <th key={month} className="px-1.5 py-1 text-center text-xs font-medium uppercase tracking-wide text-gray-500 w-12">
                                {month.slice(0, 3)}
                            </th>
                        ))}

                        {/* Sticky columns - Totals */}
                        <th className="sticky right-16 z-10 bg-gray-50 px-1.5 py-1 text-right text-xs font-medium uppercase tracking-wide text-gray-500 border-l border-gray-200 w-16">
                            Pago
                        </th>
                        <th className="sticky right-0 z-10 bg-gray-50 px-1.5 py-1 text-right text-xs font-medium uppercase tracking-wide text-gray-500 w-16">
                            Dívida
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={16} className="py-12 text-center text-gray-400 text-sm">
                                Sem resultados
                            </td>
                        </tr>
                    ) : (
                        data.map((apt, idx) => {
                            const isHighlighted = apt.apartmentId === highlightedId

                            return (
                                <tr
                                    key={apt.apartmentId}
                                    className={cn(
                                        "border-b border-gray-100 transition-colors",
                                        isHighlighted
                                            ? "bg-amber-50"
                                            : idx % 2 === 1
                                                ? "bg-gray-50 hover:bg-gray-100"
                                                : "hover:bg-gray-50"
                                    )}
                                >
                                    {/* Unit */}
                                    <td className={cn(
                                        "sticky left-0 z-10 px-1.5 py-1 font-medium text-gray-800 border-r border-gray-200",
                                        isHighlighted ? "bg-amber-50" : idx % 2 === 1 ? "bg-gray-50" : "bg-white"
                                    )}>
                                        {apt.unit}
                                    </td>

                                    {/* Resident */}
                                    <td className={cn(
                                        "sticky left-12 z-10 px-1.5 py-1 text-gray-700 border-r border-gray-200 truncate max-w-28",
                                        isHighlighted ? "bg-amber-50" : idx % 2 === 1 ? "bg-gray-50" : "bg-white"
                                    )}>
                                        {apt.residentName || <span className="text-gray-400 italic">Sem residente</span>}
                                    </td>

                                    {/* Payment cells */}
                                    {MONTHS_PT.map((_, monthIdx) => {
                                        const monthNum = monthIdx + 1
                                        const payment = apt.payments[monthNum]
                                        const status = payment?.status || "pending"

                                        return (
                                            <td key={monthIdx} className="p-0.5">
                                                <button
                                                    type="button"
                                                    disabled={!isInteractive}
                                                    onClick={() => isInteractive && onCellClick(apt.apartmentId, monthIdx)}
                                                    className={cn(
                                                        "w-full h-6 flex items-center justify-center rounded text-xs font-medium transition-all",
                                                        status === "paid" && "bg-primary-light text-primary-dark",
                                                        status === "late" && "bg-error-light text-error",
                                                        status === "pending" && "text-gray-400",
                                                        isInteractive && "cursor-crosshair hover:ring-1 hover:ring-primary",
                                                        !isInteractive && "cursor-default"
                                                    )}
                                                >
                                                    {status === "paid"
                                                        ? formatCurrency(payment?.amount || apt.apartmentQuota)
                                                        : status === "late"
                                                            ? "DÍVIDA"
                                                            : "-"}
                                                </button>
                                            </td>
                                        )
                                    })}

                                    {/* Total paid */}
                                    <td className={cn(
                                        "sticky right-16 z-10 px-1.5 py-1 text-right font-medium text-primary-dark border-l border-gray-200",
                                        isHighlighted ? "bg-amber-50" : "bg-gray-50"
                                    )}>
                                        {formatCurrency(apt.totalPaid)}
                                    </td>

                                    {/* Balance/Debt */}
                                    <td className={cn(
                                        "sticky right-0 z-10 px-1.5 py-1 text-right font-medium",
                                        apt.balance > 0 ? "text-error bg-error-light" : "text-gray-400 bg-gray-50"
                                    )}>
                                        {formatCurrency(apt.balance)}
                                    </td>
                                </tr>
                            )
                        })
                    )}
                </tbody>
            </table>
        </div>
    )
}