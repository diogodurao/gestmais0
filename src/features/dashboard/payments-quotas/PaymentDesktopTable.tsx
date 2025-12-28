"use client"

import { useMemo, useRef, useEffect, useState } from 'react'
import { FixedSizeList as List, ListChildComponentProps } from 'react-window'
import { PaymentData } from "@/app/actions/payments"
import { cn } from "@/lib/utils"
import { MONTHS_PT } from "@/lib/constants"
import { formatCurrency } from "@/lib/format"
import { type ToolType, type RowData } from "./types"

// Layout constants
const CELL_WIDTH = 72
const UNIT_WIDTH = 64
const RESIDENT_WIDTH = 160
const TOTAL_WIDTH = 88
const ROW_HEIGHT = 36

interface PaymentDesktopTableProps {
    data: PaymentData[]
    monthlyQuota: number
    readOnly: boolean
    activeTool: ToolType
    highlightedId: number | null
    onCellClick: (aptId: number, monthIdx: number) => void
    onDelete: (aptId: number) => void
}

/**
 * Individual apartment row component for virtualized list
 */
function ApartmentRow({ index, style, data }: ListChildComponentProps<RowData>) {
    const { items, monthlyQuota, readOnly, activeTool, highlightedId, onCellClick } = data
    const apt = items[index]
    if (!apt) return null

    const formatValue = (cents: number) => {
        if (cents === 0) return "-"
        return `€${Math.round(cents / 100)}`
    }

    const isHighlighted = apt.apartmentId === highlightedId
    const isInteractive = !readOnly && activeTool

    return (
        <div
            style={style}
            className={cn(
                "group flex border-b border-slate-200 transition-colors",
                index % 2 === 1 && "bg-slate-50/50",
                isHighlighted ? "bg-amber-50" : "hover:bg-blue-50/30"
            )}
        >
            {/* Unit Cell - Sticky */}
            <div 
                className={cn(
                    "sticky left-0 z-10 border-r-2 border-slate-300 px-2 font-bold text-slate-900 flex items-center text-xs",
                    isHighlighted ? "bg-amber-100" : "bg-white group-hover:bg-blue-50/30"
                )}
                style={{ width: UNIT_WIDTH, minWidth: UNIT_WIDTH }}
            >
                {apt.unit}
            </div>
            
            {/* Resident Cell - Sticky */}
            <div 
                className={cn(
                    "sticky z-10 border-r-2 border-slate-300 px-2 text-slate-700 truncate flex items-center text-xs",
                    isHighlighted ? "bg-amber-100" : "bg-white group-hover:bg-blue-50/30"
                )}
                style={{ left: UNIT_WIDTH, width: RESIDENT_WIDTH, minWidth: RESIDENT_WIDTH }}
            >
                {apt.residentName || <span className="text-slate-400 italic text-[10px]">Sem residente</span>}
            </div>
            
            {/* Month Cells */}
            {MONTHS_PT.map((monthName, idx) => {
                const monthNum = idx + 1
                const payment = apt.payments[monthNum]
                const status = payment?.status || 'pending'

                return (
                    <button
                        key={idx}
                        type="button"
                        disabled={!isInteractive}
                        onClick={() => isInteractive && onCellClick(apt.apartmentId, idx)}
                        aria-label={`${monthName} - ${apt.unit} - ${status === 'paid' ? 'Pago' : status === 'late' ? 'Em atraso' : 'Pendente'}`}
                        className={cn(
                            "border-r border-slate-200 text-center text-[10px] font-mono transition-all flex items-center justify-center",
                            status === 'paid' && "bg-emerald-50 text-emerald-700 font-bold",
                            status === 'late' && "bg-rose-50 text-rose-700 font-bold",
                            status === 'pending' && "text-slate-400",
                            isInteractive && "cursor-crosshair hover:ring-2 hover:ring-inset hover:ring-blue-400",
                            !isInteractive && "cursor-default"
                        )}
                        style={{ width: CELL_WIDTH, minWidth: CELL_WIDTH }}
                    >
                        {status === 'paid' ? formatValue(payment?.amount || monthlyQuota) : status === 'late' ? "DÍVIDA" : "-"}
                    </button>
                )
            })}
            
            {/* Total Paid - Sticky Right */}
            <div 
                className="sticky z-10 border-l-2 border-r border-slate-300 px-2 text-right font-mono font-bold text-emerald-700 bg-slate-50 flex items-center justify-end text-xs"
                style={{ right: TOTAL_WIDTH, width: TOTAL_WIDTH, minWidth: TOTAL_WIDTH }}
            >
                {formatCurrency(apt.totalPaid)}
            </div>
            
            {/* Balance - Sticky Right */}
            <div 
                className={cn(
                    "sticky right-0 z-10 px-2 text-right font-mono font-bold flex items-center justify-end text-xs",
                    apt.balance > 0 ? "text-rose-600 bg-rose-50" : "text-slate-400 bg-slate-50"
                )}
                style={{ width: TOTAL_WIDTH, minWidth: TOTAL_WIDTH }}
            >
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
}: PaymentDesktopTableProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [listHeight, setListHeight] = useState(400)

    // Calculate dynamic height based on container
    useEffect(() => {
        const updateHeight = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect()
                const availableHeight = window.innerHeight - rect.top - 100
                setListHeight(Math.max(300, Math.min(availableHeight, 600)))
            }
        }
        
        updateHeight()
        window.addEventListener('resize', updateHeight)
        return () => window.removeEventListener('resize', updateHeight)
    }, [])

    // Memoize row data to prevent unnecessary re-renders
    const itemData = useMemo<RowData>(() => ({
        items: data,
        monthlyQuota,
        readOnly,
        activeTool,
        highlightedId,
        onCellClick,
    }), [data, monthlyQuota, readOnly, activeTool, highlightedId, onCellClick])

    const totalWidth = UNIT_WIDTH + RESIDENT_WIDTH + (CELL_WIDTH * 12) + (TOTAL_WIDTH * 2)

    // Empty state
    if (data.length === 0) {
        return (
            <div className="hidden md:flex items-center justify-center h-64 border border-dashed border-slate-300 bg-slate-50/50 rounded-sm m-4">
                <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        [ Sem frações registadas ]
                    </p>
                    <p className="text-[9px] text-slate-400 mt-1">
                        Adicione frações nas definições
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div ref={containerRef} className="hidden md:block overflow-hidden border-b border-slate-200 bg-white">
            <div className="overflow-x-auto">
                <div style={{ minWidth: totalWidth }}>
                    {/* Header */}
                    <div 
                        className="flex bg-slate-100 border-b-2 border-slate-300 text-[9px] font-bold uppercase tracking-wider text-slate-600 sticky top-0 z-20"
                        style={{ height: ROW_HEIGHT }}
                    >
                        <div 
                            className="sticky left-0 z-30 bg-slate-100 border-r-2 border-slate-300 px-2 flex items-center"
                            style={{ width: UNIT_WIDTH, minWidth: UNIT_WIDTH }}
                        >
                            Fração
                        </div>
                        <div 
                            className="sticky z-30 bg-slate-100 border-r-2 border-slate-300 px-2 flex items-center"
                            style={{ left: UNIT_WIDTH, width: RESIDENT_WIDTH, minWidth: RESIDENT_WIDTH }}
                        >
                            Residente
                        </div>
                        {MONTHS_PT.map(m => (
                            <div 
                                key={m} 
                                className="border-r border-slate-200 flex items-center justify-center"
                                style={{ width: CELL_WIDTH, minWidth: CELL_WIDTH }}
                            >
                                {m}
                            </div>
                        ))}
                        <div 
                            className="sticky z-30 bg-slate-50 border-l-2 border-r border-slate-300 px-2 flex items-center justify-end"
                            style={{ right: TOTAL_WIDTH, width: TOTAL_WIDTH, minWidth: TOTAL_WIDTH }}
                        >
                            Pago
                        </div>
                        <div 
                            className="sticky right-0 z-30 bg-slate-50 px-2 flex items-center justify-end"
                            style={{ width: TOTAL_WIDTH, minWidth: TOTAL_WIDTH }}
                        >
                            Dívida
                        </div>
                    </div>
                    
                    {/* Virtualized Body - Correct react-window API */}
                    <List
                        height={listHeight}
                        itemCount={data.length}
                        itemSize={ROW_HEIGHT}
                        itemData={itemData}
                        width="100%"
                        overscanCount={5}
                    >
                        {ApartmentRow}
                    </List>
                </div>
            </div>
        </div>
    )
}