"use client"

import { PaymentData } from "@/app/actions/payments"
import { cn } from "@/lib/utils"
import { Trash2, Check, AlertCircle } from "lucide-react"
import { MONTHS } from "@/lib/constants"
import { formatCurrency } from "@/lib/format"

interface PaymentMobileCardsProps {
    data: PaymentData[]
    readOnly: boolean
    activeTool: string | null
    highlightedId: number | null
    onCellClick: (aptId: number, monthIdx: number) => void
    onDelete: (aptId: number) => void
}

/**
 * Displays resident quota status in cards (Mobile).
 * NOT related to Stripe/SaaS subscriptions.
 */
export function PaymentMobileCards({
    data,
    readOnly,
    activeTool,
    highlightedId,
    onCellClick,
    onDelete
}: PaymentMobileCardsProps) {

    return (
        <div className="space-y-3 p-3">
            <div id="disabled-reason-readonly" className="sr-only">Disabled in read-only mode</div>
            <div id="disabled-reason-notool" className="sr-only">Select a tool from the header to mark status</div>
            {data.map(apt => {
                const hasDebt = apt.balance > 0

                return (
                    <div
                        key={apt.apartmentId}
                        className={cn(
                            "bg-white p-4 tech-border relative transition-all duration-300",
                            apt.apartmentId === highlightedId && "bg-amber-50 ring-1 ring-amber-300",
                            activeTool && !readOnly && "ring-1 ring-blue-200"
                        )}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start mb-3 pb-3 border-b border-slate-200">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unit</span>
                                <span className="text-xl font-bold text-slate-900">{apt.unit}</span>
                                {apt.residentName && (
                                    <span className="text-xs text-slate-500 font-medium mt-0.5">{apt.residentName}</span>
                                )}
                            </div>
                            <div className="flex items-start gap-2">
                                {/* Balance Badge */}
                                <div className={cn(
                                    "flex flex-col items-end px-2 py-1 rounded-sm",
                                    hasDebt ? "bg-rose-50 border border-rose-200" : "bg-emerald-50 border border-emerald-200"
                                )}>
                                    <span className={cn(
                                        "text-[9px] font-bold uppercase",
                                        hasDebt ? "text-rose-500" : "text-emerald-500"
                                    )}>Balance</span>
                                    <span className={cn(
                                        "text-sm font-bold font-mono",
                                        hasDebt ? "text-rose-600" : "text-emerald-600"
                                    )}>{formatCurrency(apt.balance)}</span>
                                </div>
                                {/* Delete Button */}
                                {!readOnly && (
                                    <button
                                        onClick={() => onDelete(apt.apartmentId)}
                                        className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-sm transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Month Grid - 4 columns */}
                        <div className="grid grid-cols-4 gap-2">
                            {MONTHS.map((m, idx) => {
                                const monthNum = idx + 1
                                const payment = apt.payments[monthNum]
                                const status = payment?.status || 'pending'

                                return (
                                    <button
                                        key={m}
                                        onClick={() => !readOnly && activeTool && onCellClick(apt.apartmentId, idx)}
                                        disabled={readOnly || !activeTool}
                                        aria-label={`${m} - ${apt.unit} - ${status === 'paid' ? 'Paid' : status === 'late' ? 'Late' : 'Pending'}`}
                                        aria-describedby={readOnly ? "disabled-reason-readonly" : !activeTool ? "disabled-reason-notool" : undefined}
                                        className={cn(
                                            "flex flex-col items-center justify-center py-2 px-1 tech-border transition-all rounded-sm",
                                            status === 'paid' && "bg-emerald-50 border-emerald-200 text-emerald-700",
                                            status === 'late' && "bg-rose-50 border-rose-200 text-rose-700",
                                            status === 'pending' && "bg-slate-50 border-slate-100 text-slate-400",
                                            !readOnly && activeTool ? "cursor-pointer active:scale-95" : "cursor-default"
                                        )}
                                    >
                                        <span className="text-[9px] uppercase font-bold tracking-tighter">{m.slice(0, 3)}</span>
                                        <div className="mt-1">
                                            {status === 'paid' && <Check className="w-3.5 h-3.5" />}
                                            {status === 'late' && <AlertCircle className="w-3.5 h-3.5" />}
                                            {status === 'pending' && <span className="text-[10px] font-medium">—</span>}
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )
            })}

            {data.length === 0 && (
                <div className="text-center py-12 text-slate-400 bg-slate-50 tech-border border-dashed uppercase font-mono text-[10px] tracking-widest">
                    [ NO_RECORDS_FOUND ]
                </div>
            )}
        </div>
    )
}
