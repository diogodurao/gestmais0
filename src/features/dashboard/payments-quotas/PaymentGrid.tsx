"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { updatePaymentStatus, PaymentData, PaymentStatus } from "@/app/actions/payments"
import { deleteApartment } from "@/app/actions/building"
import { Search } from "lucide-react"
import { PaymentDesktopTable } from "./PaymentDesktopTable"
import { PaymentMobileCards } from "./PaymentMobileCards"
import { cn } from "@/lib/utils"
// import { t } from "@/lib/translations"
import { Dictionary } from "@/types/i18n"
import { formatCurrency } from "@/lib/format"
import { useToast } from "@/hooks/use-toast"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { useAsyncAction } from "@/hooks/useAsyncAction"

/**
 * ============================================================================
 * RESIDENT QUOTA PAYMENTS (MANAGEMENT GRID)
 * ============================================================================
 * This component is for managers to track if residents have paid their monthly
 * condominium fees. It updates the 'payments' table.
 * 
 * IT IS NOT RELATED TO THE STRIPE SUBSCRIPTION / SAAS PAYMENTS.
 */
export function PaymentGrid({
    data,
    monthlyQuota,
    buildingId,
    year,
    readOnly = false,
    dictionary
}: {
    data: PaymentData[],
    monthlyQuota: number,
    buildingId: string,
    year: number,
    readOnly?: boolean
    dictionary: Dictionary
}) {
    const router = useRouter()
    const { toast } = useToast()
    const [searchTerm, setSearchTerm] = useState("")
    const [highlightedId, setHighlightedId] = useState<number | null>(null)
    const [activeTool, setActiveTool] = useState<PaymentStatus | 'clear' | null>(null)
    const [mounted, setMounted] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)

    const { execute: updateStatus, isPending: isSaving } = useAsyncAction(updatePaymentStatus, {
        onSuccess: () => router.refresh(),
        errorMessage: dictionary.common.error
    })

    const { execute: removeApartment } = useAsyncAction(deleteApartment, {
        onSuccess: () => router.refresh(),
        successMessage: dictionary.extraPayment.deleteSuccess,
        errorMessage: dictionary.common.error
    })

    useEffect(() => {
        setMounted(true)
        if (highlightedId !== null) {
            const timer = setTimeout(() => setHighlightedId(null), 3000)
            return () => clearTimeout(timer)
        }
    }, [highlightedId])

    const filteredData = data.filter(apt =>
        apt.unit.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (!searchTerm) return
        const match = filteredData[0]
        if (match) setHighlightedId(match.apartmentId)
    }

    const handleDeleteClick = (aptId: number) => {
        setDeleteTargetId(aptId)
        setShowDeleteConfirm(true)
    }

    const handleDeleteConfirm = async (): Promise<void> => {
        if (!deleteTargetId) return
        await removeApartment(deleteTargetId)
        setShowDeleteConfirm(false)
        setDeleteTargetId(null)
    }

    const handleCellClick = async (aptId: number, monthIdx: number): Promise<void> => {
        if (!activeTool) return
        const status = activeTool === 'clear' ? 'pending' : activeTool
        await updateStatus(aptId, monthIdx + 1, year, status as PaymentStatus)
    }

    const totalCollected = data.reduce((acc, apt) => acc + apt.totalPaid, 0)
    const totalOverdue = data.reduce((acc, apt) => acc + apt.balance, 0)


    return (
        <div className="flex flex-col h-full min-h-0 bg-white tech-border overflow-hidden">
            <ConfirmModal
                isOpen={showDeleteConfirm}
                title={dictionary.paymentGrid.deleteApartment}
                message={dictionary.paymentGrid.deleteMessage}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setShowDeleteConfirm(false)}
                variant="danger"
            />
            <header className="bg-white border-b border-slate-300 flex flex-col shrink-0 z-30">
                {/* Top row - Title and Stats */}
                <div className="h-12 flex items-center px-4 justify-between">
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm leading-tight">{dictionary.paymentGrid.masterLedger}</span>
                        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">{year} {dictionary.paymentGrid.financialYear}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-sm">
                            <span className="text-[8px] sm:text-[9px] font-bold uppercase hidden xs:inline">{dictionary.paymentGrid.collected}</span>
                            <span className="font-mono font-bold text-[10px] sm:text-xs">{formatCurrency(totalCollected)}</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-sm">
                            <span className="text-[8px] sm:text-[9px] font-bold uppercase hidden xs:inline">{dictionary.paymentGrid.overdue}</span>
                            <span className="font-mono font-bold text-[10px] sm:text-xs">{formatCurrency(totalOverdue)}</span>
                        </div>
                    </div>
                </div>

                {/* Bottom row - Tools (only if not readOnly) */}
                {!readOnly && (
                    <div className="h-10 flex items-center px-4 gap-3 border-t border-slate-100 bg-slate-50/50 overflow-x-auto">
                        <div className="flex bg-slate-100 p-0.5 rounded-sm border border-slate-200 shrink-0">
                            <button
                                onClick={() => setActiveTool(activeTool === 'paid' ? null : 'paid')}
                                className={cn(
                                    "px-2 sm:px-3 py-1 rounded-sm font-semibold text-[10px] sm:text-[11px] transition-colors whitespace-nowrap",
                                    activeTool === 'paid' ? "bg-emerald-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
                                )}
                            >
                                <span className="hidden sm:inline">Marcar </span>{dictionary.extraPayment.paid}
                            </button>
                            <button
                                onClick={() => setActiveTool(activeTool === 'overdue' ? null : 'overdue')}
                                className={cn(
                                    "px-2 sm:px-3 py-1 rounded-sm font-semibold text-[10px] sm:text-[11px] transition-colors whitespace-nowrap",
                                    activeTool === 'overdue' ? "bg-rose-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
                                )}
                            >
                                <span className="hidden sm:inline">Marcar </span>{dictionary.extraPayment.overdue}
                            </button>
                            <button
                                onClick={() => setActiveTool(activeTool === 'clear' ? null : 'clear')}
                                className={cn(
                                    "px-2 sm:px-3 py-1 rounded-sm font-semibold text-[10px] sm:text-[11px] transition-colors whitespace-nowrap",
                                    activeTool === 'clear' ? "bg-slate-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
                                )}
                            >
                                {dictionary.paymentGrid.clear}
                            </button>
                        </div>

                        <form onSubmit={handleSearch} className="relative shrink-0">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                            <input
                                placeholder={dictionary.paymentGrid.search}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-white border border-slate-200 text-[10px] pl-7 pr-2 py-1 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-20 sm:w-28 uppercase"
                            />
                        </form>
                    </div>
                )}
            </header>

            <div className="flex-1 overflow-auto relative">
                {/* Desktop Table - hidden on mobile */}
                <div className="hidden md:block h-full">
                    <PaymentDesktopTable
                        data={filteredData}
                        monthlyQuota={monthlyQuota}
                        readOnly={readOnly}
                        activeTool={activeTool}
                        highlightedId={highlightedId}
                        onCellClick={handleCellClick}
                        onDelete={handleDeleteClick}
                        dictionary={dictionary}
                    />
                </div>

                {/* Mobile Cards - shown only on mobile */}
                <div className="md:hidden">
                    <PaymentMobileCards
                        data={filteredData}
                        readOnly={readOnly}
                        activeTool={activeTool}
                        highlightedId={highlightedId}
                        onCellClick={handleCellClick}
                        onDelete={handleDeleteClick}
                        dictionary={dictionary}
                    />
                </div>
            </div>

            <footer className="bg-slate-50 border-t border-slate-300 p-2 flex flex-wrap items-center gap-2 md:gap-4 text-[10px] text-slate-500 shrink-0">
                <span className="font-bold text-slate-700">{dictionary.paymentGrid.legend}</span>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-emerald-50 border border-emerald-200"></div> {dictionary.extraPayment.paid.toUpperCase()}</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-rose-50 border border-rose-200"></div> {dictionary.extraPayment.overdue.toUpperCase()}</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-white border border-slate-200"></div> {dictionary.extraPayment.pending.toUpperCase()}</div>

                {!readOnly && activeTool && (
                    <div className="flex items-center gap-2 animate-pulse basis-full md:basis-auto md:ml-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        <span className="font-bold text-blue-600 uppercase text-[9px]">{dictionary.paymentGrid.editTap} {activeTool.toUpperCase()}</span>
                    </div>
                )}

                <div className="ml-auto font-mono text-[9px] uppercase hidden sm:block">
                    {dictionary.paymentGrid.refreshed} {mounted ? new Date().toLocaleTimeString() : "--:--:--"}
                </div>
            </footer>
        </div>
    )
}