"use client"

import { PaymentData } from "@/app/actions/payments"
import { cn } from "@/components/ui/Button"
import { Trash2 } from "lucide-react"
import { getPaymentStatusColor, getPaymentStatusIcon } from "@/lib/utils"
import { MONTHS } from "@/lib/constants"

interface PaymentDesktopTableProps {
    data: PaymentData[]
    monthlyQuota: number
    readOnly: boolean
    activeTool: string | null
    highlightedId: number | null
    onCellClick: (aptId: number, monthIdx: number) => void
    onDelete: (aptId: number) => void
}

export function PaymentDesktopTable({
    data,
    monthlyQuota,
    readOnly,
    activeTool,
    highlightedId,
    onCellClick,
    onDelete
}: PaymentDesktopTableProps) {
    const formatValue = (cents: number) => {
        if (cents === 0) return "-"
        return `€${(cents / 100).toFixed(0)}`
    }

    return (
        <div className="hidden md:block overflow-x-auto h-full">
            <table className="w-full border-collapse whitespace-nowrap text-[11px]">
                <thead>
                    <tr className="bg-slate-50">
                        <th className="sticky left-0 z-30 bg-slate-100 border border-slate-300 px-3 py-2 text-left font-bold uppercase tracking-wider w-16" style={{ borderRightWidth: '2px', borderRightColor: '#cbd5e1' }}>Unit</th>
                        <th className="sticky left-[64px] z-30 bg-slate-100 border border-slate-300 px-3 py-2 text-left font-bold uppercase tracking-wider w-48" style={{ borderRightWidth: '2px', borderRightColor: '#cbd5e1' }}>Resident</th>
                        {MONTHS.map(m => (
                            <th key={m} className="border border-slate-300 px-2 py-2 text-center font-bold uppercase tracking-wider w-20">{m.slice(0, 3)}</th>
                        ))}
                        <th className="sticky right-[96px] z-20 bg-slate-50 border border-slate-300 px-3 py-2 text-right font-bold uppercase tracking-wider w-24" style={{ borderLeftWidth: '2px', borderLeftColor: '#cbd5e1' }}>Total</th>
                        <th className="sticky right-0 z-20 bg-slate-50 border border-slate-300 px-3 py-2 text-right font-bold uppercase tracking-wider w-24">Balance</th>
                    </tr>
                </thead>
                <tbody className="text-slate-700">
                    {data.map(apt => (
                        <tr
                            key={apt.apartmentId}
                            className={cn(
                                "group border-b border-slate-200 transition-colors even:bg-slate-50/50",
                                apt.apartmentId === highlightedId
                                    ? "bg-amber-50"
                                    : "hover:bg-blue-50/30"
                            )}
                        >
                            <td className={cn(
                                "sticky left-0 z-10 border border-slate-300 px-3 py-1.5 font-bold text-slate-900",
                                apt.apartmentId === highlightedId ? "bg-amber-100" : "bg-white"
                            )} style={{ borderRightWidth: '2px', borderRightColor: '#cbd5e1' }}>
                                {apt.unit}
                            </td>
                            <td className={cn(
                                "sticky left-[64px] z-10 border border-slate-300 px-3 py-1.5 font-medium text-slate-700 truncate max-w-[150px]",
                                apt.apartmentId === highlightedId ? "bg-amber-100" : "bg-white"
                            )} style={{ borderRightWidth: '2px', borderRightColor: '#cbd5e1' }}>
                                {apt.residentName || <span className="text-slate-400 italic">-- Unclaimed --</span>}
                            </td>
                            {MONTHS.map((_, idx) => {
                                const monthNum = idx + 1
                                const payment = apt.payments[monthNum]
                                const status = payment?.status || 'pending'

                                return (
                                    <td 
                                        key={idx} 
                                        className={cn(
                                            "border border-slate-300 text-center select-none h-8 transition-colors",
                                            status === 'paid' && "bg-emerald-50 text-emerald-700 font-mono font-bold",
                                            status === 'late' && "bg-rose-50 text-rose-800 font-bold",
                                            status === 'pending' && "text-slate-400 italic",
                                            !readOnly && activeTool && "cursor-crosshair hover:bg-blue-100",
                                            readOnly && "cursor-default"
                                        )}
                                        onClick={() => !readOnly && onCellClick(apt.apartmentId, idx)}
                                    >
                                        {status === 'paid' ? formatValue(payment?.amount || monthlyQuota) : status === 'late' ? "LATE" : "-"}
                                    </td>
                                )
                            })}
                            <td className="sticky right-[96px] z-10 border border-slate-300 px-3 py-1.5 text-right font-mono font-bold text-emerald-700 bg-slate-50" style={{ borderLeftWidth: '2px', borderLeftColor: '#cbd5e1' }}>
                                €{(apt.totalPaid / 100).toFixed(2)}
                            </td>
                            <td className={cn(
                                "sticky right-0 z-10 border border-slate-300 px-3 py-1.5 text-right font-mono font-bold bg-slate-50",
                                apt.balance > 0 ? "text-rose-600 bg-rose-50" : "text-slate-400"
                            )}>
                                €{(apt.balance / 100).toFixed(2)}
                            </td>
                        </tr>
                    ))}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan={MONTHS.length + 4} className="p-8 text-center text-slate-400 font-mono uppercase text-[10px] tracking-widest">
                                [ NO_RECORDS_FOUND ]
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
