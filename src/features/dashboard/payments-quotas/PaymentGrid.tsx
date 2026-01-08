"use client"

import { useState, useEffect, useCallback, useMemo, useOptimistic, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"
import { updatePaymentStatus } from "@/app/actions/payments"
import { deleteApartment } from "@/app/actions/building"
import { PaymentDesktopTable } from "./PaymentDesktopTable"
import { PaymentMobileCards } from "./PaymentMobileCards"
import { PaymentGridHeader } from "./components/PaymentGridHeader"
import { PaymentGridToolbar } from "./components/PaymentGridToolbar"
import { PaymentGridFooter } from "./components/PaymentGridFooter"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { useToast } from "@/hooks/use-toast"
import { useAsyncAction } from "@/hooks/useAsyncAction"
import {
    type PaymentToolType,
    type PaymentFilterMode,
    type PaymentStats,
    type PaymentData
} from "@/lib/types"
import { PAYMENT_TOOL_TO_STATUS } from "@/lib/constants/ui"

interface PaymentGridProps {
    data: PaymentData[]
    monthlyQuota: number
    buildingId: string
    year: number
    readOnly?: boolean
}

export function PaymentGrid({
    data,
    monthlyQuota,
    buildingId,
    year,
    readOnly = false,
}: PaymentGridProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [isPending, startTransition] = useTransition()

    // 1. Native Optimistic State
    const [optimisticData, addOptimistic] = useOptimistic(
        data,
        (state: PaymentData[], action: { aptId: number; monthNum: number; status: string }) => {
            return state.map((apt) => {
                if (apt.apartmentId === action.aptId) {
                    const dbStatus = action.status
                    const newPayments = {
                        ...apt.payments,
                        [action.monthNum]: {
                            status: dbStatus,
                            amount: dbStatus === 'paid' ? monthlyQuota : 0
                        }
                    }

                    // Recalculate totals
                    const totalPaid = Object.values(newPayments).reduce((sum, p) =>
                        sum + (p.status === 'paid' ? (p.amount || monthlyQuota) : 0), 0
                    )
                    
                    const currentMonth = new Date().getMonth() + 1
                    // Only count up to current month for expected total, or full year? 
                    // Keeping logic consistent with previous implementation:
                    // If the previous code calculated balance based on elapsed months, we replicate that.
                    // Assuming simple logic: expected = currentMonth * quota (if active year is current)
                    // If viewing past year, expected is 12 * quota.
                    // For safety, let's assume the previous logic for balance was correct or handled in 'data' prop.
                    // Re-implementing simplified balance logic for optimistic UI:
                    const isCurrentYear = new Date().getFullYear() === year
                    const monthsToCount = isCurrentYear ? currentMonth : 12
                    const expectedTotal = monthsToCount * monthlyQuota
                    const balance = Math.max(0, expectedTotal - totalPaid)

                    return {
                        ...apt,
                        payments: newPayments,
                        totalPaid,
                        balance
                    }
                }
                return apt
            })
        }
    )

    const [searchTerm, setSearchTerm] = useState("")
    const [highlightedId, setHighlightedId] = useState<number | null>(null)

    const [activeTool, setActiveTool] = useState<PaymentToolType>(null)
    const [filterMode, setFilterMode] = useState<PaymentFilterMode>("all")
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)

    // Clear highlight after delay
    useEffect(() => {
        if (highlightedId !== null) {
            const timer = setTimeout(() => setHighlightedId(null), 3000)
            return () => clearTimeout(timer)
        }
    }, [highlightedId])

    // Delete action (Keep useAsyncAction for non-optimistic destructive actions)
    const { execute: removeApartment } = useAsyncAction(deleteApartment, {
        onSuccess: () => {
            router.refresh()
            toast({
                title: "Sucesso",
                description: "Fração removida com sucesso"
            })
        },
        onError: () => {
            toast({
                title: "Erro",
                description: "Não foi possível remover a fração",
                variant: "destructive"
            })
        }
    })

    // Filter and search logic (Use optimisticData)
    const filteredData = useMemo(() => {
        let result = optimisticData

        // Apply search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            result = result.filter(apt =>
                apt.unit.toLowerCase().includes(term) ||
                apt.residentName?.toLowerCase().includes(term)
            )
        }

        // Apply status filter
        if (filterMode !== "all") {
            result = result.filter(apt => {
                if (filterMode === "paid") return apt.balance === 0
                if (filterMode === "late") return apt.balance > 0
                if (filterMode === "pending") {
                    const hasAnyPending = Object.values(apt.payments).some(p => p.status === 'pending')
                    return hasAnyPending
                }
                return true
            })
        }

        return result
    }, [optimisticData, searchTerm, filterMode])

    // Calculate stats
    const stats = useMemo<PaymentStats>(() => {
        const totalCollected = optimisticData.reduce((acc, apt) => acc + apt.totalPaid, 0)
        const totalOverdue = optimisticData.reduce((acc, apt) => acc + apt.balance, 0)
        const paidCount = optimisticData.filter(apt => apt.balance === 0).length
        const overdueCount = optimisticData.filter(apt => apt.balance > 0).length
        return { totalCollected, totalOverdue, paidCount, overdueCount, total: optimisticData.length }
    }, [optimisticData])

    // Debounced cell click handler
    const handleCellClick = useDebouncedCallback(async (
        aptId: number,
        monthIdx: number
    ): Promise<void> => {
        if (!activeTool || readOnly) return

        const dbStatus = PAYMENT_TOOL_TO_STATUS[activeTool]
        const monthNum = monthIdx + 1

        // Use startTransition to wrap the Optimistic Update + Server Action
        startTransition(async () => {
            // 1. Update UI immediately
            addOptimistic({ aptId, monthNum, status: dbStatus })

            // 2. Call Server
            const result = await updatePaymentStatus(aptId, monthNum, year, dbStatus as any)

            if (result.success) {
                // If successful, router.refresh() fetches new data.
                // React detects the prop change and discards the optimistic state.
                router.refresh()
            } else {
                toast({
                    title: "Erro",
                    description: "Não foi possível atualizar o pagamento",
                    variant: "destructive"
                })
                // When transition ends without data update, UI reverts automatically
            }
        })
    }, 150)

    // Search handler
    const handleSearch = useCallback((e: React.FormEvent) => {
        e.preventDefault()
        if (!searchTerm) return

        const match = filteredData[0]
        if (match) {
            setHighlightedId(match.apartmentId)
            toast({
                title: "Fração encontrada",
                description: `${match.unit} - ${match.residentName || 'Sem residente'}`,
            })
        } else {
            toast({
                title: "Não encontrado",
                description: "Nenhuma fração corresponde à pesquisa",
                variant: "destructive"
            })
        }
    }, [searchTerm, filteredData, toast])

    // Delete handlers
    const handleDeleteClick = useCallback((aptId: number) => {
        setDeleteTargetId(aptId)
        setShowDeleteConfirm(true)
    }, [])

    const handleDeleteConfirm = async (): Promise<void> => {
        if (!deleteTargetId) return
        await removeApartment(deleteTargetId)
        setShowDeleteConfirm(false)
        setDeleteTargetId(null)
    }

    return (
        <div className="flex flex-col h-full min-h-0 bg-white tech-border overflow-hidden">
            <ConfirmModal
                isOpen={showDeleteConfirm}
                title="Eliminar Fração"
                message="Tem a certeza que deseja eliminar esta fração? Todos os pagamentos associados serão também eliminados. Esta ação é irreversível."
                onConfirm={handleDeleteConfirm}
                onCancel={() => setShowDeleteConfirm(false)}
                variant="danger"
                confirmLabel="Eliminar"
                cancelLabel="Cancelar"
            />

            <PaymentGridHeader
                year={year}
                stats={stats}
            />

            {!readOnly && (
                <PaymentGridToolbar
                    activeTool={activeTool}
                    onToolChange={setActiveTool}
                    filterMode={filterMode}
                    onFilterChange={setFilterMode}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onSearchSubmit={handleSearch}
                    isSaving={isPending}
                />
            )}

            {/* Content */}
            <div className="flex-1 overflow-auto relative">
                <PaymentDesktopTable
                    data={filteredData}
                    monthlyQuota={monthlyQuota}
                    readOnly={readOnly}
                    activeTool={activeTool}
                    highlightedId={highlightedId}
                    onCellClick={handleCellClick}
                    onDelete={handleDeleteClick}
                />

                <div className="md:hidden">
                    <PaymentMobileCards
                        data={filteredData}
                        monthlyQuota={monthlyQuota}
                        isEditing={!readOnly && !!activeTool}
                        activeTool={activeTool}
                        onCellClick={handleCellClick}
                    />
                </div>
            </div>

            <PaymentGridFooter />
        </div>
    )
}

export default PaymentGrid