"use client"

import { PaymentData } from "@/app/actions/payments"
import { cn } from "@/lib/utils"
// import { Trash2 } from "lucide-react" // Not used in current implementation
import { MONTHS } from "@/lib/constants"
import { formatCurrency } from "@/lib/format"
import { List, RowComponentProps } from 'react-window'
import { memo, useMemo } from 'react'

interface PaymentDesktopTableProps {
    data: PaymentData[]
    monthlyQuota: number
    readOnly: boolean
    activeTool: string | null
    highlightedId: number | null
    onCellClick: (aptId: number, monthIdx: number) => void
    onDelete: (aptId: number) => void
}

interface RowData {
    data: PaymentData[]
    monthlyQuota: number
    readOnly: boolean
    activeTool: string | null
    highlightedId: number | null
    onCellClick: (aptId: number, monthIdx: number) => void
    formatValue: (cents: number) => string
}

const ApartmentRow = ({ index, style, ...itemData }: RowComponentProps<RowData>) => {
    const { data: list, monthlyQuota, readOnly, activeTool, highlightedId, onCellClick, formatValue } = itemData
    const apt = list[index]
    if (!apt) return <></>

    return (
        <div
            style={style}
            className={cn(
                "group flex border-b border-slate-200 transition-colors even:bg-slate-50/50",
                apt.apartmentId === highlightedId
                    ? "bg-amber-50"
                    : "hover:bg-blue-50/30"
            )}
        >
            <div className={cn(
                "sticky left-0 z-10 border-r border-slate-300 px-3 py-1.5 font-bold text-slate-900 w-16 shrink-0 flex items-center",
                apt.apartmentId === highlightedId ? "bg-amber-100" : "bg-white"
            )} style={{ borderRightWidth: '2px', borderRightColor: '#cbd5e1' }}>
                {apt.unit}
            </div>
            <div className={cn(
                "sticky left-[64px] z-10 border-r border-slate-300 px-3 py-1.5 font-medium text-slate-700 truncate w-48 shrink-0 flex items-center",
                apt.apartmentId === highlightedId ? "bg-amber-100" : "bg-white"
            )} style={{ borderRightWidth: '2px', borderRightColor: '#cbd5e1' }}>
                <span className="truncate">{apt.residentName || <span className="text-slate-400 italic">-- Unclaimed --</span>}</span>
            </div>
            {MONTHS.map((_, idx) => {
                const monthNum = idx + 1
                const payment = apt.payments[monthNum]
                const status = payment?.status || 'pending'

                return (
                    <div
                        key={idx}
                        role={!readOnly && activeTool ? "button" : undefined}
                        tabIndex={!readOnly && activeTool ? 0 : undefined}
                        aria-label={`${MONTHS[idx]} - ${apt.unit} - Current Status: ${status === 'paid' ? 'Paid' : status === 'late' ? 'Late' : 'Pending'}${!readOnly && activeTool ? `. Click to mark as ${activeTool}` : ''}`}
                        className={cn(
                            "border-r border-slate-300 text-center select-none h-full transition-colors w-20 shrink-0 flex items-center justify-center",
                            status === 'paid' && "bg-emerald-50 text-emerald-700 font-mono font-bold",
                            status === 'late' && "bg-rose-50 text-rose-800 font-bold",
                            status === 'pending' && "text-slate-400 italic",
                            !readOnly && activeTool && "cursor-crosshair hover:bg-blue-100",
                            readOnly && "cursor-default"
                        )}
                        onClick={() => !readOnly && onCellClick(apt.apartmentId, idx)}
                    >
                        {status === 'paid' ? formatValue(payment?.amount || monthlyQuota) : status === 'late' ? "LATE" : "-"}
                    </div>
                )
            })}
            <div className="sticky right-[96px] z-10 border-l border-slate-300 border-r border-slate-300 px-3 py-1.5 text-right font-mono font-bold text-emerald-700 bg-slate-50 w-24 shrink-0 flex items-center justify-end" style={{ borderLeftWidth: '2px', borderLeftColor: '#cbd5e1', borderRightWidth: '2px', borderRightColor: '#cbd5e1' }}>
                {formatCurrency(apt.totalPaid)}
            </div>
            <div className={cn(
                "sticky right-0 z-10 px-3 py-1.5 text-right font-mono font-bold bg-slate-50 w-24 shrink-0 flex items-center justify-end",
                apt.balance > 0 ? "text-rose-600 bg-rose-50" : "text-slate-400"
            )}>
                {formatCurrency(apt.balance)}
            </div>
        </div>
    )
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
        return `€${Math.round(cents / 100)}`
    }

    const itemData = useMemo(() => ({
        data,
        monthlyQuota,
        readOnly,
        activeTool,
        highlightedId,
        onCellClick,
        formatValue
    }), [data, monthlyQuota, readOnly, activeTool, highlightedId, onCellClick])

    if (data.length === 0) {
        return (
            <div className="hidden md:block border border-slate-200 rounded-lg bg-white p-8 text-center text-slate-400 font-mono uppercase text-[10px] tracking-widest">
                [ NO_RECORDS_FOUND ]
            </div>
        )
    }

    return (
        <div className="hidden md:block overflow-x-auto h-full border border-slate-200 rounded-lg bg-white">
            <div style={{ width: 1408, display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <div className="flex bg-slate-100 border-b border-slate-300 text-[11px] font-bold uppercase tracking-wider text-slate-700 sticky top-0 z-20">
                    <div className="sticky left-0 z-30 bg-slate-100 border-r border-slate-300 px-3 py-2 w-16 shrink-0" style={{ borderRightWidth: '2px', borderRightColor: '#cbd5e1' }}>Unit</div>
                    <div className="sticky left-[64px] z-30 bg-slate-100 border-r border-slate-300 px-3 py-2 w-48 shrink-0" style={{ borderRightWidth: '2px', borderRightColor: '#cbd5e1' }}>Resident</div>
                    {MONTHS.map(m => (
                        <div key={m} className="border-r border-slate-300 px-2 py-2 text-center w-20 shrink-0">{m.slice(0, 3)}</div>
                    ))}
                    <div className="sticky right-[96px] z-30 bg-slate-50 border-l border-slate-300 border-r border-slate-300 px-3 py-2 w-24 shrink-0 text-right" style={{ borderLeftWidth: '2px', borderLeftColor: '#cbd5e1', borderRightWidth: '2px', borderRightColor: '#cbd5e1' }}>Total</div>
                    <div className="sticky right-0 z-30 bg-slate-50 px-3 py-2 w-24 shrink-0 text-right">Balance</div>
                </div>
                {/* Body */}
                <List
                    style={{ height: 600 }}
                    rowCount={data.length}
                    rowHeight={36}
                    rowProps={itemData}
                    rowComponent={ApartmentRow}
                    className="overflow-y-auto"
                />
            </div>
        </div>
    )
}
