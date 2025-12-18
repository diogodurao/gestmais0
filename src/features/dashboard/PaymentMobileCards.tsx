"use client"

import { PaymentData } from "@/app/actions/payments"
import { cn } from "@/components/ui/Button"
import { Check, AlertCircle, Clock, Trash2 } from "lucide-react"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

interface PaymentMobileCardsProps {
    data: PaymentData[]
    readOnly: boolean
    highlightedId: number | null
    onCellClick: (aptId: number, monthIdx: number, status: string, unit: string) => void
    onDelete: (aptId: number) => void
}

export function PaymentMobileCards({
    data,
    readOnly,
    highlightedId,
    onCellClick,
    onDelete
}: PaymentMobileCardsProps) {

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
            case 'late': return "bg-red-100 text-red-700 border-red-200 hover:bg-red-200"
            default: return "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid': return <Check className="w-3 h-3" />
            case 'late': return <AlertCircle className="w-3 h-3" />
            default: return null
        }
    }

    return (
        <div className="md:hidden space-y-4">
            {data.map(apt => (
                <div 
                    key={apt.apartmentId} 
                    className={cn(
                        "bg-white p-4 rounded-lg border shadow-sm relative transition-all duration-300",
                        apt.apartmentId === highlightedId 
                            ? "border-amber-400 ring-2 ring-amber-200 bg-amber-50" 
                            : "border-gray-200"
                    )}
                >
                    <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500 uppercase">Unit</span>
                            <span className="text-2xl font-bold text-gray-900">{apt.unit}</span>
                        </div>
                        {!readOnly && (
                            <button
                                onClick={() => onDelete(apt.apartmentId)}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-6 gap-y-4 gap-x-2">
                        {MONTHS.map((m, idx) => {
                            const monthNum = idx + 1
                            const status = apt.payments[monthNum] || 'pending'
                            return (
                                <div key={m} className="flex flex-col items-center gap-1">
                                    <span className="text-[10px] uppercase text-gray-400 font-medium">{m}</span>
                                    <button
                                        onClick={() => !readOnly && onCellClick(apt.apartmentId, idx, status, apt.unit)}
                                        disabled={readOnly}
                                        className={cn(
                                            "w-8 h-8 rounded-full inline-flex items-center justify-center transition-all border",
                                            getStatusColor(status),
                                            readOnly ? "cursor-default opacity-80" : "cursor-pointer"
                                        )}
                                    >
                                        {getStatusIcon(status)}
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>
            ))}
            {data.length === 0 && (
                <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    No apartments yet.
                </div>
            )}
        </div>
    )
}
