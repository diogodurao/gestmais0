"use client"

import { useMemo, useRef, useEffect, useState } from 'react'
import { FixedSizeList as List, ListChildComponentProps } from 'react-window'

import { cn } from "@/lib/utils"
import { MONTHS_PT } from "@/lib/constants/timing"
import { PAYMENT_TABLE_LAYOUT } from "@/lib/constants/project"
import { formatCurrency } from "@/lib/format"
import { type PaymentToolType, type PaymentData } from "@/lib/types"

interface RowData {
    items: PaymentData[]
    monthlyQuota: number
    readOnly: boolean
    activeTool: PaymentToolType
    highlightedId: number | null
    onCellClick: (aptId: number, monthIdx: number) => void
}

const { CELL_WIDTH, UNIT_WIDTH, RESIDENT_WIDTH, TOTAL_WIDTH, ROW_HEIGHT } = PAYMENT_TABLE_LAYOUT

interface PaymentDesktopTableProps {
    data: PaymentData[]
    monthlyQuota: number
    readOnly: boolean
    activeTool: PaymentToolType
    highlightedId: number | null
    onCellClick: (aptId: number, monthIdx: number) => void
    onDelete: (aptId: number) => void
}

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

    // New Color Logic
    // Highlight (Search): Gold Light (var(--color-warning-light))
    // Row Hover: Gray 50 (var(--color-gray-50))
    return (
        <div
            style={style}
            className={cn(
                "group flex border-b border-[var(--color-gray-200)] transition-colors bg-white",
                isHighlighted ? "bg-[var(--color-warning-light)]" : "hover:bg-[var(--color-gray-50)]"
            )}
        >
            {/* Unit Cell - Sticky */}
            <div
                className={cn(
                    "sticky left-0 z-10 border-r border-[var(--color-gray-200)] px-3 font-semibold text-[var(--color-gray-800)] flex items-center text-[12px]",
                    isHighlighted ? "bg-[var(--color-warning-light)]" : "bg-white group-hover:bg-[var(--color-gray-50)]"
                )}
                style={{ width: UNIT_WIDTH, minWidth: UNIT_WIDTH }}
            >
                {apt.unit}
            </div>

            {/* Resident Cell - Sticky */}
            <div
                className={cn(
                    "sticky z-10 border-r border-[var(--color-gray-200)] px-3 text-[var(--color-gray-700)] truncate flex items-center text-[12px]",
                    isHighlighted ? "bg-[var(--color-warning-light)]" : "bg-white group-hover:bg-[var(--color-gray-50)]"
                )}
                style={{ left: UNIT_WIDTH, width: RESIDENT_WIDTH, minWidth: RESIDENT_WIDTH }}
            >
                {apt.residentName || <span className="text-[var(--color-gray-400)] italic text-[11px]">Sem residente</span>}
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
                        aria-label={`${monthName} - ${apt.unit} - ${status}`}
                        className={cn(
                            "border-r border-[var(--color-gray-200)] text-center text-[11px] font-mono transition-all flex items-center justify-center",
                            // Paid: Spring Rain Light (var(--color-primary-light)) + Dark Green Text
                            status === 'paid' && "bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] font-semibold",
                            // Late: Error Light (var(--color-error-light)) + Dark Red Text
                            status === 'late' && "bg-[var(--color-error-light)] text-[var(--color-error)] font-semibold",
                            // Pending: Gray Text
                            status === 'pending' && "text-[var(--color-gray-400)]",
                            
                            // Interactive States
                            isInteractive && "cursor-crosshair",
                            isInteractive && activeTool === 'paid' && "hover:bg-[var(--color-primary)] hover:text-white",
                            isInteractive && activeTool === 'late' && "hover:bg-[var(--color-error)] hover:text-white",
                            isInteractive && activeTool === 'clear' && "hover:bg-[var(--color-gray-600)] hover:text-white",
                            
                            !isInteractive && "cursor-default"
                        )}
                        style={{ width: CELL_WIDTH, minWidth: CELL_WIDTH }}
                    >
                        {status === 'paid' ? formatValue(payment?.amount || monthlyQuota) : status === 'late' ? "DÍVIDA" : "·"}
                    </button>
                )
            })}

            {/* Total Paid */}
            <div
                className="sticky z-10 border-l border-r border-[var(--color-gray-200)] px-3 text-right font-mono font-semibold text-[var(--color-primary-dark)] bg-[var(--color-gray-50)] flex items-center justify-end text-[12px]"
                style={{ right: TOTAL_WIDTH, width: TOTAL_WIDTH, minWidth: TOTAL_WIDTH }}
            >
                {formatCurrency(apt.totalPaid)}
            </div>

            {/* Balance */}
            <div
                className={cn(
                    "sticky right-0 z-10 px-3 text-right font-mono font-semibold flex items-center justify-end text-[12px]",
                    apt.balance > 0 ? "text-[var(--color-error)] bg-[var(--color-error-light)]" : "text-[var(--color-gray-400)] bg-[var(--color-gray-50)]"
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
    const [maxListHeight, setMaxListHeight] = useState(400)

    useEffect(() => {
        const updateHeight = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect()
                const availableHeight = window.innerHeight - rect.top - 60
                setMaxListHeight(Math.max(300, Math.min(availableHeight, 800)))
            }
        }
        updateHeight()
        window.addEventListener('resize', updateHeight)
        return () => window.removeEventListener('resize', updateHeight)
    }, [])

    const itemData = useMemo<RowData>(() => ({
        items: data,
        monthlyQuota,
        readOnly,
        activeTool,
        highlightedId,
        onCellClick,
    }), [data, monthlyQuota, readOnly, activeTool, highlightedId, onCellClick])

    const totalWidth = UNIT_WIDTH + RESIDENT_WIDTH + (CELL_WIDTH * 12) + (TOTAL_WIDTH * 2)
    const listHeight = Math.min(Math.max(data.length * ROW_HEIGHT, ROW_HEIGHT), maxListHeight)

    return (
        <div ref={containerRef} className="hidden md:block overflow-hidden border-b border-[var(--color-gray-200)] bg-white">
            <div className="overflow-x-auto custom-scrollbar">
                <div style={{ minWidth: totalWidth }}>
                    {/* Header */}
                    <div
                        className="flex bg-[var(--color-gray-50)] border-b border-[var(--color-gray-200)] text-[10px] font-bold uppercase tracking-wider text-[var(--color-gray-500)] sticky top-0 z-20"
                        style={{ height: 32 }}
                    >
                        <div
                            className="sticky left-0 z-30 bg-[var(--color-gray-50)] border-r border-[var(--color-gray-200)] px-3 flex items-center"
                            style={{ width: UNIT_WIDTH, minWidth: UNIT_WIDTH }}
                        >
                            Fração
                        </div>
                        <div
                            className="sticky z-30 bg-[var(--color-gray-50)] border-r border-[var(--color-gray-200)] px-3 flex items-center"
                            style={{ left: UNIT_WIDTH, width: RESIDENT_WIDTH, minWidth: RESIDENT_WIDTH }}
                        >
                            Residente
                        </div>
                        {MONTHS_PT.map(m => (
                            <div
                                key={m}
                                className="border-r border-[var(--color-gray-200)] flex items-center justify-center"
                                style={{ width: CELL_WIDTH, minWidth: CELL_WIDTH }}
                            >
                                {m.slice(0, 3)}
                            </div>
                        ))}
                        <div
                            className="sticky z-30 bg-[var(--color-gray-50)] border-l border-r border-[var(--color-gray-200)] px-3 flex items-center justify-end text-[var(--color-primary-dark)]"
                            style={{ right: TOTAL_WIDTH, width: TOTAL_WIDTH, minWidth: TOTAL_WIDTH }}
                        >
                            Pago
                        </div>
                        <div
                            className="sticky right-0 z-30 bg-[var(--color-gray-50)] px-3 flex items-center justify-end text-right text-[var(--color-error)]"
                            style={{ width: TOTAL_WIDTH, minWidth: TOTAL_WIDTH }}
                        >
                            Dívida
                        </div>
                    </div>

                    {/* Content */}
                    {data.length > 0 ? (
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
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-white">
                            <p className="text-[11px] font-medium text-[var(--color-gray-400)] uppercase tracking-wider">
                                Sem resultados
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}