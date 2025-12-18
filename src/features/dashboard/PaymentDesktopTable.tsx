"use client"

import { PaymentData } from "@/app/actions/payments"
import { cn } from "@/components/ui/Button"
import { Check, AlertCircle, Clock, Trash2 } from "lucide-react"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

interface PaymentDesktopTableProps {
    data: PaymentData[]
    readOnly: boolean
    loadingCell: string | null
    highlightedId: number | null
    onCellClick: (aptId: number, monthIdx: number, status: string, unit: string) => void
    onDelete: (aptId: number) => void
}

export function PaymentDesktopTable({
    data,
    readOnly,
    loadingCell,
    highlightedId,
    onCellClick,
    onDelete
}: PaymentDesktopTableProps) {

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
        <div className="hidden md:block border border-gray-200 rounded-lg overflow-x-auto bg-white shadow-sm">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-4 py-3 font-medium sticky left-0 bg-gray-50 z-10 w-24">Unit</th>
                        {MONTHS.map(m => (
                            <th key={m} className="px-2 py-3 text-center min-w-[3rem]">{m}</th>
                        ))}
                        {!readOnly && <th className="px-2 py-3 text-center w-10"></th>}
                    </tr>
                </thead>
                <tbody>
                    {data.map(apt => (
                        <tr 
                            key={apt.apartmentId} 
                            className={cn(
                                "border-b border-gray-100 transition-colors group",
                                apt.apartmentId === highlightedId 
                                    ? "bg-amber-50 ring-2 ring-inset ring-amber-200 z-20" 
                                    : "hover:bg-gray-50/50"
                            )}
                        >
                            <td className={cn(
                                "px-4 py-2 font-medium sticky left-0 z-10 border-r border-gray-100",
                                apt.apartmentId === highlightedId ? "bg-amber-50" : "bg-white"
                            )}>
                                {apt.unit}
                            </td>
                            {MONTHS.map((_, idx) => {
                                const monthNum = idx + 1
                                const status = apt.payments[monthNum] || 'pending'

                                return (
                                    <td key={idx} className="p-1 text-center">
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
                                    </td>
                                )
                            })}
                            {!readOnly && (
                                <td className="px-2 text-center">
                                    <button
                                        onClick={() => onDelete(apt.apartmentId)}
                                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Delete Apartment"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan={14} className="px-6 py-12 text-center text-gray-400">
                                No apartments yet. Click "Add Apartment" to get started.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
